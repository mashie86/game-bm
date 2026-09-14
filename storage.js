// Pengurusan simpanan progress permainan (localStorage)
const STORAGE_KEY = 'bmGamePMM_progress_v1';
const AMBANG_LULUS = 6; // markah minimum (drpd 10) untuk buka level seterusnya
const SEJARAH_MAKS = 40; // bilangan id soalan terkini disimpan utk elak ulangan segera

function _tahapKosong() {
  return { unlockedIndex: 0, stars: {}, bestScore: {}, history: {}, playsCount: {} };
}

function muatProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('tiada data');
    const data = JSON.parse(raw);
    if (!data.tahap1) data.tahap1 = _tahapKosong();
    if (!data.tahap2) data.tahap2 = _tahapKosong();
    if (!data.settings) data.settings = { bunyi: true };
    return data;
  } catch (e) {
    return { tahap1: _tahapKosong(), tahap2: _tahapKosong(), settings: { bunyi: true } };
  }
}

function simpanProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* diam-diam gagal, tidak fatal */ }
}

function levelDibuka(progress, tahapKey, indexLevel) {
  return indexLevel <= progress[tahapKey].unlockedIndex;
}

function ambilSejarah(progress, tahapKey, levelId) {
  return progress[tahapKey].history[levelId] || [];
}

function kemaskiniSejarah(progress, tahapKey, levelId, idBaharu) {
  const sedia = ambilSejarah(progress, tahapKey, levelId);
  const gabung = sedia.concat(idBaharu);
  progress[tahapKey].history[levelId] = gabung.slice(-SEJARAH_MAKS);
}

function kiraBintang(betul, jumlah) {
  const peratus = betul / jumlah;
  if (peratus === 1) return 3;
  if (peratus >= 0.8) return 2;
  if (peratus >= AMBANG_LULUS / jumlah) return 1;
  return 0;
}

function rekodKeputusan(progress, tahapKey, indexLevel, levelId, betul, jumlah, idDigunakan) {
  const t = progress[tahapKey];
  const bintangBaharu = kiraBintang(betul, jumlah);
  const bintangSedia = t.stars[levelId] || 0;
  t.stars[levelId] = Math.max(bintangSedia, bintangBaharu);
  t.bestScore[levelId] = Math.max(t.bestScore[levelId] || 0, betul);
  t.playsCount[levelId] = (t.playsCount[levelId] || 0) + 1;
  kemaskiniSejarah(progress, tahapKey, levelId, idDigunakan);

  let levelSeterusnyaDibuka = false;
  if (betul >= AMBANG_LULUS && indexLevel === t.unlockedIndex) {
    t.unlockedIndex = indexLevel + 1;
    levelSeterusnyaDibuka = true;
  }
  simpanProgress(progress);
  return { bintang: bintangBaharu, levelSeterusnyaDibuka };
}

function resetProgressTahap(progress, tahapKey) {
  progress[tahapKey] = _tahapKosong();
  simpanProgress(progress);
}

function resetSemuaProgress() {
  const kosong = { tahap1: _tahapKosong(), tahap2: _tahapKosong(), settings: { bunyi: true } };
  simpanProgress(kosong);
  return kosong;
}

if (typeof module !== 'undefined') {
  module.exports = { muatProgress, simpanProgress, levelDibuka, ambilSejarah, kemaskiniSejarah, kiraBintang, rekodKeputusan, resetProgressTahap, resetSemuaProgress, AMBANG_LULUS };
}
