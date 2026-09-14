const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGE ERROR: ' + e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + msg.text()); });

  await page.goto('http://localhost:8765/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(200);

  async function jawabSemuaBetul() {
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(80);
      const info = await page.evaluate(() => {
        const S = window.__BM_DEBUG__.STATE;
        const q = S.soalan[S.indexSoalan];
        return { jenis: q.jenis, jawapanTeks: q.jenis === 'mcq' ? q.pilihan[q.jawapan] : null, ayat: q.jenis === 'susun' ? q.ayat : null, tokenPaparan: q.jenis === 'susun' ? q.tokenPaparan : null };
      });
      if (info.jenis === 'mcq') {
        const buttons = await page.$$('#pilihan-grid .pilihan-btn');
        let clicked = false;
        for (const b of buttons) {
          const t = await b.textContent();
          if (t === info.jawapanTeks) { await b.click(); clicked = true; break; }
        }
        if (!clicked) throw new Error('Tidak jumpa butang jawapan betul utk: ' + info.jawapanTeks);
        await page.waitForTimeout(1350);
      } else {
        const dipakai = new Array(info.tokenPaparan.length).fill(false);
        for (const perkataan of info.ayat) {
          let idxGuna = -1;
          for (let j = 0; j < info.tokenPaparan.length; j++) {
            if (!dipakai[j] && info.tokenPaparan[j] === perkataan) { idxGuna = j; break; }
          }
          if (idxGuna === -1) throw new Error('Token tidak ditemui: ' + perkataan);
          dipakai[idxGuna] = true;
          const tokenBtn = (await page.$$('#susun-token-bank .token'))[idxGuna];
          await tokenBtn.click();
          await page.waitForTimeout(40);
        }
        await page.click('#btn-susun-hantar');
        await page.waitForTimeout(1650);
      }
    }
    await page.waitForSelector('#skrin-keputusan.skrin-aktif', { timeout: 5000 });
    return (await page.textContent('#keputusan-skor')).trim();
  }

  await page.click('#btn-mula');
  await page.click('.kad-tahap2');
  await page.waitForSelector('#skrin-peta.skrin-aktif');

  const topikUrutan2 = ['kata-ganti-nama','kata-sendi-nama','kata-hubung','imbuhan-awalan','imbuhan-akhiran','imbuhan-apitan','peribahasa-simpulan','ayat-majmuk-tatabahasa','kefahaman-lanjutan'];

  for (const topikId of topikUrutan2) {
    const semuaNodeTakTerkunci = await page.$$('.node-level:not(.terkunci):not(.bonus):not(.rawak)');
    const nodeSekarang = semuaNodeTakTerkunci[semuaNodeTakTerkunci.length - 1];
    await nodeSekarang.click();
    await page.waitForSelector('#skrin-game.skrin-aktif');
    const topikBenar = await page.textContent('#topik-label');
    const skor = await jawabSemuaBetul();
    console.log(`Dijangka "${topikId}" | Sebenar: "${topikBenar}" | skor = ${skor}`);
    if (skor !== '10 / 10') throw new Error('Jangka 10/10 utk ' + topikId + ' dpt ' + skor);
    await page.click('#btn-keputusan-peta');
    await page.waitForSelector('#skrin-peta.skrin-aktif');
  }

  const rawakTerkunci = await page.$eval('.node-level.rawak', el => el.classList.contains('terkunci'));
  console.log('Cabaran Rawak Tahap2 terkunci?', rawakTerkunci, '(sepatutnya false)');
  await page.click('.node-level.rawak');
  await page.waitForSelector('#skrin-game.skrin-aktif');
  const skorRawak = await jawabSemuaBetul();
  console.log('Cabaran Rawak Tahap2: skor =', skorRawak);
  await page.click('#btn-keputusan-peta');

  await page.click('#btn-peta-balik');
  const bintang2 = await page.textContent('#bintang-tahap2');
  console.log('Jumlah bintang Tahap 2:', bintang2.trim(), '(sepatutnya 27/27)');

  // Ujian padanan tahap2 penuh (padan semua 6 pasangan dgn betul menggunakan data sebenar)
  await page.click('.kad-tahap2');
  await page.waitForSelector('#skrin-peta.skrin-aktif');
  await page.click('.node-level.bonus');
  await page.waitForSelector('#skrin-padanan.skrin-aktif');
  for (let i = 0; i < 6; i++) {
    const pasangan = await page.evaluate(() => {
      const p = window.__BM_DEBUG__.STATE.padanan;
      const kiriTerbuka = p.kiri.find(k => !k.sepadan);
      return kiriTerbuka ? kiriTerbuka.id : null;
    });
    if (!pasangan) break;
    await page.click(`#padanan-kiri [data-id="${pasangan}"]`);
    await page.click(`#padanan-kanan [data-id="${pasangan}"]`);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);
  console.log('OK: Padanan Tahap2 selesai tanpa ralat');

  console.log('--- ERRORS CAUGHT ---', errors.length);
  errors.forEach(e => console.log(e));
  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
})().catch(e => { console.error('TEST GAGAL:', e.message); process.exit(1); });
