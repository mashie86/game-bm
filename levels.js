// Konfigurasi peta level untuk setiap Tahap.
// jenis 'topik'  -> tarik soalan drpd bank ikut medan `topik`
// jenis 'padanan'-> mod bonus padanan pantas (tiada dalam kiraan wajib)
// jenis 'rawak'  -> cabaran akhir, campur SEMUA topik dalam tahap tsb

const LEVELS_TAHAP1 = [
  { id:'suku-kata-ejaan',      label:'Suku Kata & Ejaan',        ikon:'🔤', jenis:'topik' },
  { id:'kata-nama',            label:'Kata Nama',                 ikon:'📛', jenis:'topik' },
  { id:'kata-kerja',           label:'Kata Kerja',                ikon:'🏃', jenis:'topik' },
  { id:'kata-adjektif',        label:'Kata Adjektif',             ikon:'🎨', jenis:'topik' },
  { id:'ganti-nama-diri',      label:'Kata Ganti Nama',           ikon:'🙋', jenis:'topik' },
  { id:'ayat-tanda-baca',      label:'Ayat & Tanda Baca',         ikon:'✍️', jenis:'topik' },
  { id:'peribahasa-mudah',     label:'Simpulan Bahasa Mudah',     ikon:'💬', jenis:'topik' },
  { id:'kefahaman-kosa-kata',  label:'Kefahaman & Kosa Kata',     ikon:'📖', jenis:'topik' },
  { id:'padanan-bonus',        label:'Padanan Pantas',            ikon:'🔗', jenis:'padanan', bonus:true },
  { id:'cabaran-rawak',        label:'Cabaran Rawak',             ikon:'🏆', jenis:'rawak' },
];

const LEVELS_TAHAP2 = [
  { id:'kata-ganti-nama',        label:'Kata Ganti Nama',          ikon:'🙋', jenis:'topik' },
  { id:'kata-sendi-nama',        label:'Kata Sendi Nama',          ikon:'📍', jenis:'topik' },
  { id:'kata-hubung',            label:'Kata Hubung',              ikon:'🔗', jenis:'topik' },
  { id:'imbuhan-awalan',         label:'Imbuhan Awalan',           ikon:'⬅️', jenis:'topik' },
  { id:'imbuhan-akhiran',        label:'Imbuhan Akhiran',          ikon:'➡️', jenis:'topik' },
  { id:'imbuhan-apitan',         label:'Imbuhan Apitan',           ikon:'🔁', jenis:'topik' },
  { id:'peribahasa-simpulan',    label:'Peribahasa & Simpulan',    ikon:'💬', jenis:'topik' },
  { id:'ayat-majmuk-tatabahasa', label:'Ayat Majmuk & Tatabahasa', ikon:'✍️', jenis:'topik' },
  { id:'kefahaman-lanjutan',     label:'Kefahaman Lanjutan',       ikon:'📖', jenis:'topik' },
  { id:'padanan-bonus',          label:'Padanan Pantas',           ikon:'🔗', jenis:'padanan', bonus:true },
  { id:'cabaran-rawak',          label:'Cabaran Rawak',            ikon:'🏆', jenis:'rawak' },
];

if (typeof module !== 'undefined') { module.exports = { LEVELS_TAHAP1, LEVELS_TAHAP2 }; }
