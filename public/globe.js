// cruz-globe.js — the Living Globe. A self-contained <cruz-globe> web component.
// Photoreal NASA blue-marble (day) + city-lights (night), drag-to-spin with inertia,
// cursor-tracked terminator, animated global trade lanes + corridor comets, hoverable ports.
// Falls back to a dot-globe until textures load (or if they can't, e.g. offline).
// Usage:  <cruz-globe dim="0.85"></cruz-globe>   (dim 0..1 scales overall opacity for ambient mode)
// Size it with CSS on the host (display:block; width/height). No deps.
(function(){
  if (window.customElements && customElements.get('cruz-globe')) return;

  class CruzGlobe extends HTMLElement {
    connectedCallback(){
      if (this._mounted) return; this._mounted = true;
      this.style.display = this.style.display || 'block';
      this.style.position = this.style.position || 'relative';
      if(!this.style.width) this.style.width = '100%';
      if(!this.style.height) this.style.height = '100%';
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
      const d = parseFloat(this.getAttribute('dim'));
      if (!isNaN(d)) cv.style.opacity = String(Math.max(0, Math.min(1, d)));
      this.appendChild(cv);
      this.canvas = cv;
      // init now — do NOT depend on rAF for init (some panes throttle rAF until interaction).
      // initGlobe guards on this._raf, so racing setTimeout + rAF is safe (idempotent).
      const start=()=>{ try{ this.initGlobe(); }catch(e){ console.error('GLOBE_MOUNT_ERR', e && (e.stack||e.message)); } };
      start();
      if(!this._raf){ setTimeout(start,0); requestAnimationFrame(start); }
    }
    disconnectedCallback(){
      try{
        if(this._raf) cancelAnimationFrame(this._raf);
        if(this._resize) window.removeEventListener('resize', this._resize);
        if(this._move) window.removeEventListener('pointermove', this._move);
        if(this._up) window.removeEventListener('pointerup', this._up);
        const c=this.canvas;
        if(c){ if(this._down)c.removeEventListener('pointerdown',this._down); if(this._leave)c.removeEventListener('pointerleave',this._leave); if(this._wheel)c.removeEventListener('wheel',this._wheel); }
      }catch(e){}
      this._mounted=false; this._raf=null;
    }
    attributeChangedCallback(name,_o,v){ if(name==='dim'&&this.canvas){ const d=parseFloat(v); if(!isNaN(d)) this.canvas.style.opacity=String(Math.max(0,Math.min(1,d))); } }
    static get observedAttributes(){ return ['dim']; }

    // ---- geometry ----
    ll(lat,lon){ const la=lat*Math.PI/180, lo=lon*Math.PI/180; return [Math.cos(la)*Math.sin(lo), Math.sin(la), Math.cos(la)*Math.cos(lo)]; }
    rot(p,a,tilt){ let [x,y,z]=p; let x1=x*Math.cos(a)+z*Math.sin(a), z1=-x*Math.sin(a)+z*Math.cos(a); let y2=y*Math.cos(tilt)-z1*Math.sin(tilt), z2=y*Math.sin(tilt)+z1*Math.cos(tilt); return [x1,y2,z2]; }
    easeOut(t){ return 1-Math.pow(1-Math.max(0,Math.min(1,t)),3); }

    initGlobe(){
      if(this._raf) return;
      // corridor + global data
      this.cities = { mty:[25.7,-100.3], lar:[27.5,-99.5], dal:[32.8,-96.8], la:[34.0,-118.2], mex:[19.4,-99.1], hou:[29.8,-95.4], gdl:[20.7,-103.3], elp:[31.8,-106.5], tij:[32.5,-117.0] };
      this.cityInfo = { mty:['Monterrey','load center'], lar:['Laredo','38 min · 74% green'], dal:['Dallas','destination'], la:['Los Angeles','destination'], mex:['Mexico City','load center'], hou:['Houston','destination'], gdl:['Guadalajara','load center'], elp:['El Paso','22 min · 81% green'], tij:['Tijuana','51 min · 60% green'] };
      this.arcs = [ ['mty','dal'], ['gdl','la'], ['mex','hou'], ['mty','elp'], ['gdl','tij'], ['mex','dal'] ];
      const cont=[
        [-100,50,30,20],[-83,42,14,14],[-112,34,15,12],[-100,62,42,12],[-150,63,14,9],
        [-92,17,12,9],[-42,72,11,9],
        [-63,-15,17,20],[-58,-33,9,13],[-49,-8,10,10],
        [12,52,20,11],[30,45,15,9],
        [18,4,21,27],[26,-22,12,11],
        [86,52,50,20],[100,33,30,15],[78,23,9,11],[112,11,13,11],[140,58,18,12],
        [134,-25,15,9]
      ];
      const landAt=(lat,lon)=>{ if(lat<-63) return true; for(const e of cont){ const dl=(((lon-e[0]+540)%360)-180)/e[2]; const db=(lat-e[1])/e[3]; if(dl*dl+db*db<=1) return true; } return false; };
      this.dots=[]; const N=11000;
      for(let i=0;i<N;i++){ const y=1-(i/(N-1))*2; const r=Math.sqrt(1-y*y); const phi=i*2.399963; const x=Math.cos(phi)*r, z=Math.sin(phi)*r;
        const lat=Math.asin(Math.max(-1,Math.min(1,y)))*180/Math.PI, lon=Math.atan2(x,z)*180/Math.PI;
        this.dots.push({x,y,z,land:landAt(lat,lon), rev:(90-lat)/180}); }
      this.nightCities=[[25.7,-100.3],[19.4,-99.1],[20.7,-103.3],[32.8,-96.8],[29.8,-95.4],[34.0,-118.2],[40.7,-74.0],[41.9,-87.6],[19.0,-98.2],[25.8,-80.2]];
      this.worldNodes=[[31,121,1],[1.3,103.8,1],[35.6,139.7,1],[22.3,114.2,1],[19,72.8,1],[25.2,55.3,1],[51.9,4.5,1],[53.5,10,0],[51.5,-0.1,1],[51.2,4.4,0],[40.7,-74,1],[34,-118.2,1],[33.8,-118.2,0],[29.8,-95.4,0],[-23.9,-46.3,1],[-34.6,-58.4,0],[-33,-71.6,0],[-29.9,31,0],[6.5,3.4,0],[-33.9,18.4,0],[-33.9,151.2,1],[-37.8,144.9,0],[35.1,129,0],[22.6,120.3,0],[14.6,121,0],[-6.2,106.8,1],[6.9,79.8,0],[21.5,39.2,0],[41,28.9,0],[37.9,23.6,0],[44.4,8.9,0],[41.4,2.2,0],[52,1.3,0],[49.3,-123.1,0],[47.6,-122.3,0],[37.8,-122.3,0],[9,-79.5,1],[10.4,-75.5,0],[19.2,-96.1,0],[19,-104.3,0],[45.5,-73.6,0],[32,-81.1,0],[25.8,-80.2,0],[36.9,-76.3,0],[17,54,0],[30,31.2,0]];
      this.worldArcs=[[[31,121],[34,-118.2]],[[31,121],[51.9,4.5]],[[1.3,103.8],[51.9,4.5]],[[1.3,103.8],[25.2,55.3]],[[25.2,55.3],[51.9,4.5]],[[35.6,139.7],[33.8,-118.2]],[[35.1,129],[37.8,-122.3]],[[22.3,114.2],[34,-118.2]],[[31,121],[9,-79.5]],[[9,-79.5],[40.7,-74]],[[40.7,-74],[51.9,4.5]],[[-23.9,-46.3],[51.9,4.5]],[[-23.9,-46.3],[31,121]],[[-33.9,151.2],[1.3,103.8]],[[19,72.8],[25.2,55.3]],[[6.5,3.4],[51.9,4.5]],[[-29.9,31],[1.3,103.8]],[[19,-104.3],[31,121]]];
      this.worldNames=[['Shanghai','Asia'],['Singapore','Asia'],['Tokyo','Asia'],['Hong Kong','Asia'],['Mumbai','Asia'],['Dubai','Middle East'],['Rotterdam','Europe'],['Hamburg','Europe'],['London','Europe'],['Antwerp','Europe'],['New York','N. America'],['Los Angeles','N. America'],['Long Beach','N. America'],['Houston','N. America'],['Santos','S. America'],['Buenos Aires','S. America'],['Valparaiso','S. America'],['Durban','Africa'],['Lagos','Africa'],['Cape Town','Africa'],['Sydney','Oceania'],['Melbourne','Oceania'],['Busan','Asia'],['Kaohsiung','Asia'],['Manila','Asia'],['Jakarta','Asia'],['Colombo','Asia'],['Jeddah','Middle East'],['Istanbul','Europe'],['Piraeus','Europe'],['Genoa','Europe'],['Barcelona','Europe'],['Felixstowe','Europe'],['Vancouver','N. America'],['Seattle','N. America'],['Oakland','N. America'],['Panama','C. America'],['Cartagena','S. America'],['Veracruz','Mexico'],['Manzanillo','Mexico'],['Montreal','N. America'],['Savannah','N. America'],['Miami','N. America'],['Norfolk','N. America'],['Salalah','Middle East'],['Suez','Middle East']];
      const resize=()=>{ const c=this.canvas; if(!c)return; const r=c.getBoundingClientRect(); this.w=r.width; this.h=r.height; const dpr=Math.min(window.devicePixelRatio||1,2); c.width=Math.max(2,r.width*dpr); c.height=Math.max(2,r.height*dpr); this.ctx=c.getContext('2d'); this.ctx.setTransform(dpr,0,0,dpr,0,0); };
      this._resize=resize; resize(); window.addEventListener('resize',resize);
      this.stars=[]; for(let i=0;i<90;i++){ this.stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.0+0.3,p:Math.random()*6.283,sp:0.6+Math.random()*1.8}); }
      this.userA=0; this.userTilt=0; this.va=0; this.vt=0; this.drag=null; this.hover=null; this.pointer={x:null,y:null};
      const c=this.canvas; c.style.cursor='grab'; c.style.touchAction='none';
      const xy=(e)=>{ const r=c.getBoundingClientRect(); return [ e.clientX-r.left, e.clientY-r.top ]; };
      this._down=(e)=>{ const [x,y]=xy(e); this.drag={x,y}; this.va=0; this.vt=0; c.style.cursor='grabbing'; if(c.setPointerCapture&&e.pointerId!=null){ try{c.setPointerCapture(e.pointerId);}catch(_){} } };
      this._move=(e)=>{ const [x,y]=xy(e); this.pointer={x,y};
        if(this.drag){ const dx=x-this.drag.x, dy=y-this.drag.y; this.drag={x,y};
          this.userA+=dx*0.0062; this.userTilt=Math.max(-0.85,Math.min(0.85,this.userTilt-dy*0.005));
          this.va=dx*0.0062; this.vt=-dy*0.005; } };
      this._up=()=>{ if(this.drag){ this.drag=null; if(this.canvas) this.canvas.style.cursor='grab'; } };
      this._leave=()=>{ if(!this.drag) this.pointer={x:null,y:null}; };
      c.addEventListener('pointerdown',this._down); window.addEventListener('pointermove',this._move);
      window.addEventListener('pointerup',this._up); c.addEventListener('pointerleave',this._leave);
      this.zoom=1; this._wheel=(e)=>{ e.preventDefault(); this.zoom=Math.max(0.85,Math.min(2.4,(this.zoom||1)*(e.deltaY<0?1.08:0.926))); }; c.addEventListener('wheel',this._wheel,{passive:false});
      this.baseA=1.62;
      this._reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._t0 = (window.performance&&performance.now)?performance.now():Date.now();
      this.tex={}; this.texReady=false;
      const loadTex=(key,url)=>{ const img=new Image(); img.crossOrigin='anonymous';
        img.onload=()=>{ try{ const oc=document.createElement('canvas'); oc.width=img.naturalWidth; oc.height=img.naturalHeight; const o=oc.getContext('2d'); o.drawImage(img,0,0); this.tex[key]={data:o.getImageData(0,0,oc.width,oc.height).data,w:oc.width,h:oc.height}; if(this.tex.day&&this.tex.night) this.texReady=true; }catch(e){} };
        img.src=url; };
      // CRUZ: the dot-globe (the !texReady path) IS our canonical look, and external
      // texture CDNs are blocked in our environment — skip the fetch, stay clean & offline-first.
      void loadTex;
      this.gt=0; const loop=()=>{ try{ this.drawGlobe(); }catch(e){ if(!this._le){ this._le=1; console.error('GLOBE_ERR', e && (e.stack||e.message)); } } this._raf=requestAnimationFrame(loop); }; this._raf=requestAnimationFrame(loop);
    }

    drawTexturedSphere(ctx,cx,cy,R,a,tilt,L,intro){
      const day=this.tex.day, night=this.tex.night; if(!day||!night) return;
      const dispS=Math.ceil(R*2); if(dispS<2) return;
      const S=Math.max(2,Math.ceil(dispS*0.82)), Rr=S/2;
      if(!this._oc){ this._oc=document.createElement('canvas'); }
      const oc=this._oc; if(oc.width!==S||oc.height!==S){ oc.width=S; oc.height=S; this._ocx=oc.getContext('2d'); this._ocImg=this._ocx.createImageData(S,S); }
      const out=this._ocImg.data;
      const ca=Math.cos(a),sa=Math.sin(a),ct=Math.cos(tilt),st=Math.sin(tilt);
      const dW=day.w,dH=day.h,dD=day.data, nW=night.w,nH=night.h,nD=night.data;
      const Lx=L[0],Ly=L[1],Lz=L[2], PI=Math.PI, A=Math.max(0,Math.min(1,intro))*255;
      for(let py=0;py<S;py++){ const ny=1-(py+0.5)/Rr;
        for(let px=0;px<S;px++){ const nx=(px+0.5)/Rr-1; const rr=nx*nx+ny*ny; const o=(py*S+px)<<2;
          if(rr>1){ out[o+3]=0; continue; }
          const nz=Math.sqrt(1-rr);
          const gy=ny*ct+nz*st, z1=-ny*st+nz*ct, x1=nx;
          const gx=x1*ca-z1*sa, gz=x1*sa+z1*ca;
          const lat=Math.asin(gy<-1?-1:gy>1?1:gy), lon=Math.atan2(gx,gz);
          const uf=(lon/PI)*0.5+0.5, vf=0.5-lat/PI;
          let dui=(uf*dW)|0; if(dui<0)dui=0; else if(dui>=dW)dui=dW-1;
          let dvi=(vf*dH)|0; if(dvi<0)dvi=0; else if(dvi>=dH)dvi=dH-1; const ti=(dvi*dW+dui)<<2;
          let nui=(uf*nW)|0; if(nui<0)nui=0; else if(nui>=nW)nui=nW-1;
          let nvi=(vf*nH)|0; if(nvi<0)nvi=0; else if(nvi>=nH)nvi=nH-1; const ni=(nvi*nW+nui)<<2;
          const lam=nx*Lx+ny*Ly+nz*Lz;
          const t=lam<-0.1?0:(lam>0.32?1:(lam+0.1)/0.42);
          const shade=0.32+0.78*(lam>0?lam:0), edge=1-rr*rr*0.45;
          out[o]  =(nD[ni]*(1-t)*0.92   + dD[ti]*shade*t)*edge;
          out[o+1]=(nD[ni+1]*(1-t)*0.92 + dD[ti+1]*shade*t)*edge;
          out[o+2]=(nD[ni+2]*(1-t)*0.92 + dD[ti+2]*shade*t)*edge;
          out[o+3]=A;
        }
      }
      this._ocx.putImageData(this._ocImg,0,0);
      ctx.imageSmoothingEnabled=true; ctx.drawImage(oc,cx-R,cy-R,R*2,R*2);
      const gx=cx+L[0]*R*0.5, gyy=cy-L[1]*R*0.5;
      ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.clip(); ctx.globalCompositeOperation='lighter';
      let gl=ctx.createRadialGradient(gx,gyy,0,gx,gyy,R*0.6); gl.addColorStop(0,'rgba(150,210,255,'+(0.12*intro)+')'); gl.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=gl; ctx.fillRect(cx-R,cy-R,R*2,R*2); ctx.restore();
    }

    drawGlobe(){
      const cvs=this.canvas; if(cvs && this._resize){ const rect=cvs.getBoundingClientRect(); const dpr=Math.min(window.devicePixelRatio||1,2); const want=Math.max(2,Math.round(rect.width*dpr)); if(rect.width>1 && Math.abs(cvs.width-want)>1){ this._resize(); } }
      const ctx=this.ctx; if(!ctx)return; const w=this.w,h=this.h;
      if(!this.drag){ this.gt+=0.0032; this.userA=(this.userA||0)+(this.va||0); this.userTilt=Math.max(-0.85,Math.min(0.85,(this.userTilt||0)+(this.vt||0))); this.va=(this.va||0)*0.93; this.vt=(this.vt||0)*0.93; }
      ctx.clearRect(0,0,w,h);
      const now=(window.performance&&performance.now)?performance.now():Date.now();
      const intro=this._reduce?1:this.easeOut((now-(this._t0||now))/1400); this.intro=intro;
      const arcOn = intro>=1?1:Math.max(0,Math.min(1,(intro-0.45)/0.5));
      const nodeOn = intro>=1?1:Math.max(0,Math.min(1,(intro-0.82)/0.18));
      const cx=w*0.5, cy=h*0.5, R=Math.min(w,h)*0.37*(0.92+0.08*intro)*(this.zoom||1);
      const a=(this.baseA||1.62) + this.gt + (1-intro)*0.7 + (this.userA||0);
      const tilt=-0.42 + Math.sin(this.gt*0.22)*0.05*intro + (this.userTilt||0);
      const px=(this.pointer&&this.pointer.x!=null)?(this.pointer.x/w-0.5):0;
      const py=(this.pointer&&this.pointer.y!=null)?(this.pointer.y/h-0.5):0;
      let L=[-0.40+px*0.55,0.48-py*0.55,0.78]; const Lm=Math.hypot(L[0],L[1],L[2]); L=[L[0]/Lm,L[1]/Lm,L[2]/Lm];
      const lx=cx+L[0]*R*0.55, ly=cy-L[1]*R*0.55;
      for(const s of this.stars){ const tw=0.35+0.65*(0.5+0.5*Math.sin(this.gt*s.sp*4+s.p)); ctx.fillStyle='rgba(180,205,228,'+(0.45*tw*(s.r/1.3))+')'; ctx.beginPath(); ctx.arc(s.x*w,s.y*h,s.r,0,7); ctx.fill(); }
      let atm=ctx.createRadialGradient(cx,cy,R*0.6,cx,cy,R*1.75); atm.addColorStop(0,'rgba(34,211,238,0.13)'); atm.addColorStop(0.5,'rgba(8,116,144,0.06)'); atm.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=atm; ctx.beginPath(); ctx.arc(cx,cy,R*1.75,0,7); ctx.fill();
      if(this.texReady){ this.drawTexturedSphere(ctx,cx,cy,R,a,tilt,L,intro); }
      else {
      let sg=ctx.createRadialGradient(lx,ly,R*0.04,cx,cy,R); sg.addColorStop(0,'#1b3a54'); sg.addColorStop(0.55,'#0c1c2c'); sg.addColorStop(1,'#050d15'); ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.clip();
      ctx.strokeStyle='rgba(90,140,170,0.07)'; ctx.lineWidth=1;
      for(let lat=-60;lat<=60;lat+=30){ ctx.beginPath(); let st=false; for(let lon=-180;lon<=180;lon+=6){ const [x,y,z]=this.rot(this.ll(lat,lon),a,tilt); if(z<=0){st=false;continue;} const sx=cx+x*R, sy=cy-y*R; if(!st){ctx.moveTo(sx,sy);st=true;}else ctx.lineTo(sx,sy);} ctx.stroke(); }
      for(let lon=-150;lon<=180;lon+=30){ ctx.beginPath(); let st=false; for(let lat=-90;lat<=90;lat+=6){ const [x,y,z]=this.rot(this.ll(lat,lon),a,tilt); if(z<=0){st=false;continue;} const sx=cx+x*R, sy=cy-y*R; if(!st){ctx.moveTo(sx,sy);st=true;}else ctx.lineTo(sx,sy);} ctx.stroke(); }
      for(const p of this.dots){
        const rv = intro>=1 ? 1 : Math.max(0, Math.min(1,(intro*1.18 - p.rev)/0.14)); if(rv<=0) continue;
        const [x,y,z]=this.rot([p.x,p.y,p.z],a,tilt); if(z<=0)continue; const sx=cx+x*R, sy=cy-y*R;
        const lam=Math.max(0, x*L[0]+y*L[1]+z*L[2]); const lit=0.10+0.90*lam;
        if(p.land){ const b=lit; ctx.fillStyle='rgba('+Math.round(96+96*b)+','+Math.round(178+62*b)+','+Math.round(198+52*b)+','+((0.22+0.72*b)*Math.min(1,0.35+z)*rv)+')'; ctx.beginPath(); ctx.arc(sx,sy,(0.56+z*0.8)*(0.6+0.4*rv),0,7); ctx.fill(); }
        else { ctx.fillStyle='rgba(64,116,146,'+((0.05+0.15*lam)*Math.min(1,0.4+z)*rv)+')'; ctx.beginPath(); ctx.arc(sx,sy,0.42+z*0.46,0,7); ctx.fill(); }
      }
      for(const nc of this.nightCities){ const [x,y,z]=this.rot(this.ll(nc[0],nc[1]),a,tilt); if(z<=0)continue;
        const lam=Math.max(0,x*L[0]+y*L[1]+z*L[2]); const night=Math.max(0,0.34-lam)/0.34; if(night<=0.02)continue;
        const sx=cx+x*R, sy=cy-y*R; const tw=0.7+0.3*Math.sin(this.gt*5+x*9+y*7); const a1=night*tw*Math.min(1,0.4+z)*intro;
        const g=ctx.createRadialGradient(sx,sy,0,sx,sy,3.6); g.addColorStop(0,'rgba(255,206,140,'+(0.9*a1)+')'); g.addColorStop(1,'rgba(255,170,90,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,3.6,0,7); ctx.fill();
        ctx.fillStyle='rgba(255,226,180,'+(0.95*a1)+')'; ctx.beginPath(); ctx.arc(sx,sy,0.95,0,7); ctx.fill();
      }
      let sp=ctx.createRadialGradient(lx,ly,0,lx,ly,R*0.85); sp.addColorStop(0,'rgba(150,228,248,0.18)'); sp.addColorStop(0.6,'rgba(60,150,180,0.05)'); sp.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=sp; ctx.fillRect(cx-R,cy-R,R*2,R*2);
      ctx.restore();
      }
      if(arcOn>0) for(let wi=0;wi<this.worldArcs.length;wi++){ const W=this.worldArcs[wi];
        const pa=this.rot(this.ll(W[0][0],W[0][1]),a,tilt), pb=this.rot(this.ll(W[1][0],W[1][1]),a,tilt);
        const pts=[]; for(let i=0;i<=44;i++){ const tt=i/44; let x=pa[0]*(1-tt)+pb[0]*tt,y=pa[1]*(1-tt)+pb[1]*tt,z=pa[2]*(1-tt)+pb[2]*tt; const m=Math.hypot(x,y,z)||1; x/=m;y/=m;z/=m; const lift=1+0.18*Math.sin(Math.PI*tt); pts.push([cx+x*lift*R, cy-y*lift*R, z]); }
        const nDw=Math.max(1,Math.ceil(44*arcOn));
        ctx.beginPath(); let s2=false; ctx.strokeStyle='rgba(96,184,222,'+(0.13*arcOn)+')'; ctx.lineWidth=0.85;
        for(let i=0;i<=nDw && i<pts.length;i++){ const p=pts[i]; if(p[2]<-0.15){s2=false;continue;} if(!s2){ctx.moveTo(p[0],p[1]);s2=true;}else ctx.lineTo(p[0],p[1]); }
        ctx.stroke();
        if(arcOn>=1){ const fi=((this.gt*0.4+wi*0.37)%1)*44; ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.shadowColor='rgba(130,215,245,0.8)';
          for(let k=0;k<7;k++){ const idx=Math.floor(fi-k); if(idx<0||idx>44)continue; const pp=pts[idx]; if(!pp||pp[2]<-0.1)continue; const al=(1-k/7)*0.62; const rad=(1-k/7)*1.8+0.4; ctx.shadowBlur=(k===0?7:0); ctx.fillStyle='rgba(160,228,250,'+al+')'; ctx.beginPath(); ctx.arc(pp[0],pp[1],rad,0,7); ctx.fill(); }
          ctx.restore(); }
      }
      for(let ai=0;ai<this.arcs.length;ai++){ const [A,B]=this.arcs[ai];
        const pa=this.rot(this.ll(this.cities[A][0],this.cities[A][1]),a,tilt);
        const pb=this.rot(this.ll(this.cities[B][0],this.cities[B][1]),a,tilt);
        const pts=[]; for(let i=0;i<=46;i++){ const tt=i/46; let x=pa[0]*(1-tt)+pb[0]*tt,y=pa[1]*(1-tt)+pb[1]*tt,z=pa[2]*(1-tt)+pb[2]*tt; const m=Math.sqrt(x*x+y*y+z*z); x/=m;y/=m;z/=m; const lift=1+0.24*Math.sin(Math.PI*tt); pts.push([cx+x*lift*R, cy-y*lift*R, z]); }
        const border=(A==='lar'||A==='elp'||B==='lar'||B==='elp'); const col=border?'52,211,153':'34,211,238';
        if(arcOn<=0) continue;
        const nDraw=Math.max(1,Math.ceil(46*arcOn));
        ctx.beginPath(); let st=false; ctx.strokeStyle='rgba('+col+','+(0.30*arcOn)+')'; ctx.lineWidth=1.2;
        for(let i=0;i<=nDraw && i<pts.length;i++){ const p=pts[i]; if(p[2]<-0.2){st=false;continue;} if(!st){ctx.moveTo(p[0],p[1]);st=true;}else ctx.lineTo(p[0],p[1]); }
        ctx.stroke();
        if(arcOn>=1){
          const fi=((this.gt*0.55+ai*0.27)%1)*46;
          ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.shadowColor='rgba('+col+',0.9)';
          for(let k=0;k<10;k++){ const idx=Math.floor(fi-k); if(idx<0||idx>46)continue; const pp=pts[idx]; if(!pp||pp[2]<-0.1)continue; const al=(1-k/10)*0.85; const rad=(1-k/10)*3.0+0.5; ctx.shadowBlur=(k===0?11:0); ctx.fillStyle='rgba('+col+','+al+')'; ctx.beginPath(); ctx.arc(pp[0],pp[1],rad,0,7); ctx.fill(); }
          ctx.restore();
        }
      }
      this._wHov=null; let _wd=14;
      if(nodeOn>0){ ctx.save(); ctx.globalCompositeOperation='lighter';
        for(let wn=0;wn<this.worldNodes.length;wn++){ const nd=this.worldNodes[wn]; const [x,y,z]=this.rot(this.ll(nd[0],nd[1]),a,tilt); if(z<=0)continue; const sx=cx+x*R, sy=cy-y*R;
          if(!this.drag && intro>=1 && this.pointer&&this.pointer.x!=null){ const d=Math.hypot(sx-this.pointer.x,sy-this.pointer.y); if(d<_wd){ _wd=d; this._wHov={sx,sy,idx:wn}; } }
          const lam=Math.max(0,x*L[0]+y*L[1]+z*L[2]); const tw=0.6+0.4*Math.sin(this.gt*2.4+x*7+y*5); const hub=nd[2];
          const al=(0.3+0.45*(1-lam*0.55))*tw*Math.min(1,0.4+z)*nodeOn; const rad=(hub?1.7:1.05);
          const gg=ctx.createRadialGradient(sx,sy,0,sx,sy,rad*3.6); gg.addColorStop(0,'rgba(120,225,248,'+(0.5*al)+')'); gg.addColorStop(1,'rgba(34,160,210,0)'); ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(sx,sy,rad*3.6,0,7); ctx.fill();
          ctx.fillStyle='rgba(196,242,255,'+Math.min(1,al*1.3)+')'; ctx.beginPath(); ctx.arc(sx,sy,rad,0,7); ctx.fill();
        }
        ctx.restore();
        if(this._wHov){ ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.arc(this._wHov.sx,this._wHov.sy,5.5,0,7); ctx.stroke(); ctx.restore(); }
      }
      const vis=[]; let hov=null, hovd=22;
      for(const c in this.cities){ const [x,y,z]=this.rot(this.ll(this.cities[c][0],this.cities[c][1]),a,tilt); if(z<=0)continue; const sx=cx+x*R, sy=cy-y*R;
        if(this.pointer&&this.pointer.x!=null){ const d=Math.hypot(sx-this.pointer.x,sy-this.pointer.y); if(d<hovd){ hovd=d; hov=c; } }
        vis.push({c,sx,sy,x,z,border:(c==='lar'||c==='elp'||c==='tij')}); }
      this.hover = (this.drag||intro<1)? null : hov;
      if(this.canvas) this.canvas.style.cursor = this.drag?'grabbing':((this.hover||this._wHov)?'pointer':'grab');
      if(nodeOn>0) for(const v of vis){ const {c,sx,sy,x,z,border}=v; const col=border?'52,211,153':'34,211,238'; const isH=this.hover===c; const ns=nodeOn*(isH?1.5:1);
        if(border && nodeOn>=1){ const pulse=(((this.gt*0.7+x*2)%1)+1)%1; const rr=4+pulse*16; ctx.strokeStyle='rgba('+col+','+((1-pulse)*0.5*Math.min(1,0.3+z))+')'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.arc(sx,sy,rr,0,7); ctx.stroke(); }
        const pr=(border?(7+Math.sin(this.gt*3+x*4)*1.4):5)*ns;
        const g=ctx.createRadialGradient(sx,sy,0,sx,sy,pr*2); g.addColorStop(0,'rgba('+col+','+((isH?0.6:0.4)*nodeOn)+')'); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,pr*2,0,7); ctx.fill();
        ctx.fillStyle='rgba('+col+','+nodeOn+')'; ctx.beginPath(); ctx.arc(sx,sy,(border?2.6:1.9)*ns,0,7); ctx.fill();
        if(isH){ ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(sx,sy,pr+3,0,7); ctx.stroke(); }
      }
      if(this.hover){ const v=vis.find(o=>o.c===this.hover);
        if(v){ const info=this.cityInfo[this.hover]||[this.hover,'']; const name=info[0], sub=info[1];
          ctx.font='600 12px "Archivo",sans-serif'; const nw=ctx.measureText(name).width;
          ctx.font='500 10px "Space Mono",monospace'; const sw=sub?ctx.measureText(sub).width:0;
          const tw=Math.max(nw,sw)+20, th=sub?40:26; let tx=v.sx+14, ty=v.sy-th-8;
          if(tx+tw>w-6) tx=v.sx-tw-14; if(ty<6) ty=v.sy+12;
          ctx.fillStyle='rgba(7,11,17,0.94)';
          if(ctx.roundRect){ ctx.beginPath(); ctx.roundRect(tx,ty,tw,th,9); ctx.fill(); ctx.strokeStyle=(v.border?'rgba(52,211,153,0.55)':'rgba(34,211,238,0.55)'); ctx.lineWidth=1; ctx.stroke(); }
          else { ctx.fillRect(tx,ty,tw,th); }
          ctx.textBaseline='top'; ctx.fillStyle='#EAF4F8'; ctx.font='600 12px "Archivo",sans-serif'; ctx.fillText(name,tx+11,ty+8);
          if(sub){ ctx.fillStyle=(v.border?'#34D399':'#7DD3E8'); ctx.font='500 10px "Space Mono",monospace'; ctx.fillText(sub,tx+11,ty+24); }
          ctx.textBaseline='alphabetic';
        }
      }
      if(!this.hover && this._wHov){ const nm=this.worldNames[this._wHov.idx]||['','']; const name=nm[0], sub=nm[1]; const vx=this._wHov.sx, vy=this._wHov.sy;
        ctx.font='600 12px "Archivo",sans-serif'; const nw=ctx.measureText(name).width; ctx.font='500 10px "Space Mono",monospace'; const sw=sub?ctx.measureText(sub).width:0;
        const tw=Math.max(nw,sw)+20, th=sub?40:26; let tx=vx+14, ty=vy-th-8; if(tx+tw>w-6) tx=vx-tw-14; if(ty<6) ty=vy+12;
        ctx.fillStyle='rgba(7,11,17,0.94)'; if(ctx.roundRect){ ctx.beginPath(); ctx.roundRect(tx,ty,tw,th,9); ctx.fill(); ctx.strokeStyle='rgba(34,211,238,0.5)'; ctx.lineWidth=1; ctx.stroke(); } else { ctx.fillRect(tx,ty,tw,th); }
        ctx.textBaseline='top'; ctx.fillStyle='#EAF4F8'; ctx.font='600 12px "Archivo",sans-serif'; ctx.fillText(name,tx+11,ty+8);
        if(sub){ ctx.fillStyle='#7DD3E8'; ctx.font='500 10px "Space Mono",monospace'; ctx.fillText(sub,tx+11,ty+24); } ctx.textBaseline='alphabetic';
      }
      ctx.save(); ctx.globalCompositeOperation='lighter';
      let halo=ctx.createRadialGradient(cx,cy,R*0.93,cx,cy,R*1.32);
      halo.addColorStop(0,'rgba(34,211,238,0)'); halo.addColorStop(0.42,'rgba(80,200,235,'+(0.24*intro)+')'); halo.addColorStop(0.72,'rgba(34,150,195,'+(0.10*intro)+')'); halo.addColorStop(1,'rgba(8,40,70,0)');
      ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(cx,cy,R*1.32,0,7); ctx.fill();
      ctx.restore();
      let rim=ctx.createLinearGradient(lx-R,ly-R,cx*2-lx+R,cy*2-ly+R);
      rim.addColorStop(0,'rgba(186,236,255,'+(0.6*intro)+')'); rim.addColorStop(0.45,'rgba(34,211,238,'+(0.22*intro)+')'); rim.addColorStop(1,'rgba(40,90,150,'+(0.10*intro)+')');
      ctx.strokeStyle=rim; ctx.lineWidth=1.8; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.stroke();
      ctx.strokeStyle='rgba(150,220,245,'+(0.10*intro)+')'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,R+3,0,7); ctx.stroke();
    }
  }
  customElements.define('cruz-globe', CruzGlobe);
})();
