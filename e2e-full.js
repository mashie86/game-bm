const { chromium } = require('playwright');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
    // guna hook debug utk baca STATE.soalan & jawab semua dgn betul melalui UI sebenar
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
        // susun: klik token ikut urutan ayat betul (cari index dlm tokenPaparan utk setiap perkataan ayat, guna sekali sahaja)
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
    const skor = (await page.textContent('#keputusan-skor')).trim();
    return skor;
  }

  // Mula
  await page.click('#btn-mula');
  await page.click('.kad-tahap1');
  await page.waitForSelector('#skrin-peta.skrin-aktif');

  const topikUrutan = ['suku-kata-ejaan','kata-nama','kata-kerja','kata-adjektif','ganti-nama-diri','ayat-tanda-baca','peribahasa-mudah','kefahaman-kosa-kata'];

  for (const topikId of topikUrutan) {
    // klik node TERAKHIR yg tak terkunci (frontier terkini) - bukan yg pertama, spy betul2 maju ke topik baharu
    const semuaNodeTakTerkunci = await page.$$('.node-level:not(.terkunci):not(.bonus):not(.rawak)');
    const nodeSekarang = semuaNodeTakTerkunci[semuaNodeTakTerkunci.length - 1];
    await nodeSekarang.click();
    await page.waitForSelector('#skrin-game.skrin-aktif');
    const topikBenar = await page.textContent('#topik-label');
    const skor = await jawabSemuaBetul();
    console.log(`Dijangka "${topikId}" | Sebenar dimainkan: "${topikBenar}" | skor = ${skor}`);
    if (skor.trim() !== '10 / 10') throw new Error('Jangka 10/10 utk topik ' + topikId + ' tapi dapat ' + skor);
    await page.click('#btn-keputusan-peta');
    await page.waitForSelector('#skrin-peta.skrin-aktif');
  }

  // Semua topik patut sudah lepas -> cabaran rawak patut terbuka
  const rawakTerkunci = await page.$eval('.node-level.rawak', el => el.classList.contains('terkunci'));
  console.log('Cabaran Rawak terkunci selepas semua topik lepas?', rawakTerkunci, '(sepatutnya false)');
  if (rawakTerkunci) throw new Error('Cabaran Rawak sepatutnya terbuka!');

  await page.click('.node-level.rawak');
  await page.waitForSelector('#skrin-game.skrin-aktif');
  const skorRawak = await jawabSemuaBetul();
  console.log('Cabaran Rawak: skor =', skorRawak);
  await page.click('#btn-keputusan-peta');

  // Semak jumlah bintang pada skrin menu
  await page.click('#btn-peta-balik');
  const teksBintang1 = await page.textContent('#bintang-tahap1');
  console.log('Jumlah bintang Tahap 1:', teksBintang1.trim(), '(sepatutnya 24/24 jika semua 3 bintang)');

  // Uji reset progress
  page.once('dialog', d => d.accept());
  await page.click('#btn-menu-reset');
  await page.waitForTimeout(200);
  const teksBintangSelepasReset = await page.textContent('#bintang-tahap1');
  console.log('Selepas reset:', teksBintangSelepasReset.trim(), '(sepatutnya 0/24)');

  console.log('--- ERRORS CAUGHT ---', errors.length);
  errors.forEach(e => console.log(e));
  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
})().catch(e => { console.error('TEST GAGAL:', e.message); process.exit(1); });
