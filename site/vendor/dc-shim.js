/*
 * CRUZ DC runtime shim — makes the *.dc.html Design Component prototypes run
 * standalone in a browser, on top of vendored React 18 (concatenated before
 * this file in support.js).
 *
 * Contract implemented (surveyed from the CRUZ prototypes):
 *   - <x-dc> wraps the template; <helmet> children move to <head>.
 *   - <script type="text/x-dc" data-dc-script> holds `class Component extends DCLogic`.
 *     Optional data-props JSON supplies default props (each spec's `default`).
 *   - {{ expr }} interpolation in text and attributes. Scope resolution:
 *     sc-for locals → renderVals() result → this.state → component instance → globals.
 *   - <sc-if value="{{ expr }}"> conditional children.
 *   - <sc-for list="{{ arr }}" as="x"> repeated children.
 *   - onClick/onInput/onKeyDown/... event props; ref="{{ callback }}";
 *     dangerouslySetInnerHTML="{{ htmlOrElement }}"; style-hover="css".
 *   - DCLogic provides setState / props / lifecycle — it IS React.Component.
 */
(function () {
  'use strict';
  var React = window.React, ReactDOM = window.ReactDOM;

  // Hide the raw template until React takes over (avoids a flash of {{ }}).
  try {
    var hideCss = document.createElement('style');
    hideCss.textContent = 'x-dc{display:none}';
    (document.head || document.documentElement).appendChild(hideCss);
  } catch (e) {}

  /* ---------------- expression evaluation ---------------- */

  var exprCache = Object.create(null);
  function compileExpr(src) {
    var fn = exprCache[src];
    if (!fn) {
      try {
        fn = new Function('__s', 'with(__s){return(' + src + ')}');
      } catch (err) {
        console.error('[dc-shim] bad expression: ' + src, err);
        fn = function () { return undefined; };
      }
      exprCache[src] = fn;
    }
    return fn;
  }

  function makeScope(inst, vals, locals) {
    return new Proxy({}, {
      has: function () { return true; },
      get: function (_, key) {
        if (typeof key === 'symbol') return undefined;
        if (locals && key in locals) return locals[key];
        if (vals && key in vals) return vals[key];
        if (inst.state && key in inst.state) return inst.state[key];
        var v = inst[key];
        if (v !== undefined) return typeof v === 'function' ? v.bind(inst) : v;
        return window[key];
      },
      set: function (_, key, value) { inst[key] = value; return true; }
    });
  }

  function evalExpr(src, inst, vals, locals) {
    try {
      return compileExpr(src)(makeScope(inst, vals, locals));
    } catch (err) {
      console.error('[dc-shim] expression failed: ' + src, err);
      return undefined;
    }
  }

  var loadedImports = Object.create(null);

  var MUSTACHE = /\{\{\s*([\s\S]*?)\s*\}\}/g;
  var WHOLE_MUSTACHE = /^\{\{\s*([\s\S]*?)\s*\}\}$/;

  function hasMustache(s) { return s.indexOf('{{') !== -1; }

  // "a {{ b }} c" -> list of static strings and {expr} parts
  function splitMustache(s) {
    var parts = [], last = 0, m;
    MUSTACHE.lastIndex = 0;
    while ((m = MUSTACHE.exec(s))) {
      if (m.index > last) parts.push(s.slice(last, m.index));
      parts.push({ expr: m[1] });
      last = m.index + m[0].length;
    }
    if (last < s.length) parts.push(s.slice(last));
    return parts;
  }

  function interpolateString(parts, inst, vals, locals) {
    var out = '';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (typeof p === 'string') { out += p; continue; }
      var v = evalExpr(p.expr, inst, vals, locals);
      out += (v == null ? '' : String(v));
    }
    return out;
  }

  /* ---------------- style handling ---------------- */

  // Split a CSS declaration string on top-level semicolons (paren-aware).
  function splitDecls(css) {
    var decls = [], depth = 0, cur = '';
    for (var i = 0; i < css.length; i++) {
      var ch = css[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === ';' && depth === 0) { decls.push(cur); cur = ''; }
      else cur += ch;
    }
    if (cur.trim()) decls.push(cur);
    return decls;
  }

  function cssKeyToReact(key) {
    key = key.trim();
    if (key.slice(0, 2) === '--') return key; // custom property
    // -webkit-foo -> WebkitFoo ; foo-bar -> fooBar
    var camel = key.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
    if (key[0] === '-') camel = camel.charAt(0).toUpperCase() + camel.slice(1);
    return camel;
  }

  function styleToObject(css) {
    var obj = {};
    var decls = splitDecls(css);
    for (var i = 0; i < decls.length; i++) {
      var d = decls[i];
      var idx = d.indexOf(':');
      if (idx < 0) continue;
      var k = d.slice(0, idx).trim();
      var v = d.slice(idx + 1).trim();
      if (!k || !v) continue;
      obj[cssKeyToReact(k)] = v;
    }
    return obj;
  }

  /* ---------------- attribute mapping ---------------- */

  var ATTR_MAP = {
    'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex',
    'colspan': 'colSpan', 'rowspan': 'rowSpan', 'readonly': 'readOnly',
    'maxlength': 'maxLength', 'autocomplete': 'autoComplete',
    'autofocus': 'autoFocus', 'spellcheck': 'spellCheck',
    'contenteditable': 'contentEditable', 'crossorigin': 'crossOrigin',
    'srcset': 'srcSet', 'novalidate': 'noValidate'
  };

  var EVENT_MAP = {
    onclick: 'onClick', ondblclick: 'onDoubleClick',
    // native `input` event ≙ React onChange; mapping keeps value-bound inputs live
    oninput: 'onChange', onchange: 'onChange',
    onkeydown: 'onKeyDown', onkeyup: 'onKeyUp', onkeypress: 'onKeyPress',
    onfocus: 'onFocus', onblur: 'onBlur', onsubmit: 'onSubmit',
    onmouseenter: 'onMouseEnter', onmouseleave: 'onMouseLeave',
    onmousedown: 'onMouseDown', onmouseup: 'onMouseUp', onmousemove: 'onMouseMove',
    onpointerdown: 'onPointerDown', onpointerup: 'onPointerUp', onpointermove: 'onPointerMove',
    onscroll: 'onScroll', onwheel: 'onWheel', oncontextmenu: 'onContextMenu',
    ondrop: 'onDrop', ondragstart: 'onDragStart', ondragover: 'onDragOver',
    ondragend: 'onDragEnd', ondragleave: 'onDragLeave', ondragenter: 'onDragEnter',
    ontouchstart: 'onTouchStart', ontouchend: 'onTouchEnd', ontouchmove: 'onTouchMove',
    onanimationend: 'onAnimationEnd', ontransitionend: 'onTransitionEnd',
    onload: 'onLoad', onerror: 'onError'
  };

  var BOOL_ATTRS = { disabled: 1, checked: 1, selected: 1, hidden: 1, multiple: 1, required: 1, open: 1 };
  var FORM_TAGS = { input: 1, textarea: 1, select: 1 };

  /* ---------------- template compiler ----------------
     compileNode(domNode) -> render(inst, vals, locals) -> ReactNode
  */

  function compileChildren(node) {
    var renderers = [];
    for (var c = node.firstChild; c; c = c.nextSibling) {
      var r = compileNode(c);
      if (r) renderers.push(r);
    }
    return function (inst, vals, locals) {
      var out = [];
      for (var i = 0; i < renderers.length; i++) {
        var v = renderers[i](inst, vals, locals);
        if (v == null || v === false) continue;
        if (Array.isArray(v)) out.push.apply(out, v);
        else out.push(v);
      }
      return out;
    };
  }

  function compileNode(node) {
    if (node.nodeType === 3) { // text
      var text = node.nodeValue;
      if (!hasMustache(text)) {
        // drop formatting-only whitespace (same rule JSX uses)
        if (/^\s*$/.test(text) && text.indexOf('\n') !== -1) return null;
        return function () { return text; };
      }
      var parts = splitMustache(text);
      return function (inst, vals, locals) {
        var out = [];
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          if (typeof p === 'string') { out.push(p); continue; }
          var v = evalExpr(p.expr, inst, vals, locals);
          if (v == null || v === false) continue;
          out.push(React.isValidElement(v) || Array.isArray(v) ? v : String(v));
        }
        return out;
      };
    }

    if (node.nodeType !== 1) return null; // comments etc.

    var tag = node.tagName.toLowerCase();
    if (tag === 'script' || tag === 'helmet') return null;

    if (tag === 'style') {
      var cssText = node.textContent;
      return function () {
        return React.createElement('style', { dangerouslySetInnerHTML: { __html: cssText } });
      };
    }

    if (tag === 'x-import') {
      // <x-import component-from-global-scope="cruz-globe" from="./cruz-globe.js" style="...">
      // Load the script once; render the custom element in place (it upgrades when defined).
      var ceTag = node.getAttribute('component-from-global-scope') || 'div';
      var from = node.getAttribute('from');
      if (from && !loadedImports[from]) {
        loadedImports[from] = true;
        var s = document.createElement('script');
        s.src = from;
        document.head.appendChild(s);
      }
      var ceProps = {};
      var ceAttrs = node.getAttributeNames();
      for (var a = 0; a < ceAttrs.length; a++) {
        var an = ceAttrs[a], al = an.toLowerCase();
        if (al === 'component-from-global-scope' || al === 'from' || al.indexOf('hint-') === 0) continue;
        if (al === 'style') ceProps.style = styleToObject(node.getAttribute(an));
        else ceProps[an] = node.getAttribute(an);
      }
      return function () { return React.createElement(ceTag, ceProps); };
    }

    if (tag === 'sc-if') {
      var condSrc = (WHOLE_MUSTACHE.exec(node.getAttribute('value') || '') || [])[1] || 'false';
      var kidsIf = compileChildren(node);
      return function (inst, vals, locals) {
        return evalExpr(condSrc, inst, vals, locals) ? kidsIf(inst, vals, locals) : null;
      };
    }

    if (tag === 'sc-for') {
      var listSrc = (WHOLE_MUSTACHE.exec(node.getAttribute('list') || '') || [])[1] || '[]';
      var asName = node.getAttribute('as') || 'item';
      var kidsFor = compileChildren(node);
      return function (inst, vals, locals) {
        var list = evalExpr(listSrc, inst, vals, locals) || [];
        var out = [];
        for (var i = 0; i < list.length; i++) {
          var childLocals = Object.create(locals || null);
          childLocals[asName] = list[i];
          childLocals.index = i;
          out.push(React.createElement(React.Fragment, { key: i }, kidsFor(inst, vals, childLocals)));
        }
        return out;
      };
    }

    // regular element
    var staticProps = {};
    var dynamicProps = []; // {key, kind, data}
    var dsihExpr = null, refExpr = null, hoverData = null;
    var attrNames = node.getAttributeNames();

    for (var i = 0; i < attrNames.length; i++) {
      var name = attrNames[i];
      var lower = name.toLowerCase();
      if (lower.indexOf('hint-') === 0 || lower === 'data-dc-script') continue;
      var raw = node.getAttribute(name);
      var whole = WHOLE_MUSTACHE.exec(raw);

      if (lower === 'ref') { if (whole) refExpr = whole[1]; continue; }
      if (lower === 'dangerouslysetinnerhtml') { if (whole) dsihExpr = whole[1]; continue; }
      if (lower === 'style-hover') { hoverData = raw; continue; }

      if (EVENT_MAP[lower]) {
        if (whole) dynamicProps.push({ key: EVENT_MAP[lower], kind: 'fn', data: whole[1] });
        continue;
      }

      if (lower === 'style') {
        if (hasMustache(raw)) dynamicProps.push({ key: 'style', kind: 'style', data: splitMustache(raw) });
        else staticProps.style = styleToObject(raw);
        continue;
      }

      var key = ATTR_MAP[lower] || name;

      if (BOOL_ATTRS[lower]) {
        if (whole) dynamicProps.push({ key: key, kind: 'raw', data: whole[1] });
        else if (hasMustache(raw)) dynamicProps.push({ key: key, kind: 'str', data: splitMustache(raw) });
        else staticProps[key] = true;
        continue;
      }

      if (whole) dynamicProps.push({ key: key, kind: 'raw', data: whole[1] });
      else if (hasMustache(raw)) dynamicProps.push({ key: key, kind: 'str', data: splitMustache(raw) });
      else staticProps[key] = raw;
    }

    if (hoverData) {
      var hoverIsDynamic = hasMustache(hoverData);
      var hoverParts = hoverIsDynamic ? splitMustache(hoverData) : null;
      var hoverStatic = hoverIsDynamic ? null : styleToObject(hoverData);
      dynamicProps.push({ key: '__hover', kind: 'hover', data: { parts: hoverParts, obj: hoverStatic } });
    }

    var kids = dsihExpr ? null : compileChildren(node);

    return function (inst, vals, locals) {
      var props = staticProps;
      if (dynamicProps.length || dsihExpr) props = Object.assign({}, staticProps);

      for (var i = 0; i < dynamicProps.length; i++) {
        var d = dynamicProps[i];
        if (d.kind === 'fn' || d.kind === 'raw') {
          var v = evalExpr(d.data, inst, vals, locals);
          if (d.kind === 'fn' && typeof v !== 'function') continue;
          props[d.key] = v;
        } else if (d.kind === 'str') {
          props[d.key] = interpolateString(d.data, inst, vals, locals);
        } else if (d.kind === 'style') {
          props.style = styleToObject(interpolateString(d.data, inst, vals, locals));
        } else if (d.kind === 'hover') {
          attachHover(props, d.data, inst, vals, locals);
        }
      }

      if (refExpr) {
        var refFn = evalExpr(refExpr, inst, vals, locals);
        if (typeof refFn === 'function') props.ref = refFn;
      }

      if (dsihExpr) {
        var html = evalExpr(dsihExpr, inst, vals, locals);
        if (React.isValidElement(html)) return React.createElement(tag, props, html);
        if (Array.isArray(html)) return React.createElement(tag, props, html);
        if (html && typeof html === 'object' && '__html' in html) props.dangerouslySetInnerHTML = html;
        else props.dangerouslySetInnerHTML = { __html: html == null ? '' : String(html) };
        return React.createElement(tag, props);
      }

      // uncontrolled fallback: value/checked without a change handler
      if (FORM_TAGS[tag] && !props.onChange) {
        if ('value' in props) { props.defaultValue = props.value; delete props.value; }
        if ('checked' in props) { props.defaultChecked = props.checked; delete props.checked; }
      }

      return React.createElement.apply(React, [tag, props].concat(kids(inst, vals, locals)));
    };
  }

  function attachHover(props, data, inst, vals, locals) {
    var hoverObj = data.obj || styleToObject(interpolateString(data.parts, inst, vals, locals));
    var prevEnter = props.onMouseEnter, prevLeave = props.onMouseLeave;
    props.onMouseEnter = function (e) {
      var el = e.currentTarget, prev = {};
      for (var k in hoverObj) {
        prev[k] = el.style[k];
        el.style[k] = hoverObj[k];
      }
      el.__dcHoverPrev = prev;
      if (prevEnter) prevEnter(e);
    };
    props.onMouseLeave = function (e) {
      var el = e.currentTarget, prev = el.__dcHoverPrev;
      if (prev) for (var k in prev) el.style[k] = prev[k];
      el.__dcHoverPrev = null;
      if (prevLeave) prevLeave(e);
    };
  }

  /* ---------------- DCLogic + bootstrap ---------------- */

  var DCLogic = /** @class */ (function () {
    function DCLogicInner(props) {
      React.Component.call(this, props);
      if (!this.state) this.state = {};
    }
    DCLogicInner.prototype = Object.create(React.Component.prototype);
    DCLogicInner.prototype.constructor = DCLogicInner;
    return DCLogicInner;
  })();

  // demo-mode copilot fallback (production wires a real backend)
  if (!window.claude) {
    window.claude = {
      complete: function () {
        return Promise.resolve(
          'Modo demostración — el copiloto de CRUZ responde con datos reales en producción. ' +
          '(Demo mode — the CRUZ copilot answers with live data in production.)'
        );
      }
    };
  }

  function bootstrap() {
    var xdc = document.querySelector('x-dc');
    if (!xdc) return;

    // helmet → head
    var helmet = xdc.querySelector('helmet');
    if (helmet) {
      while (helmet.firstChild) document.head.appendChild(helmet.firstChild);
      helmet.remove();
    }

    // component code + default props
    var scriptEl = document.querySelector('script[type="text/x-dc"]');
    var code = scriptEl ? scriptEl.textContent : 'class Component extends DCLogic {}';
    var defaults = {};
    if (scriptEl) {
      var dp = scriptEl.getAttribute('data-props');
      if (dp) {
        try {
          var spec = JSON.parse(dp);
          for (var k in spec) {
            if (k[0] !== '$' && spec[k] && typeof spec[k] === 'object' && 'default' in spec[k]) {
              defaults[k] = spec[k]['default'];
            }
          }
        } catch (e) {}
      }
      scriptEl.remove();
    }

    var template = compileChildren(xdc);

    var Component;
    try {
      Component = new Function('DCLogic', 'React', 'ReactDOM',
        '"use strict";\n' + code + '\n;return Component;')(DCLogic, React, ReactDOM);
    } catch (err) {
      console.error('[dc-shim] component code failed to evaluate', err);
      return;
    }
    if (!Component) { console.error('[dc-shim] no Component class found'); return; }

    Component.prototype.render = function () {
      var vals = {};
      if (typeof this.renderVals === 'function') {
        try { vals = this.renderVals() || {}; }
        catch (err) { console.error('[dc-shim] renderVals failed', err); }
      }
      return React.createElement(React.Fragment, null, template(this, vals, null));
    };

    var rootEl = document.createElement('div');
    xdc.replaceWith(rootEl);
    ReactDOM.createRoot(rootEl).render(React.createElement(Component, defaults));
  }

  if (document.readyState !== 'loading') bootstrap();
  else document.addEventListener('DOMContentLoaded', bootstrap);
})();
