// Pengawal utama aplikasi (navigasi skrin + logik interaksi)
(function () {
  'use strict';

  const STATE = {
    progress: muatProgress(),
    tahapSemasa: null,
    level: null,
    urutanTopik: null, // index dlm senarai topik sahaja (utk unlock logic); null utk bonus/rawak
    soalan: [],
    indexSoalan: 0,
    betul: 0,
    susunTerpilih: [], // senarai index token (dlm tokenPaparan) yg telah disusun
    padanan: null,
    kunciInteraksi: false,
  };

  // ---------- Util skrin ----------
  function tunjukSkrin(id) {
    document.querySelectorAll('.skrin').forEach(s => s.classList.remove('skrin-aktif'));
    document.getElementById(id).classList.add('skrin-aktif');
    window.scrollTo(0, 0);
  }

  function topikLevelsSahaja(tahapKey) {
    return levelsUntukTahap(tahapKey).filter(l => l.jenis === 'topik');
  }

  function jumlahBintangMaks(tahapKey) {
    return topikLevelsSahaja(tahapKey).length * 3;
  }

  function jumlahBintangSemasa(tahapKey) {
    const stars = STATE.progress[tahapKey].stars;
    return topikLevelsSahaja(tahapKey).reduce((jum, l) => jum + (stars[l.id] || 0), 0);
  }

  function kemaskiniBintangMenu() {
    document.getElementById('bintang-tahap1').textContent = `⭐ ${jumlahBintangSemasa('tahap1')} / ${jumlahBintangMaks('tahap1')}`;
    document.getElementById('bintang-tahap2').textContent = `⭐ ${jumlahBintangSemasa('tahap2')} / ${jumlahBintangMaks('tahap2')}`;
  }

  // ---------- Bunyi (SFX) ----------
  function kemaskiniIkonBunyi() {
    const btn = document.getElementById('btn-bunyi-togol');
    if (btn) btn.textContent = Bunyi.isHidup() ? '🔊' : '🔇';
  }
  kemaskiniIkonBunyi();
  document.getElementById('btn-bunyi-togol').addEventListener('click', () => {
    Bunyi.togol();
    kemaskiniIkonBunyi();
  });

  // ---------- Confetti (letupan meriah bila menang) ----------
  const WARNA_CONFETTI = ['#ff6b6b', '#ffa94d', '#ffd43b', '#51cf66', '#4dabf7', '#9775fa'];
  function letupkanConfetti(jumlah) {
    const lapisan = document.getElementById('confetti-lapisan');
    if (!lapisan) return;
    jumlah = jumlah || 60;
    for (let i = 0; i < jumlah; i++) {
      const k = document.createElement('div');
      k.className = 'confetti-keping';
      const saiz = 6 + Math.random() * 6;
      k.style.left = Math.random() * 100 + 'vw';
      k.style.width = saiz + 'px';
      k.style.height = (saiz * 0.4) + 'px';
      k.style.background = WARNA_CONFETTI[i % WARNA_CONFETTI.length];
      const tempoh = 2.2 + Math.random() * 1.6;
      k.style.animationDuration = tempoh + 's';
      k.style.animationDelay = (Math.random() * 0.4) + 's';
      lapisan.appendChild(k);
      setTimeout(() => k.remove(), (tempoh + 0.5) * 1000);
    }
  }

  // ---------- SKRIN SPLASH ----------
  document.getElementById('btn-mula').addEventListener('click', () => {
    Bunyi.klik();
    kemaskiniBintangMenu();
    tunjukSkrin('skrin-menu');
  });

  // ---------- SKRIN MENU ----------
  document.querySelectorAll('.kad-tahap').forEach(kad => {
    kad.addEventListener('click', () => {
      Bunyi.klik();
      STATE.tahapSemasa = kad.dataset.tahap;
      renderPeta();
      tunjukSkrin('skrin-peta');
    });
  });

  document.getElementById('btn-menu-reset').addEventListener('click', () => {
    const ok = window.confirm('Set semula SEMUA progress (bintang & level dibuka)? Tindakan ini tidak boleh diundur.');
    if (ok) {
      STATE.progress = resetSemuaProgress();
      kemaskiniBintangMenu();
    }
  });

  // ---------- SKRIN PETA ----------
  document.getElementById('btn-peta-balik').addEventListener('click', () => {
    Bunyi.klik();
    kemaskiniBintangMenu();
    tunjukSkrin('skrin-menu');
  });

  function renderPeta() {
    const tahapKey = STATE.tahapSemasa;
    document.getElementById('peta-tajuk').textContent = tahapKey === 'tahap1' ? 'Tahap 1 (Thn 1-3)' : 'Tahap 2 (Thn 4-6)';
    const semua = levelsUntukTahap(tahapKey);
    const topikSahaja = topikLevelsSahaja(tahapKey);
    const progressTahap = STATE.progress[tahapKey];
    const wrap = document.getElementById('peta-senarai');
    wrap.innerHTML = '';

    semua.forEach(level => {
      const node = document.createElement('button');
      node.className = 'node-level';
      let terkunci = false;
      let urutan = null;

      if (level.jenis === 'topik') {
        urutan = topikSahaja.findIndex(l => l.id === level.id);
        terkunci = urutan > progressTahap.unlockedIndex;
      } else if (level.jenis === 'rawak') {
        terkunci = progressTahap.unlockedIndex < topikSahaja.length;
        node.classList.add('rawak');
      } else if (level.jenis === 'padanan') {
        terkunci = false; // bonus - sentiasa terbuka
        node.classList.add('bonus');
      }

      if (terkunci) node.classList.add('terkunci');

      const bintang = progressTahap.stars[level.id] || 0;
      const bintangTeks = level.jenis === 'padanan' ? 'Bonus' : (terkunci ? '' : '★'.repeat(bintang) + '☆'.repeat(3 - bintang));

      node.innerHTML = `
        <span class="node-ikon">${level.ikon}</span>
        <span class="node-info">
          <span class="node-label">${level.label}</span>
          <span class="node-bintang">${bintangTeks}</span>
        </span>
        ${terkunci ? '<span class="node-lock">🔒</span>' : ''}
      `;

      node.addEventListener('click', () => {
        if (terkunci) { Bunyi.padananSalah(); return; }
        Bunyi.klik();
        if (level.jenis === 'padanan') {
          mulaPadanan(tahapKey);
        } else {
          mulaGame(tahapKey, level, urutan);
        }
      });

      wrap.appendChild(node);
    });
  }

  // ---------- SKRIN GAME ----------
  document.getElementById('btn-game-keluar').addEventListener('click', () => {
    const ok = window.confirm('Keluar dari permainan ini? Kemajuan soalan semasa tidak akan disimpan.');
    if (ok) { renderPeta(); tunjukSkrin('skrin-peta'); }
  });

  function mulaGame(tahapKey, level, urutan) {
    STATE.tahapSemasa = tahapKey;
    STATE.level = level;
    STATE.urutanTopik = (level.jenis === 'topik') ? urutan : null;
    STATE.soalan = sediakanGame(tahapKey, level, STATE.progress);
    STATE.indexSoalan = 0;
    STATE.betul = 0;
    tunjukSkrin('skrin-game');
    renderSoalanSemasa();
  }

  function labelTopikSoalan(q) {
    const semua = levelsUntukTahap(STATE.tahapSemasa);
    const found = semua.find(l => l.id === q.topik);
    return found ? found.label : '';
  }

  function renderSoalanSemasa() {
    STATE.kunciInteraksi = false;
    const q = STATE.soalan[STATE.indexSoalan];
    const total = STATE.soalan.length;

    document.getElementById('progress-teks').textContent = `Soalan ${STATE.indexSoalan + 1}/${total}`;
    document.getElementById('progress-isi').style.width = `${((STATE.indexSoalan) / total) * 100}%`;
    document.getElementById('skor-semasa').textContent = `⭐${STATE.betul}`;
    document.getElementById('topik-label').textContent = labelTopikSoalan(q);
    document.getElementById('soalan-teks').textContent = q.soalan;

    const maklumBalas = document.getElementById('maklum-balas');
    maklumBalas.hidden = true;
    maklumBalas.textContent = '';
    maklumBalas.className = 'maklum-balas';

    const grid = document.getElementById('pilihan-grid');
    const susunWrap = document.getElementById('susun-wrap');

    if (q.jenis === 'mcq') {
      grid.hidden = false;
      susunWrap.hidden = true;
      grid.innerHTML = '';
      q.pilihan.forEach((teks, i) => {
        const btn = document.createElement('button');
        btn.className = 'pilihan-btn';
        btn.textContent = teks;
        btn.addEventListener('click', () => jawabMcq(i, btn));
        grid.appendChild(btn);
      });
    } else if (q.jenis === 'susun') {
      grid.hidden = true;
      susunWrap.hidden = false;
      STATE.susunTerpilih = [];
      renderSusun(q);
    }
  }

  function jawabMcq(indexPilih, btnDiklik) {
    if (STATE.kunciInteraksi) return;
    STATE.kunciInteraksi = true;
    const q = STATE.soalan[STATE.indexSoalan];
    const semuaBtn = document.querySelectorAll('#pilihan-grid .pilihan-btn');
    const betul = indexPilih === q.jawapan;
    if (betul) { STATE.betul++; Bunyi.betul(); } else { Bunyi.salah(); }

    semuaBtn.forEach((b, i) => {
      b.classList.add('disabled');
      if (i === q.jawapan) b.classList.add('betul');
      else if (i === indexPilih) b.classList.add('salah');
      else b.classList.add('pudar');
    });

    tunjukMaklumBalas(betul, q);
    setTimeout(soalanSeterusnya, 1300);
  }

  function renderSusun(q) {
    const bank = document.getElementById('susun-token-bank');
    const jawapanArea = document.getElementById('susun-jawapan');
    bank.innerHTML = '';
    jawapanArea.innerHTML = '';

    const btnHantar = document.getElementById('btn-susun-hantar');
    btnHantar.classList.remove('disabled');
    btnHantar.style.pointerEvents = '';

    q.tokenPaparan.forEach((teks, i) => {
      const btn = document.createElement('button');
      btn.className = 'token';
      btn.textContent = teks;
      btn.dataset.index = i;
      btn.addEventListener('click', () => pilihToken(i));
      bank.appendChild(btn);
    });
    document.getElementById('btn-susun-hantar').onclick = hantarSusun;
    document.getElementById('btn-susun-reset').onclick = () => { STATE.susunTerpilih = []; segarkanSusunUI(); };
  }

  function pilihToken(i) {
    if (STATE.kunciInteraksi) return;
    if (STATE.susunTerpilih.includes(i)) {
      STATE.susunTerpilih = STATE.susunTerpilih.filter(x => x !== i);
    } else {
      STATE.susunTerpilih.push(i);
    }
    Bunyi.tokenAtur();
    segarkanSusunUI();
  }

  function segarkanSusunUI() {
    const q = STATE.soalan[STATE.indexSoalan];
    const bank = document.getElementById('susun-token-bank');
    const jawapanArea = document.getElementById('susun-jawapan');

    Array.from(bank.children).forEach((btn, i) => {
      btn.style.visibility = STATE.susunTerpilih.includes(i) ? 'hidden' : 'visible';
    });

    jawapanArea.innerHTML = '';
    STATE.susunTerpilih.forEach(i => {
      const btn = document.createElement('button');
      btn.className = 'token token-jawapan';
      btn.textContent = q.tokenPaparan[i];
      btn.addEventListener('click', () => pilihToken(i));
      jawapanArea.appendChild(btn);
    });
  }

  function hantarSusun() {
    if (STATE.kunciInteraksi) return;
    const q = STATE.soalan[STATE.indexSoalan];
    if (STATE.susunTerpilih.length !== q.tokenPaparan.length) {
      window.alert('Sila susun SEMUA perkataan dahulu.');
      return;
    }
    STATE.kunciInteraksi = true;
    const susunanTeks = STATE.susunTerpilih.map(i => q.tokenPaparan[i]).join(' ');
    const betul = susunanTeks.trim().toLowerCase() === q.ayat.join(' ').trim().toLowerCase();
    if (betul) { STATE.betul++; Bunyi.betul(); } else { Bunyi.salah(); }

    document.getElementById('btn-susun-hantar').classList.add('disabled');
    document.getElementById('btn-susun-hantar').style.pointerEvents = 'none';

    tunjukMaklumBalas(betul, q);
    setTimeout(soalanSeterusnya, 1600);
  }

  function tunjukMaklumBalas(betul, q) {
    const el = document.getElementById('maklum-balas');
    el.hidden = false;
    if (betul) {
      el.className = 'maklum-balas betul';
      el.textContent = '✅ Betul! Syabas!';
    } else {
      el.className = 'maklum-balas salah';
      if (q.jenis === 'susun') {
        el.textContent = `❌ Belum tepat. Jawapan: "${q.ayat.join(' ')}"`;
      } else {
        el.textContent = `❌ Belum tepat. Jawapan: "${q.pilihan[q.jawapan]}"`;
      }
    }
    document.getElementById('skor-semasa').textContent = `⭐${STATE.betul}`;
  }

  function soalanSeterusnya() {
    STATE.indexSoalan++;
    if (STATE.indexSoalan >= STATE.soalan.length) {
      tamatkanGame();
    } else {
      renderSoalanSemasa();
    }
  }

  function tamatkanGame() {
    document.getElementById('progress-isi').style.width = '100%';
    const jumlah = STATE.soalan.length;
    const betul = STATE.betul;
    const idDigunakan = STATE.soalan.map(q => q.id);
    const indexUtkRekod = (STATE.level.jenis === 'topik') ? STATE.urutanTopik : null;

    const hasil = rekodKeputusan(STATE.progress, STATE.tahapSemasa, indexUtkRekod, STATE.level.id, betul, jumlah, idDigunakan);
    tunjukKeputusan(betul, jumlah, hasil);
  }

  function tunjukKeputusan(betul, jumlah, hasil) {
    const bintang = hasil.bintang;
    document.getElementById('keputusan-skor').textContent = `${betul} / ${jumlah}`;

    const bintangEl = document.getElementById('keputusan-bintang');
    bintangEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.textContent = i < bintang ? '⭐' : '☆';
      bintangEl.appendChild(span);
    }

    let emoji = '🎉', tajuk = 'Syabas!', mesej = 'Teruskan usaha, kamu semakin hebat!';
    if (bintang === 3) {
      emoji = '🏆'; tajuk = 'Cemerlang!'; mesej = 'Semua jawapan betul! Kamu memang hebat!';
      Bunyi.menangBesar();
      letupkanConfetti(70);
    } else if (bintang === 0) {
      emoji = '💪'; tajuk = 'Jangan Putus Asa!'; mesej = 'Cuba lagi sekali untuk buka level seterusnya.';
      Bunyi.cubaLagi();
    } else if (hasil.levelSeterusnyaDibuka) {
      mesej = 'Bagus! Level seterusnya telah dibuka.';
      Bunyi.unlock();
      letupkanConfetti(30);
    } else {
      Bunyi.betul();
    }

    document.getElementById('keputusan-emoji').textContent = emoji;
    document.getElementById('keputusan-tajuk').textContent = tajuk;
    document.getElementById('keputusan-mesej').textContent = mesej;

    tunjukSkrin('skrin-keputusan');
  }

  document.getElementById('btn-keputusan-peta').addEventListener('click', () => {
    Bunyi.klik();
    renderPeta();
    kemaskiniBintangMenu();
    tunjukSkrin('skrin-peta');
  });

  document.getElementById('btn-keputusan-ulang').addEventListener('click', () => {
    Bunyi.klik();
    mulaGame(STATE.tahapSemasa, STATE.level, STATE.urutanTopik);
  });

  // ---------- SKRIN PADANAN PANTAS ----------
  document.getElementById('btn-padanan-keluar').addEventListener('click', () => {
    Bunyi.klik();
    renderPeta();
    tunjukSkrin('skrin-peta');
  });

  function mulaPadanan(tahapKey) {
    STATE.tahapSemasa = tahapKey;
    const data = sediakanPadanan(tahapKey, 6);
    STATE.padanan = { kiri: data.kiri, kanan: data.kanan, pilihKiri: null, sepadan: 0, jumlah: data.kiri.length };
    renderPadanan();
    tunjukSkrin('skrin-padanan');
  }

  function renderPadanan() {
    const p = STATE.padanan;
    document.getElementById('padanan-skor').textContent = `${p.sepadan}/${p.jumlah}`;
    const kiriEl = document.getElementById('padanan-kiri');
    const kananEl = document.getElementById('padanan-kanan');
    kiriEl.innerHTML = '';
    kananEl.innerHTML = '';

    p.kiri.forEach(item => {
      const kad = document.createElement('button');
      kad.className = 'kad-padanan';
      kad.textContent = item.teks;
      kad.dataset.id = item.id;
      if (item.sepadan) kad.classList.add('sepadan');
      if (p.pilihKiri === item.id) kad.classList.add('pilih');
      kad.addEventListener('click', () => klikKiri(item));
      kiriEl.appendChild(kad);
    });

    p.kanan.forEach(item => {
      const kad = document.createElement('button');
      kad.className = 'kad-padanan';
      kad.textContent = item.teks;
      kad.dataset.id = item.id;
      if (item.sepadan) kad.classList.add('sepadan');
      kad.addEventListener('click', () => klikKanan(item));
      kananEl.appendChild(kad);
    });
  }

  function klikKiri(item) {
    if (item.sepadan) return;
    STATE.padanan.pilihKiri = (STATE.padanan.pilihKiri === item.id) ? null : item.id;
    renderPadanan();
  }

  function klikKanan(item) {
    const p = STATE.padanan;
    if (item.sepadan || !p.pilihKiri) return;
    const betul = p.pilihKiri === item.pasanganId;
    if (betul) {
      Bunyi.padananBetul();
      p.kiri.find(k => k.id === item.id).sepadan = true;
      item.sepadan = true;
      p.sepadan++;
      p.pilihKiri = null;
      renderPadanan();
      if (p.sepadan >= p.jumlah) {
        Bunyi.menangBesar();
        letupkanConfetti(50);
        setTimeout(() => {
          window.alert(`🎉 Syabas! Semua ${p.jumlah} pasangan berjaya dipadankan!`);
          renderPeta();
          tunjukSkrin('skrin-peta');
        }, 300);
      }
    } else {
      Bunyi.padananSalah();
      const kadKanan = document.querySelector(`#padanan-kanan [data-id="${item.id}"]`);
      const kadKiri = document.querySelector(`#padanan-kiri [data-id="${p.pilihKiri}"]`);
      [kadKanan, kadKiri].forEach(k => k && k.classList.add('salah-kilat'));
      setTimeout(() => {
        [kadKanan, kadKiri].forEach(k => k && k.classList.remove('salah-kilat'));
      }, 500);
    }
  }

  // ---------- PWA: Service Worker + Install ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* diam-diam gagal */ });
    });
  }

  let eventPasang = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    eventPasang = e;
    document.getElementById('btn-pasang').hidden = false;
  });
  document.getElementById('btn-pasang').addEventListener('click', async () => {
    if (!eventPasang) return;
    eventPasang.prompt();
    await eventPasang.userChoice;
    eventPasang = null;
    document.getElementById('btn-pasang').hidden = true;
  });

  // ---------- Mula ----------
  kemaskiniBintangMenu();

  // Hook debug ringan (tidak mempengaruhi UI) - berguna utk ujian automatik/QA.
  window.__BM_DEBUG__ = { STATE, mulaGame, mulaPadanan, renderPeta, tunjukSkrin };
})();
