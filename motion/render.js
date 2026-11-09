// Renders motion/index.html frame-by-frame with Playwright and encodes an MP4 with ffmpeg.
//   node motion/render.js                      -> output/reel.mp4
//   node motion/render.js --stills 1,14.5,60   -> output/stills/*.png
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'output');
const FPS = 30;
const WORKERS = Number(process.env.WORKERS || 4);
const URL = 'file://' + path.join(__dirname, 'index.html');

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(URL);
  await page.evaluate(() => window.ready);
  return page;
}

async function stills(times) {
  const dir = path.join(OUT, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const page = await openPage(browser);
  for (const t of times) {
    await page.evaluate(t => window.renderFrame(t), t);
    const f = path.join(dir, `t${String(t).padStart(5, '0')}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
  await browser.close();
}

async function renderSegment(browser, k, from, to, file) {
  const page = await openPage(browser);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  for (let i = from; i < to; i++) {
    await page.evaluate(t => window.renderFrame(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((i - from) % 60 === 0) console.log(`worker ${k}: frame ${i}/${to}`);
  }
  ff.stdin.end();
  await done;
  await page.close();
}

async function video() {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'reel-'));
  const browser = await chromium.launch();
  const probe = await openPage(browser);
  const duration = await probe.evaluate(() => window.DURATION);
  await probe.close();
  const total = Math.round(duration * FPS);
  const per = Math.ceil(total / WORKERS);
  const segs = [];
  const jobs = [];
  for (let k = 0; k < WORKERS; k++) {
    const from = k * per, to = Math.min(total, from + per);
    if (from >= to) break;
    const f = path.join(tmp, `seg${k}.mp4`);
    segs.push(f);
    jobs.push(renderSegment(browser, k, from, to, f));
  }
  await Promise.all(jobs);
  await browser.close();
  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
  const out = path.join(OUT, 'reel.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
    '-i', path.join(ROOT, 'assets/audio/voiceover.wav'),
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-af', 'apad', '-t', String(duration), '-movflags', '+faststart', out], { stdio: 'inherit' });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('wrote', out);
}

const i = process.argv.indexOf('--stills');
(i > 0 ? stills(process.argv[i + 1].split(',').map(Number)) : video()).catch(e => { console.error(e); process.exit(1); });
