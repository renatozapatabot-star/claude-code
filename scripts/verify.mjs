// CRUZ — browser verification. Captures key surfaces at desktop + 375px mobile.
// Usage: node scripts/verify.mjs   (server must be running on PORT or 4317)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

// Start the real CRUZ server in-process so verification is self-contained.
const require = createRequire(import.meta.url);
const server = require('../server.js');

const BASE = process.env.BASE || 'http://localhost:4317';
const OUT = 'scripts/shots';
mkdirSync(OUT, { recursive: true });

const shots = [];
const errors = [];

async function shoot(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(350);
  return page;
}

// Use the sandbox's pre-installed Chromium when the pinned playwright build is absent
// (env: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers). Falls back to the default resolver.
import { existsSync } from 'node:fs';
const PREINSTALLED = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(
  existsSync(PREINSTALLED) ? { executablePath: PREINSTALLED, args: ['--no-sandbox'] } : {}
);
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

// Desktop — Inicio
await shoot(page, 'inicio', { width: 1440, height: 900 });
await page.screenshot({ path: `${OUT}/01-inicio-desktop.png` });
shots.push('01-inicio-desktop');

// Desktop — Embarques
await page.click('.nav-item[data-view="embarques"]');
await page.waitForTimeout(250);
await page.screenshot({ path: `${OUT}/02-embarques-desktop.png` });
shots.push('02-embarques-desktop');

// Desktop — Drawer (open first row)
await page.click('#emb-rows tr[data-id]');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/03-drawer-desktop.png` });
shots.push('03-drawer-desktop');

// Desktop — Pedimentos surface + pedimento drawer
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.setViewportSize({ width: 1440, height: 900 });
await page.click('.nav-item[data-view="pedimentos"]');
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/09-pedimentos-desktop.png` });
shots.push('09-pedimentos-desktop');
await page.click('#ped-rows tr[data-num]');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/10-pedimento-drawer.png` });
shots.push('10-pedimento-drawer');

// Desktop — Expedientes / Facturación / Clientes (the completed front end)
for (const [view, n] of [['expedientes', '11'], ['facturacion', '12'], ['clientes', '13']]) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.click(`.nav-item[data-view="${view}"]`);
  await page.waitForTimeout(280);
  await page.screenshot({ path: `${OUT}/${n}-${view}-desktop.png` });
  shots.push(`${n}-${view}-desktop`);
}
// Clientes detail drawer
await page.click('#view-clientes tr[data-cli]');
await page.waitForTimeout(380);
await page.screenshot({ path: `${OUT}/14-cliente-drawer.png` });
shots.push('14-cliente-drawer');

// Mobile 375 — Clientes (stacked cards)
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.click('#hamburger'); await page.waitForTimeout(180);
await page.click('.nav-item[data-view="clientes"]'); await page.waitForTimeout(280);
await page.screenshot({ path: `${OUT}/15-clientes-375.png`, fullPage: true });
shots.push('15-clientes-375');

// Desktop — Copilot drawer (the persistent agent)
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.setViewportSize({ width: 1440, height: 900 });
await page.click('#co-pill');
await page.waitForTimeout(450);
await page.screenshot({ path: `${OUT}/07-copilot-desktop.png` });
shots.push('07-copilot-desktop');

// Desktop — Signature gate (the human gate)
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await page.click('#queue-rows .dec .btn-primary');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/08-gate-desktop.png` });
shots.push('08-gate-desktop');

// Mobile 375 — Inicio
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/04-inicio-375.png`, fullPage: true });
shots.push('04-inicio-375');

// Mobile 375 — Embarques (stacked cards). Open the off-canvas menu first.
await page.click('#hamburger');
await page.waitForTimeout(200);
await page.click('.nav-item[data-view="embarques"]');
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/05-embarques-375.png`, fullPage: true });
shots.push('05-embarques-375');

// Mobile 375 — Drawer
await page.click('#emb-rows tr[data-id]');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/06-drawer-375.png` });
shots.push('06-drawer-375');

// Overflow / overlap probe at 375
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(BASE, { waitUntil: 'networkidle' });
const overflow = await page.evaluate(() => {
  const docW = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll('*')) {
    // Ignore panels intentionally parked off-canvas (drawer, mobile sidebar).
    if (el.closest('.drawer, .sidebar, .co-drawer, .gate-scrim, .toast')) continue;
    const r = el.getBoundingClientRect();
    if (r.width && r.right > docW + 1) bad.push(`${el.tagName}.${el.className}`.slice(0, 60));
  }
  return { docW, scrollW: document.documentElement.scrollWidth, bad: [...new Set(bad)].slice(0, 10) };
});

// Mobile field mode — full-screen copilot sheet + bottom-sheet signature gate
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.click('#co-pill'); await page.waitForTimeout(380);
await page.screenshot({ path: `${OUT}/18-copilot-375.png` });
shots.push('18-copilot-375');
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(250);
await page.click('#queue-rows .dec .btn-primary'); await page.waitForTimeout(380);
await page.screenshot({ path: `${OUT}/19-gate-375.png` });
shots.push('19-gate-375');

// Login front door (brand panel + living globe) — desktop + mobile
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(900); // let the globe paint a few frames
await page.screenshot({ path: `${OUT}/16-login-desktop.png` });
shots.push('16-login-desktop');
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/17-login-375.png`, fullPage: true });
shots.push('17-login-375');

await browser.close();
server.close();
console.log('SHOTS:', shots.join(', '));
console.log('CONSOLE ERRORS:', errors.length ? errors : 'none');
console.log('H-OVERFLOW @375:', JSON.stringify(overflow));
if (errors.length || overflow.bad.length || overflow.scrollW > overflow.docW + 1) {
  console.log('VERIFY: ISSUES FOUND');
  process.exit(2);
}
console.log('VERIFY: CLEAN');
