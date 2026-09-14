// Bank Padanan (mod bonus "Padanan Pantas") - padankan pasangan yang berkaitan
// Tahap 1: padankan perkataan dengan lawan kata (antonim)
const PADANAN_TAHAP1 = [
  ['besar','kecil'], ['tinggi','rendah'], ['panas','sejuk'], ['gemuk','kurus'],
  ['cepat','perlahan'], ['rajin','malas'], ['gembira','sedih'], ['kuat','lemah'],
  ['terang','gelap'], ['basah','kering'], ['tebal','nipis'], ['jauh','dekat'],
  ['mahal','murah'], ['baru','lama'], ['bersih','kotor'], ['senang','susah'],
  ['kaya','miskin'], ['panjang','pendek'], ['luas','sempit'], ['awal','lewat'],
];

// Tahap 2: padankan perkataan dengan sinonim (kata seerti)
const PADANAN_TAHAP2 = [
  ['gigih','tekun'], ['cekap','mahir'], ['megah','bangga'], ['tabah','sabar'],
  ['musnah','binasa'], ['pantas','laju'], ['makmur','sejahtera'], ['jujur','ikhlas'],
  ['elok','baik'], ['gembira','ceria'], ['hebat','handal'], ['indah','permai'],
  ['marah','geram'], ['takut','gerun'], ['sedih','pilu'], ['cantik','jelita'],
  ['berani','gagah'], ['bijak','pandai'], ['kukuh','teguh'], ['lantang','kuat'],
];

if (typeof module !== 'undefined') { module.exports = { PADANAN_TAHAP1, PADANAN_TAHAP2 }; }
