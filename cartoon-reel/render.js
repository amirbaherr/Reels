#!/usr/bin/env node
// Deterministic frame-by-frame renderer for comp.html.
//
//   node render.js                      -> build/reel.mp4 (full video + audio/vo.wav)
//   node render.js stills 1.2 6.5 14    -> build/stills/still_01.200s.png ...
//   node render.js video --from 5 --to 9 --out build/test.mp4   (partial render)
//
// Each frame: window.renderFrame(t) is awaited, then a screenshot is piped to ffmpeg.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const ROOT = __dirname;
const W = 1080, H = 1920, FPS = 30;
const AUDIO = path.join(ROOT, 'audio', 'vo.wav');

const CHROME = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/opt/google/chrome/chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/opt/pw-browsers/chromium']
  .find(p => p && fs.existsSync(p));

function parseArgs(argv) {
  const a = { mode: 'video', times: [], from: 0, to: null, out: path.join(ROOT, 'build', 'reel.mp4') };
  const rest = argv.slice(2);
  if (rest[0] === 'stills' || rest[0] === 'video') a.mode = rest.shift();
  for (let i = 0; i < rest.length; i++) {
    const k = rest[i];
    if (k === '--from') a.from = parseFloat(rest[++i]);
    else if (k === '--to') a.to = parseFloat(rest[++i]);
    else if (k === '--out') a.out = path.resolve(rest[++i]);
    else a.times.push(parseFloat(k));
  }
  return a;
}

function audioDuration() {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', AUDIO]).toString();
  return parseFloat(out);
}

// Tiny static server so ES modules / fetch / fonts all load from local disk (no internet needed).
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.wav': 'audio/wav' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, resp) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { resp.writeHead(404); return resp.end(); }
      resp.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(resp);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

async function openPage(port) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
      `--window-size=${W},${H}`],
  });
  const page = await browser.newPage();
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.error('[page error]', e.message));
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/comp.html`, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.__ready === true', { timeout: 60000 });
  return { browser, page };
}

async function shot(page, type) {
  return page.screenshot({ type, quality: type === 'jpeg' ? 95 : undefined,
    clip: { x: 0, y: 0, width: W, height: H }, optimizeForSpeed: true, captureBeyondViewport: false });
}

(async () => {
  const args = parseArgs(process.argv);
  if (!CHROME) throw new Error('Chrome not found; set CHROME_PATH');
  const srv = await serve();
  const { browser, page } = await openPage(srv.address().port);

  try {
    if (args.mode === 'stills') {
      const dir = path.join(ROOT, 'build', 'stills');
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const times = args.times.length ? args.times : [1, 5, 10, 15, 20, 30];
      for (const [i, t] of times.entries()) {
        await page.evaluate(t => window.renderFrame(t), t);
        const f = path.join(dir, `still_${String(i + 1).padStart(2, '0')}_${t.toFixed(2)}s.png`);
        fs.writeFileSync(f, await shot(page, 'png'));
        console.log('wrote', path.relative(ROOT, f));
      }
      return;
    }

    const dur = audioDuration();
    const t0 = args.from, t1 = args.to ?? dur;
    const nFrames = Math.ceil((t1 - t0) * FPS);
    fs.mkdirSync(path.dirname(args.out), { recursive: true });
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-ss', String(t0), '-t', String(t1 - t0), '-i', AUDIO,
      '-map', '0:v', '-map', '1:a',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS),
      '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', args.out],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    const ffDone = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));

    const start = Date.now();
    for (let i = 0; i < nFrames; i++) {
      const t = t0 + i / FPS;
      await page.evaluate(t => window.renderFrame(t), t);
      const buf = await shot(page, 'jpeg');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 30 === 0 || i === nFrames - 1) {
        const el = (Date.now() - start) / 1000, eta = el / (i + 1) * (nFrames - i - 1);
        process.stdout.write(`\rframe ${i + 1}/${nFrames}  t=${t.toFixed(2)}s  elapsed ${el.toFixed(0)}s  eta ${eta.toFixed(0)}s   `);
      }
    }
    ff.stdin.end();
    await ffDone;
    console.log(`\nwrote ${path.relative(ROOT, args.out)} in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  } finally {
    await browser.close();
    srv.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
