// Driver for the GLOBO static site: serves the repo over HTTP and drives it
// with Playwright on the system Chrome/Edge (no browser download needed).
//
//   node driver.mjs smoke                 every page: screenshot, broken links, console errors,
//                                         + login flow + sidebar toggle. Exit 1 on failure.
//   node driver.mjs shot <page> [mobile]  screenshot one page (e.g. index.html), full page
//   node driver.mjs login <name>          fill login form, show welcome, log out
//   node driver.mjs serve [port]          just serve the site (Ctrl-C to stop)
//
// Screenshots land in .claude/skills/run-globo/shots/.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');            // the globo repo root
const shots = path.join(here, 'shots');
fs.mkdirSync(shots, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.js': 'text/javascript' };

function serve(port = 0) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/') p = '/index.html';
    const file = path.join(root, p);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end('not found'); return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => server.listen(port, '127.0.0.1', () => r(server)));
}

function findBrowser() {
  const c = [process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  const hit = c.find(p => fs.existsSync(p));
  if (!hit) throw new Error('No Chrome/Edge found; set CHROME_PATH');
  return hit;
}

async function open() {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ executablePath: findBrowser(), headless: true });
  return { server, base, browser, close: async () => { await browser.close(); server.close(); } };
}

const DESKTOP = { viewport: { width: 1280, height: 800 } };
const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

async function shot(name, mobile) {
  const s = await open();
  const page = await (await s.browser.newContext(mobile ? MOBILE : DESKTOP)).newPage();
  await page.goto(s.base + name, { waitUntil: 'load' });
  const out = path.join(shots, name.replace(/\W+/g, '_') + (mobile ? '-mobile' : '') + '.png');
  await page.screenshot({ path: out, fullPage: true });
  console.log('screenshot:', out);
  await s.close();
}

async function login(name) {
  const s = await open();
  const page = await (await s.browser.newContext(DESKTOP)).newPage();
  await page.goto(s.base + 'login.html');
  await page.fill('#login-name', name);
  await page.fill('#login-email', 'test@example.com');
  await page.fill('#login-password', 'secret');
  await page.click('#login-form button[type=submit]');
  await page.waitForSelector('#login-welcome:not([hidden])');
  const shown = await page.textContent('#login-user');
  const stored = await page.evaluate(() => localStorage.getItem('globoUser'));
  await page.screenshot({ path: path.join(shots, 'login-welcome.png'), fullPage: true });
  await page.reload();                                   // state must survive reload
  const afterReload = await page.isVisible('#login-welcome');
  await page.click('#logout-btn');
  const formBack = await page.isVisible('#login-form');
  console.log(JSON.stringify({ shown, stored, afterReload, formBack }));
  await s.close();
  return shown === name && stored === name && afterReload && formBack;
}

async function smoke() {
  const s = await open();
  const ctx = await s.browser.newContext(DESKTOP);
  const pages = fs.readdirSync(root).filter(f => f.endsWith('.html')).sort();
  const problems = [];
  for (const name of pages) {
    const page = await ctx.newPage();
    // errs = our own pages/assets/scripts (fail the run); ext = third-party iframes
    // (Burger King, Glovo...) that flakily 403 or refuse framing - warn only.
    const errs = [], ext = [];
    page.on('console', m => {
      if (m.type() !== 'error' || m.text().startsWith('Failed to load resource')) return;
      (m.location().url?.startsWith(s.base) && !/Framing|frame-ancestors|X-Frame/.test(m.text()) ? errs : ext).push(m.text());
    });
    page.on('pageerror', e => errs.push(e.message));
    page.on('response', r => r.status() >= 400 &&
      (r.url().startsWith(s.base) ? errs : ext).push(`${r.status()} ${r.url().replace(s.base, '/')}`));
    await page.goto(s.base + name, { waitUntil: 'load' });
    const title = (await page.title()).trim();
    // Local links that point at files that don't exist.
    const links = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')));
    const broken = [...new Set(links.filter(h => !/^(https?:|mailto:|tel:|#)/.test(h))
      .map(h => h.split(/[?#]/)[0]).filter(h => h && !fs.existsSync(path.join(root, h))))];
    // Rendered text that looks like a stray "#comment" (HTML has no # comments).
    const stray = await page.evaluate(() => [...document.body.innerText.split('\n')]
      .filter(l => /^\s*#\S/.test(l)).slice(0, 3));
    await page.screenshot({ path: path.join(shots, name.replace('.html', '') + '.png'), fullPage: true });
    console.log(`${name.padEnd(16)} "${title}"`
      + (broken.length ? `  BROKEN LINKS: ${broken.join(', ')}` : '')
      + (stray.length ? `  STRAY TEXT: ${JSON.stringify(stray)}` : '')
      + (errs.length ? `  ERRORS: ${errs.join(' | ')}` : '')
      + (ext.length ? `  (external, ignored: ${ext.join(' | ').slice(0, 120)})` : ''));
    if (broken.length || errs.length) problems.push(name);
    await page.close();
  }
  // Sidebar toggle (pure-CSS checkbox hack): clicking ☰ should hide the nav.
  const page = await ctx.newPage();
  await page.goto(s.base + 'index.html');
  const before = await page.isVisible('nav.sidebar');
  await page.click('label.menu-btn');
  await page.waitForTimeout(400);                      // let any CSS transition finish
  const box = await page.locator('nav.sidebar').boundingBox();
  const after = await page.isVisible('nav.sidebar') && box && box.width > 1 && box.x + box.width > 0;
  await page.screenshot({ path: path.join(shots, 'index-menu-closed.png') });
  console.log(`menu toggle: visible before=${before} after click=${!!after}`);
  await s.close();
  const ok = await login('Smoke Tester');
  console.log(`login flow: ${ok ? 'ok' : 'FAILED'}`);
  console.log(`screenshots in ${shots}`);
  if (problems.length || !ok) { console.log('FAIL:', problems.join(', ') || 'login'); process.exit(1); }
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'smoke') await smoke();
else if (cmd === 'shot') await shot(args[0] || 'index.html', args[1] === 'mobile');
else if (cmd === 'login') process.exit((await login(args[0] || 'Maria')) ? 0 : 1);
else if (cmd === 'serve') {
  const srv = await serve(Number(args[0]) || 8000);
  console.log(`serving ${root} at http://127.0.0.1:${srv.address().port}/`);
} else { console.log('usage: node driver.mjs smoke | shot <page> [mobile] | login <name> | serve [port]'); process.exit(2); }
