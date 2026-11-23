// Render the PNG app icons from site/icon.svg using the pre-installed Playwright Chromium.
//   node tools/make_icons.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const site = path.join(__dirname, '..', 'site');
const svg = fs.readFileSync(path.join(site, 'icon.svg'), 'utf8');

(async () => {
  const browser = await chromium.launch();
  for (const size of [512, 192, 180, 32]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    // iOS adds its own rounded mask, so the PNGs are full-bleed squares.
    const fullBleed = svg.replace('rx="112"', 'rx="0"');
    await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${fullBleed}`);
    await page.screenshot({ path: path.join(site, `icon-${size}.png`), omitBackground: true });
    await page.close();
    console.log('wrote icon-' + size + '.png');
  }
  await browser.close();
})();
