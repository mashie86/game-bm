const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium/chrome-linux/chrome' , args: ['--no-sandbox'] })
    .catch(async () => chromium.launch({ args: ['--no-sandbox'] }));
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGE ERROR: ' + e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + msg.text()); });

  await page.goto('http://localhost:8765/index.html');
  await page.waitForTimeout(300);

  // Splash -> Menu
  await page.click('#btn-mula');
  await page.waitForSelector('#skrin-menu.skrin-aktif');
  console.log('OK: Menu screen shown');

  // Menu -> Peta Tahap 1
  await page.click('.kad-tahap1');
  await page.waitForSelector('#skrin-peta.skrin-aktif');
  const nodeCount = await page.$$eval('.node-level', els => els.length);
  console.log('OK: Peta Tahap1 nodes =', nodeCount);

  // Click first (unlocked) topic node -> Game
  await page.click('.node-level:not(.terkunci)');
  await page.waitForSelector('#skrin-game.skrin-aktif');
  console.log('OK: Game screen shown');

  // Answer 10 questions, always click first available option (mcq) or auto-handle susun
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(150);
    const isSusun = await page.$eval('#susun-wrap', el => !el.hidden).catch(() => false);
    if (isSusun) {
      // click all tokens in order shown (bank), then hantar
      const tokens = await page.$$('#susun-token-bank .token');
      for (const t of tokens) { await t.click(); await page.waitForTimeout(30); }
      await page.click('#btn-susun-hantar');
      await page.waitForTimeout(1700);
    } else {
      await page.click('#pilihan-grid .pilihan-btn >> nth=0');
      await page.waitForTimeout(1400);
    }
  }

  await page.waitForSelector('#skrin-keputusan.skrin-aktif', { timeout: 5000 });
  const skorTeks = await page.textContent('#keputusan-skor');
  console.log('OK: Keputusan screen shown, skor =', skorTeks.trim());

  // Back to peta, check localStorage progress saved
  await page.click('#btn-keputusan-peta');
  await page.waitForSelector('#skrin-peta.skrin-aktif');
  const progress = await page.evaluate(() => localStorage.getItem('bmGamePMM_progress_v1'));
  console.log('OK: localStorage progress saved =', !!progress);

  // Test Tahap 2 quickly
  await page.click('#btn-peta-balik');
  await page.click('.kad-tahap2');
  await page.waitForSelector('#skrin-peta.skrin-aktif');
  const nodeCount2 = await page.$$eval('.node-level', els => els.length);
  console.log('OK: Peta Tahap2 nodes =', nodeCount2);

  // Test padanan bonus node (should be second-to-last)
  const padananLabel = await page.$$eval('.node-level.bonus .node-label', els => els.map(e=>e.textContent));
  console.log('OK: Padanan bonus label =', padananLabel);
  await page.click('.node-level.bonus');
  await page.waitForSelector('#skrin-padanan.skrin-aktif');
  const kiriCount = await page.$$eval('#padanan-kiri .kad-padanan', els => els.length);
  console.log('OK: Padanan kiri count =', kiriCount);

  // Simulate matching: click each kiri then find matching kanan by reading data via page state is tricky;
  // instead just verify click-mismatch feedback works, then exit.
  await page.click('#padanan-kiri .kad-padanan >> nth=0');
  await page.click('#padanan-kanan .kad-padanan >> nth=0');
  await page.waitForTimeout(300);
  console.log('OK: Padanan click interaction executed without crash');

  await page.click('#btn-padanan-keluar');
  await page.waitForSelector('#skrin-peta.skrin-aktif');

  // manifest & service worker checks
  const swRegistered = await page.evaluate(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    return regs.length;
  });
  console.log('OK: Service worker registrations =', swRegistered);

  console.log('--- ERRORS CAUGHT ---', errors.length);
  errors.forEach(e => console.log(e));

  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
})();
