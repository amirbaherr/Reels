// Usage:
//   node render.js preview <out_dir> t1 t2 ...      -> PNG stills
//   node render.js video <out.mp4> [workers]        -> silent video (30 fps)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const PAGE = 'file://' + path.join(__dirname, 'index.html');

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto(PAGE);
  await page.evaluate(() => window.ready);
  return page;
}

async function grab(page, t, type = 'jpeg') {
  await page.evaluate(tt => window.renderAt(tt), t);
  return page.screenshot({ type, quality: type === 'jpeg' ? 93 : undefined, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
}

async function renderRange(browser, f0, f1, outFile) {
  const page = await openPage(browser);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = f0; f < f1; f++) {
    const img = await grab(page, f / FPS);
    if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`frame ${f}/${f1}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await page.close();
}

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--font-render-hinting=none'] });
  if (mode === 'preview') {
    fs.mkdirSync(out, { recursive: true });
    const page = await openPage(browser);
    for (const t of rest) fs.writeFileSync(path.join(out, `t${String(t).padStart(5, '0')}.png`), await grab(page, parseFloat(t), 'png'));
  } else {
    const workers = parseInt(rest[0] || '4');
    const dur = await (await openPage(browser)).evaluate(() => window.DUR);
    const total = Math.ceil(dur * FPS);
    const per = Math.ceil(total / workers);
    const tmp = path.resolve(path.dirname(out), 'parts'); fs.mkdirSync(tmp, { recursive: true });
    const parts = [];
    await Promise.all(Array.from({ length: workers }, (_, i) => {
      const f0 = i * per, f1 = Math.min(total, f0 + per);
      const p = path.join(tmp, `part${i}.mp4`); parts.push(p);
      return renderRange(browser, f0, f1, p);
    }));
    fs.writeFileSync(path.join(tmp, 'list.txt'), parts.map(p => `file '${p}'`).join('\n'));
    await new Promise(r => spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-c', 'copy', out], { stdio: 'inherit' }).on('close', r));
  }
  await browser.close();
})();
