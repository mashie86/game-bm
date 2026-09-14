// Sistem bunyi kesan (SFX) - dijana terus guna Web Audio API, TIADA fail audio luar diperlukan.
// Ini bermakna ia automatik berfungsi offline (PWA) tanpa perlu cache fail mp3/ogg.
const Bunyi = (function () {
  let ctx = null;
  let dihidupkan = true;

  function ambilProgress() {
    try { return muatProgress(); } catch (e) { return null; }
  }

  // Baca keutamaan bunyi dari progress semasa mula (default: hidup)
  const pSedia = ambilProgress();
  if (pSedia && pSedia.settings && pSedia.settings.bunyi === false) dihidupkan = false;

  function pastikanCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Nada tunggal ringkas
  function nada(freq, masaMula, tempoh, jenis, volMax) {
    const c = pastikanCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = jenis || 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime + masaMula);
    gain.gain.setValueAtTime(0.0001, c.currentTime + masaMula);
    gain.gain.exponentialRampToValueAtTime(volMax || 0.18, c.currentTime + masaMula + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + masaMula + tempoh);
    osc.connect(gain).connect(c.destination);
    osc.start(c.currentTime + masaMula);
    osc.stop(c.currentTime + masaMula + tempoh + 0.02);
  }

  function siri(nadaSenarai) {
    if (!dihidupkan) return;
    nadaSenarai.forEach(n => nada(n.freq, n.mula, n.tempoh, n.jenis, n.vol));
  }

  return {
    klik() { siri([{ freq: 520, mula: 0, tempoh: 0.06, jenis: 'triangle', vol: 0.10 }]); },

    betul() {
      siri([
        { freq: 523.25, mula: 0, tempoh: 0.11, jenis: 'sine', vol: 0.16 },   // C5
        { freq: 659.25, mula: 0.09, tempoh: 0.11, jenis: 'sine', vol: 0.16 }, // E5
        { freq: 783.99, mula: 0.18, tempoh: 0.18, jenis: 'sine', vol: 0.18 }, // G5
      ]);
    },

    salah() {
      siri([
        { freq: 300, mula: 0, tempoh: 0.16, jenis: 'sawtooth', vol: 0.10 },
        { freq: 220, mula: 0.10, tempoh: 0.22, jenis: 'sawtooth', vol: 0.10 },
      ]);
    },

    tokenAtur() { siri([{ freq: 440, mula: 0, tempoh: 0.05, jenis: 'square', vol: 0.06 }]); },

    padananBetul() {
      siri([
        { freq: 660, mula: 0, tempoh: 0.09, jenis: 'sine', vol: 0.14 },
        { freq: 880, mula: 0.07, tempoh: 0.12, jenis: 'sine', vol: 0.15 },
      ]);
    },

    padananSalah() { siri([{ freq: 200, mula: 0, tempoh: 0.15, jenis: 'sawtooth', vol: 0.09 }]); },

    unlock() {
      siri([
        { freq: 392.00, mula: 0, tempoh: 0.10, jenis: 'triangle', vol: 0.14 },
        { freq: 523.25, mula: 0.09, tempoh: 0.10, jenis: 'triangle', vol: 0.15 },
        { freq: 659.25, mula: 0.18, tempoh: 0.10, jenis: 'triangle', vol: 0.16 },
        { freq: 880.00, mula: 0.27, tempoh: 0.22, jenis: 'triangle', vol: 0.18 },
      ]);
    },

    menangBesar() { // 3 bintang / cabaran rawak
      siri([
        { freq: 523.25, mula: 0.00, tempoh: 0.12, jenis: 'sine', vol: 0.17 },
        { freq: 659.25, mula: 0.11, tempoh: 0.12, jenis: 'sine', vol: 0.17 },
        { freq: 783.99, mula: 0.22, tempoh: 0.12, jenis: 'sine', vol: 0.18 },
        { freq: 1046.50, mula: 0.33, tempoh: 0.30, jenis: 'sine', vol: 0.20 },
      ]);
    },

    cubaLagi() { // 0 bintang - lembut, tidak menghukum
      siri([
        { freq: 392, mula: 0, tempoh: 0.14, jenis: 'sine', vol: 0.10 },
        { freq: 349, mula: 0.12, tempoh: 0.18, jenis: 'sine', vol: 0.10 },
      ]);
    },

    isHidup() { return dihidupkan; },

    togol() {
      dihidupkan = !dihidupkan;
      try {
        const p = muatProgress();
        p.settings.bunyi = dihidupkan;
        simpanProgress(p);
      } catch (e) { /* diam-diam gagal */ }
      if (dihidupkan) this.klik();
      return dihidupkan;
    },
  };
})();

if (typeof module !== 'undefined') { module.exports = Bunyi; }
