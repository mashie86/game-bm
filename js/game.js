// Enjin permainan: pemilihan soalan berputar (rotate), penyediaan paparan, dan pemarkahan.
const SOALAN_SETIAP_GAME = 10;

function kocok(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pilih SOALAN_SETIAP_GAME soalan drpd `pool`, mengelakkan id yg terdapat dalam `sejarah` selagi boleh.
function pilihSoalanBerputar(pool, sejarah, bilangan) {
  bilangan = bilangan || SOALAN_SETIAP_GAME;
  const setSejarah = new Set(sejarah);
  const belumDigunakan = pool.filter(q => !setSejarah.has(q.id));
  const sudahDigunakan = pool.filter(q => setSejarah.has(q.id));

  let terpilih = kocok(belumDigunakan);
  if (terpilih.length < bilangan) {
    terpilih = terpilih.concat(kocok(sudahDigunakan));
  }
  return terpilih.slice(0, Math.min(bilangan, pool.length));
}

// Sediakan salinan soalan utk paparan: kocok pilihan mcq (kekalkan jawapan betul betul disurih),
// dan kocok token bagi soalan jenis 'susun'.
function sediakanUntukPaparan(soalan) {
  const s = JSON.parse(JSON.stringify(soalan));
  if (s.jenis === 'mcq') {
    const jawapanBetulTeks = s.pilihan[s.jawapan];
    const pilihanBaharu = kocok(s.pilihan);
    s.pilihan = pilihanBaharu;
    s.jawapan = pilihanBaharu.indexOf(jawapanBetulTeks);
  } else if (s.jenis === 'susun') {
    let cubaan = 0;
    let tokenKocok = kocok(s.ayat);
    while (tokenKocok.join(' ') === s.ayat.join(' ') && cubaan < 8 && s.ayat.length > 1) {
      tokenKocok = kocok(s.ayat);
      cubaan++;
    }
    s.tokenPaparan = tokenKocok;
  }
  return s;
}

function bankUntukTahap(tahapKey) {
  return tahapKey === 'tahap1' ? BANK_TAHAP1 : BANK_TAHAP2;
}

function padananUntukTahap(tahapKey) {
  return tahapKey === 'tahap1' ? PADANAN_TAHAP1 : PADANAN_TAHAP2;
}

function levelsUntukTahap(tahapKey) {
  return tahapKey === 'tahap1' ? LEVELS_TAHAP1 : LEVELS_TAHAP2;
}

// Sediakan satu set 10 soalan permainan untuk level bertopik, atau utk cabaran rawak (semua topik).
function sediakanGame(tahapKey, level, progress) {
  const bank = bankUntukTahap(tahapKey);
  let pool;
  if (level.jenis === 'rawak') {
    pool = bank;
  } else {
    pool = bank.filter(q => q.topik === level.id);
  }
  const sejarah = ambilSejarah(progress, tahapKey, level.id);
  const dipilih = pilihSoalanBerputar(pool, sejarah, SOALAN_SETIAP_GAME);
  return dipilih.map(sediakanUntukPaparan);
}

// Sediakan bulatan padanan pantas: pilih `bilangan` pasangan rawak drpd senarai pasangan penuh.
function sediakanPadanan(tahapKey, bilangan) {
  bilangan = bilangan || 6;
  const semua = padananUntukTahap(tahapKey);
  const dipilih = kocok(semua).slice(0, Math.min(bilangan, semua.length));
  const kiri = dipilih.map((p, i) => ({ id: 'k' + i, teks: p[0], pasanganId: 'k' + i }));
  const kanan = kocok(dipilih.map((p, i) => ({ id: 'k' + i, teks: p[1], pasanganId: 'k' + i })));
  return { kiri, kanan };
}

if (typeof module !== 'undefined') {
  module.exports = { kocok, pilihSoalanBerputar, sediakanUntukPaparan, sediakanGame, sediakanPadanan, bankUntukTahap, padananUntukTahap, levelsUntukTahap, SOALAN_SETIAP_GAME };
}
