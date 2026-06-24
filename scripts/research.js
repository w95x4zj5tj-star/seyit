// Research script: extract design tokens, screenshots, and best-selling catalog from kossonutrition.nl
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PROXY = process.env.HTTPS_PROXY || 'http://127.0.0.1:35665';
const ROOT = path.resolve(__dirname, '..');
const SS_DIR = path.join(ROOT, 'assets', 'screenshots');
const DATA_DIR = path.join(ROOT, 'data');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    proxy: { server: PROXY },
    args: ['--no-sandbox', '--ignore-certificate-errors'],
  });
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  // ---- 1. Homepage design tokens ----
  console.log('Loading homepage...');
  await page.goto('https://kossonutrition.nl/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  const tokens = await page.evaluate(() => {
    const out = { colors: {}, fonts: {}, samples: [] };
    const seenColor = {};
    const seenFont = {};
    const els = Array.from(document.querySelectorAll('body *')).slice(0, 4000);
    function bump(map, key) { if (!key) return; map[key] = (map[key] || 0) + 1; }
    for (const el of els) {
      const cs = getComputedStyle(el);
      bump(seenColor, cs.color);
      bump(seenColor, cs.backgroundColor);
      bump(seenFont, cs.fontFamily);
    }
    // button styles
    const btns = Array.from(document.querySelectorAll('button, .btn, a.button, [class*="button"]')).slice(0, 20);
    out.buttons = btns.map(b => {
      const cs = getComputedStyle(b);
      return { text: (b.textContent || '').trim().slice(0, 30), bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius, font: cs.fontFamily, weight: cs.fontWeight, transform: cs.textTransform };
    });
    // headings
    const heads = Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 15);
    out.headings = heads.map(h => {
      const cs = getComputedStyle(h);
      return { tag: h.tagName, text: (h.textContent || '').trim().slice(0, 60), font: cs.fontFamily, weight: cs.fontWeight, size: cs.fontSize, color: cs.color, transform: cs.textTransform, spacing: cs.letterSpacing };
    });
    const body = getComputedStyle(document.body);
    out.body = { font: body.fontFamily, color: body.color, bg: body.backgroundColor, size: body.fontSize };
    out.colors = seenColor; out.fonts = seenFont;
    // link fonts (Google fonts) from <link> and @font-face
    out.fontLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"]')).map(l => l.href).filter(h => /font/i.test(h));
    return out;
  });
  fs.writeFileSync(path.join(DATA_DIR, 'tokens.json'), JSON.stringify(tokens, null, 2));
  console.log('Saved tokens.json');

  await page.screenshot({ path: path.join(SS_DIR, 'home-full.png'), fullPage: true });
  await page.screenshot({ path: path.join(SS_DIR, 'home-fold.png') });
  console.log('Saved homepage screenshots');

  // ---- 2. Best-selling products via collection page ----
  console.log('Loading best-sellers...');
  let products = [];
  try {
    await page.goto('https://kossonutrition.nl/collections/all?sort_by=best-selling', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SS_DIR, 'bestsellers-fold.png') });
    products = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="product"], .grid__item, product-card, li'));
      const seen = new Set();
      const res = [];
      for (const c of cards) {
        const a = c.querySelector('a[href*="/products/"]');
        if (!a) continue;
        const href = a.getAttribute('href');
        const handle = (href.match(/\/products\/([^?#]+)/) || [])[1];
        if (!handle || seen.has(handle)) continue;
        const titleEl = c.querySelector('[class*="title"], [class*="Title"], h3, h2, a[href*="/products/"]');
        const priceEl = c.querySelector('[class*="price"], [class*="Price"]');
        const title = (titleEl ? titleEl.textContent : a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
        seen.add(handle);
        res.push({ handle, title, price: priceEl ? priceEl.textContent.trim().replace(/\s+/g, ' ').slice(0,40) : '' });
      }
      return res;
    });
  } catch (e) { console.log('bestseller scrape err', e.message); }
  fs.writeFileSync(path.join(DATA_DIR, 'bestsellers-order.json'), JSON.stringify(products, null, 2));
  console.log('Bestseller handles found:', products.length);

  // ---- 3. Full catalog via products.json (paginated) ----
  console.log('Fetching products.json...');
  let all = [];
  for (let pg = 1; pg <= 10; pg++) {
    const data = await page.evaluate(async (p) => {
      const r = await fetch('/products.json?limit=250&page=' + p);
      if (!r.ok) return null;
      return await r.json();
    }, pg);
    if (!data || !data.products || data.products.length === 0) break;
    all = all.concat(data.products);
    if (data.products.length < 250) break;
  }
  const slim = all.map(p => ({
    handle: p.handle,
    title: p.title,
    vendor: p.vendor,
    type: p.product_type,
    tags: p.tags,
    price: p.variants && p.variants[0] ? p.variants[0].price : null,
    available: p.variants ? p.variants.some(v => v.available) : null,
    image: p.images && p.images[0] ? p.images[0].src : null,
    images: (p.images || []).map(i => i.src),
  }));
  fs.writeFileSync(path.join(DATA_DIR, 'products-full.json'), JSON.stringify(slim, null, 2));
  console.log('Total products in catalog:', slim.length);

  // ---- 4. Screenshot one product page for design reference ----
  if (products[0]) {
    try {
      await page.goto('https://kossonutrition.nl/products/' + products[0].handle, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SS_DIR, 'product-fold.png') });
    } catch (e) {}
  }

  await browser.close();
  console.log('RESEARCH COMPLETE');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
