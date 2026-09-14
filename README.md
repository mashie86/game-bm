# 📚 Game BM Hebat

Permainan web interaktif **Bahasa Melayu** untuk murid sekolah rendah — merangkumi **Tahap 1 (Tahun 1-3)** dan **Tahap 2 (Tahun 4-6)**. Dibina sebagai **Progressive Web App (PWA)** supaya boleh dipasang di telefon/tablet/komputer dan dimainkan **secara luar talian (offline)**.

## ✨ Ciri-ciri

- **Peta level** ala permainan mudah alih — setiap topik tatabahasa ialah satu "level" yang dibuka secara berperingkat.
- **Bank soalan besar** (255 soalan tatabahasa/kosa kata + 40 pasangan padanan) supaya soalan **berputar (rotate)** dan jarang berulang — setiap permainan memaparkan **10 soalan rawak** daripada kumpulan topik berkenaan.
- **Pelbagai jenis soalan**: aneka pilihan (termasuk isi tempat kosong) dan **susun ayat**.
- **Mod bonus "Padanan Pantas"** dan **"Cabaran Rawak"** (campuran semua topik) selepas semua level topik selesai.
- Sistem **bintang & markah**, progress disimpan automatik di dalam peranti (localStorage) — tiada log masuk / pangkalan data diperlukan.
- **PWA penuh**: `manifest.webmanifest` + Service Worker (`sw.js`) untuk cache & sokongan offline, boleh "Add to Home Screen".
- Responsif — selesa digunakan di telefon, tablet, mahupun komputer.
- 🔊 **Bunyi kesan (SFX)** — klik, jawapan betul/salah, buka level, kemenangan — dijana terus dalam pelayar (Web Audio API), **tiada fail audio luar diperlukan**, jadi terus berfungsi offline. Ada butang 🔊/🔇 untuk hidup/matikan (sesuai utk suasana kelas).
- 🎈 **Visual lebih meriah** — latar belakang beranimasi, hiasan terapung (awan/bintang/belon), animasi confetti bila menang, dan fon yang lebih mesra kanak-kanak.

## 🗂️ Struktur Fail

```
bm-game/
├── index.html              # Struktur/skrin utama aplikasi
├── manifest.webmanifest    # Konfigurasi PWA
├── sw.js                   # Service Worker (cache offline)
├── css/style.css           # Semua styling
├── js/
│   ├── data/
│   │   ├── tahap1.js       # Bank soalan Tahap 1 (120 soalan, 8 topik)
│   │   ├── tahap2.js       # Bank soalan Tahap 2 (135 soalan, 9 topik)
│   │   ├── padanan.js      # Bank pasangan utk mod "Padanan Pantas"
│   │   └── levels.js       # Konfigurasi peta level setiap tahap
│   ├── storage.js          # Simpan/muat progress (localStorage)
│   ├── game.js             # Enjin: pemilihan soalan berputar, pemarkahan
│   └── app.js               # Kawalan UI & navigasi skrin
├── icons/                  # Ikon PWA (192/512/maskable)
└── test/                   # Skrip ujian automatik (Playwright, guna Node)
```

## ▶️ Jalankan Secara Tempatan

Perlukan Python 3 (atau mana-mana static file server):

```bash
cd bm-game
python3 -m http.server 8080
# atau: npx serve .
```

Buka `http://localhost:8080` di pelayar. **PWA/Service Worker memerlukan `http://localhost` atau HTTPS** — tidak akan berfungsi penuh jika dibuka terus sebagai fail (`file://`).

## ⬆️ Cara Push ke GitHub

Projek ini sudah disediakan sebagai repositori git tempatan (`git init` + commit pertama sudah dibuat). Untuk hantar ke GitHub:

1. Cipta repositori **kosong** baharu di GitHub (jangan tambah README/`.gitignore` semasa create, supaya tiada konflik) — contohnya nama `game-bm-hebat`.
2. Di dalam folder projek ini, jalankan:

```bash
git remote add origin https://github.com/<username-github-anda>/game-bm-hebat.git
git branch -M main
git push -u origin main
```

3. Jika GitHub minta log masuk, guna **Personal Access Token** (bukan kata laluan akaun) — cipta di `github.com/settings/tokens` dengan skop `repo`.

## 🌐 Deploy Percuma dengan GitHub Pages (supaya boleh dipasang sbg PWA)

1. Di repo GitHub anda → **Settings → Pages**.
2. Bahagian **Source**, pilih branch `main` dan folder `/ (root)`.
3. Simpan. Selepas 1-2 minit, app boleh diakses di:
   `https://<username-github-anda>.github.io/game-bm-hebat/`
4. Buka link tersebut di telefon → pelayar akan tawarkan **"Add to Home Screen" / "Install App"** — itu PWA anda sudah boleh dipasang!

> Semua path dalam projek ini menggunakan laluan **relatif** (bukan `/absolute`), jadi ia serasi dijalankan dalam sub-folder GitHub Pages (`/game-bm-hebat/`) tanpa sebarang ubah suai.

## 🧪 Ujian

Aplikasi telah diuji hujung-ke-hujung (end-to-end) menggunakan Playwright — meliputi navigasi semua skrin, kesemua topik Tahap 1 & Tahap 2, soalan jenis susun ayat, mod Padanan Pantas, sistem buka-kunci level, sistem bintang, simpanan progress, reset progress, dan mod offline (Service Worker). Untuk jalankan semula ujian:

```bash
npm install    # sekali sahaja, memuat turun Playwright
npm test
```

## 📝 Menambah / Mengubah Soalan

Setiap soalan berada dalam `js/data/tahap1.js` atau `js/data/tahap2.js` sebagai satu objek:

```js
// Aneka pilihan / isi tempat kosong
{ id:'t1-kn-99', topik:'kata-nama', jenis:'mcq', soalan:'...', pilihan:['a','b','c','d'], jawapan:0 }

// Susun ayat
{ id:'t1-atb-99', topik:'ayat-tanda-baca', jenis:'susun', soalan:'Susun perkataan berikut menjadi ayat yang betul.', ayat:['Saya','pergi','sekolah'] }
```

`topik` mesti sepadan dengan `id` dalam `js/data/levels.js`. Tambah seberapa banyak soalan yang mahu bagi setiap topik — semakin banyak, semakin jarang berulang semasa dimainkan (enjin akan sentiasa cuba elak ulang 40 soalan terkini yang telah dimainkan bagi topik tersebut).

## ⚠️ Nota Penting Tentang Rujukan Kurikulum

Soalan dalam bank ini disusun berdasarkan **struktur tatabahasa KSSR Bahasa Melayu yang umum dan stabil** (contoh: kata nama/kerja/adjektif untuk Tahun 1-3; imbuhan, kata hubung, kata sendi nama, ayat majmuk untuk Tahun 4-6). Walau bagaimanapun, semasa pembinaan, akses terus ke dokumen **DSKP rasmi** di `bpk.moe.gov.my` disekat (robots.txt), jadi kandungan **bukan disalin verbatim** daripada DSKP dan **tidak merujuk kod standard kandungan/pembelajaran yang spesifik**.

**Disyorkan:** sila semak dan sesuaikan semula soalan (terutamanya pembahagian ikut tahun & tahap kesukaran) berdasarkan salinan DSKP terkini sekolah/panitia anda sebelum digunakan secara rasmi dalam pengajaran & pembelajaran.

## 💡 Cadangan Penambahbaikan Akan Datang

- Tambah audio/bunyi kesan (betul/salah) & bunyi latar.
- Mod berbilang pemain / papan pendahulu (leaderboard) memerlukan backend.
- Eksport laporan markah murid untuk guru (contoh: cetak PDF).
- Tambah bank soalan bergambar untuk kosa kata Tahap 1.
