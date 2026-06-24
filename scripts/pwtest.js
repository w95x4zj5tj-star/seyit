const { chromium } = require('playwright');
(async () => {
  for (const variant of ['plain','noquic']) {
    const args = ['--no-sandbox','--ignore-certificate-errors','--disable-dev-shm-usage'];
    if (variant==='noquic') args.push('--disable-quic','--disable-http2');
    try {
      const browser = await chromium.launch({ headless:true, proxy:{server: process.env.HTTPS_PROXY}, args });
      const ctx = await browser.newContext({ ignoreHTTPSErrors:true });
      const page = await ctx.newPage();
      const r = await page.goto('https://kossonutrition.nl/', { waitUntil:'domcontentloaded', timeout:30000 });
      console.log(variant, 'OK status', r.status(), 'title', (await page.title()).slice(0,40));
      await browser.close();
    } catch(e){ console.log(variant,'ERR', e.message.split('\n')[0]); }
  }
})();
