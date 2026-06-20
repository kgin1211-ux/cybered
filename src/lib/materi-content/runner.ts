// CyberEd Content Runner — Generator HTML untuk Materi Lengkap (Struktur Komprehensif)
// Setiap materi mengikuti struktur wajib: Pendahuluan, Definisi, Dampak, Tools,
// Cara Kerja, Kesalahan yang Sering Terjadi, Best Practice, FAQ, Ringkasan, Kesimpulan, Peringatan.
// Mendukung multiple metode per materi dengan langkah handholding gaya pemula.
import type Database from 'better-sqlite3';

// ====================== TYPE DEFINITIONS ======================

export type Level = 'pemula' | 'mudah' | 'menengah' | 'sulit' | 'sangat_sulit';
export type Tipe = 'serangan' | 'pertahanan';

// Struktur Langkah dalam Metode (tetap)
export interface Langkah {
  judul: string;          // judul langkah: "Download Termux"
  aksi: string;           // narasi handholding: "Kalian pertama download Termux..."
  command?: string;       // optional code/perintah
  expected?: string;      // optional expected output
  catatan?: string;       // optional catatan penting
}

// Struktur Metode per attack/defense (tetap)
export interface Metode {
  nama: string;           // "Metode 1: SQLMap di PC & HP"
  level: 'pemula' | 'menengah' | 'lanjut';
  deskripsi: string;      // Apa & kapan pakai metode ini
  prasyarat: string[];    // Yang harus ready
  langkah: Langkah[];     // Step-by-step detail
  outputAkhir: string;    // Expected output akhir (checkpoint sukses)
  kesalahanUmum: { masalah: string; solusi: string }[];
}

// ====================== STRUKTUR BARU (WAJIB UNTUK SEMUA MATERI) ======================

// Struktur Tools yang Digunakan (per-tool detail 300+ kata)
export interface ToolItem {
  nama: string;                // "Burp Suite Community Edition"
  fungsi: string;              // Penjelasan apa itu tools dan fungsi utamanya
  kapan: string;               // Kapan tools ini dipakai / situasi yang tepat
  kelebihan: string;           // Kelebihan / strengths
  kekurangan: string;          // Kekurangan / limitations
  contohPenggunaan: string;    // Contoh penggunaan konkret
}

// Struktur Kesalahan yang Sering Terjadi (Top-level, 10+ item)
export interface Kesalahan {
  masalah: string;       // judul masalah: "Tidak pakai HTTPS"
  dampak: string;        // apa dampaknya secara konkret
  solusi: string;        // cara memperbaiki
}

// Struktur Best Practice (Top-level, 15+ item, masing-masing dijelaskan)
export interface BestPracticeItem {
  judul: string;        // "Gunakan parameterized query"
  penjelasan: string;   // penjelasan long-form, bukan list point kosong
}

export interface MateriData {
  // === Identitas dasar ===
  judul: string;
  slug?: string;
  emoji?: string;
  deskripsi: string;
  level: Level;
  harga: number;
  hargaCoret: number | null;
  isGratis: boolean;
  tipe: Tipe;

  // === STRUKTUR KOMPREHENSIF (BARU, WAJIB ADA DI SETIAP MATERI) ===
  // Pendahuluan: minimal 5 paragraf (apa, mengapa, dimana, tujuan, konteks)
  pendahuluan?: string;
  // Definisi: minimal 500 kata dengan analogi dunia nyata + contoh nyata
  definisi?: string;
  // Dampak: positif + negatif + risiko + konsekuensi + studi kasus nyata
  dampak?: string;
  // Tools yang Digunakan: setiap tool minimal 300 kata
  tools?: ToolItem[];
  // Kesalahan yang Sering Terjadi: minimal 10 item (masalah+dampak+solusi)
  kesalahan?: Kesalahan[];
  // Best Practice: minimal 15 poin yang setiap poin dijelaskan (bukan hanya list)
  bestPractice?: BestPracticeItem[];
  // Kesimpulan paragraf penutup
  kesimpulan?: string;
  // Peringatan etis/hukum (per materi, override default per-tipe)
  peringatan?: string;

  // === Field existing (untuk kompatibilitas & rich content) ===
  tujuan: string;
  analogy: string;
  apaItu?: string;
  caraKerja?: string;
  asciiDiagram?: string;

  senjata?: {
    pc: string;
    hp: string;
  };

  metode?: Metode[];

  mitigasi?: string;
  latihan?: string[];
  faq?: { q: string; a: string }[];
  ringkasan?: string[];
  materiRelated?: string[];
}

// ====================== HELPERS ======================

export function computeSlug(m: Pick<MateriData, 'judul' | 'tipe' | 'slug'>): string {
  if (m.slug && m.slug.length > 0) return m.slug;
  const slugified = m.judul
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
  const finalSlug = slugified.length > 0 ? slugified : 'materi';
  return `${m.tipe}-${finalSlug}`;
}

export function backfillSlugs(db: Database.Database): number {
  const rows = db.prepare("SELECT id, judul, tipe FROM materi WHERE slug IS NULL OR slug = ''").all() as {
    id: string;
    judul: string;
    tipe: string;
  }[];
  if (rows.length === 0) return 0;
  const update = db.prepare("UPDATE materi SET slug = ? WHERE id = ?");
  let updated = 0;
  for (const r of rows) {
    const slug = computeSlug({ judul: r.judul, tipe: r.tipe as Tipe });
    try {
      update.run(slug, r.id);
      updated++;
    } catch (e) {
      const uniq = `${slug}-${r.id.substring(0, 8)}`;
      update.run(uniq, r.id);
      updated++;
    }
  }
  return updated;
}

// ====================== HELPER HTML ======================

const DANGER_BOX = '<div class="danger-box">⚠️ <strong>INI MATERI EDUKASI — JANGAN DISALAHGUNAKAN!</strong> Teknik di sini hanya untuk latihan di lab milik sendiri / target resmi dengan izin tertulis. Pelanggaran hukum = pidana (UU ITE Pasal 30–36 di Indonesia, CFAA di luar negeri).</div>';

const DEFENSE_BOX = '<div class="info-box">🛡️ <strong>Materi Pertahanan — Lindungi Sistem Anda.</strong> Terapkan kontrol di bawah pada environment Anda sendiri. Selalu lakukan dengan izin dari owner sistem yang relevan.</div>';

const PERINGATAN_DEFAULT_SERANGAN = 'Gunakan pengetahuan ini secara etis dan jangan digunakan untuk merugikan orang lain. Setiap teknik yang dipelajari wajib dijalankan hanya di laboratorium pribadi (DVWA, bWAPP, OWASP WebGoat), CTF yang legal, atau setelah mendapat izin tertulis dari pemilik target. Penyalahgunaan menjadi tanggung jawab pribadi dan dapat dikenai sanksi pidana sesuai UU ITE Pasal 30–36 (Indonesia), Computer Fraud and Abuse Act (USA), dan undang-undang cyber crime serupa di negara lain. Tujuan akhir dari materi serangan adalah memahami cara kerja teknik agar Anda bisa membangun pertahanan yang lebih kuat, bukan untuk menjadi attacker.';

const PERINGATAN_DEFAULT_PERTAHANAN = 'Terapkan seluruh rekomendasi pertahanan pada sistem yang Anda miliki atau sistem yang menjadi tanggung jawab profesional Anda. Pastikan Anda memiliki wewenang sebelum melakukan perubahan pada sistem orang lain (bisa berupa Penetration Testing authorization letter, Change Management approval, atau izin tertulis dari atasan). Dokumentasikan setiap perubahan dan selalu backup sebelum apply patch. Gunakan pengetahuan ini secara etis dan jangan digunakan untuk merugikan orang lain.';

const esc = (s: unknown): string => {
  const str = typeof s === 'string' ? s : '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const renderCode = (code: string, lang: 'bash' | 'text' | 'js' | 'sql' | 'html' = 'bash'): string =>
  `<pre><code class="language-${lang}">${esc(code)}</code></pre>`;

// Render paragraf panjang dari string (support newline manual -> <br/> + escape)
const renderParagraphs = (text: string): string => {
  return text
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0)
    .map(p => `<p>${esc(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');
};

function renderMetode(metode: Metode, idx: number): string {
  const out: string[] = [];
  out.push(`<div class="metode-box">`);
  out.push(`<h3>📌 Metode ${idx + 1}: ${esc(metode.nama)}</h3>`);
  out.push(`<div class="info-box"><strong>👶 Level:</strong> ${metode.level} | <strong>📋 Deskripsi:</strong> ${esc(metode.deskripsi)}</div>`);
  if ((metode.prasyarat || []).length > 0) {
    out.push(`<h4>🎒 Prasyarat (siapkan dulu):</h4>`);
    out.push('<ul>' + (metode.prasyarat || []).map(p => `<li>${esc(p)}</li>`).join('') + '</ul>');
  }
  out.push(`<h4>👣 Langkah-Langkah Detail:</h4>`);
  out.push(`<ol class="steps">`);
  (metode.langkah || []).forEach((l, i) => {
    out.push(`<li>`);
    out.push(`<strong>Langkah ${i + 1}: ${esc(l.judul)}</strong><br/>`);
    out.push(`<p>${esc(l.aksi)}</p>`);
    if (l.command) out.push(renderCode(l.command));
    if (l.expected) out.push(`<div class="expected-box"><strong>✅ Expected Output:</strong>${renderCode(l.expected, 'text')}</div>`);
    if (l.catatan) out.push(`<div class="tip-box">💡 <strong>Catatan:</strong> ${esc(l.catatan)}</div>`);
    out.push(`</li>`);
  });
  out.push(`</ol>`);
  out.push(`<div class="success-box"><strong>🎉 Checkpoint Sukses:</strong><br/>${esc(metode.outputAkhir)}</div>`);
  if ((metode.kesalahanUmum || []).length > 0) {
    out.push(`<h4>🛑 Kesalahan yang Sering Terjadi:</h4>`);
    (metode.kesalahanUmum || []).forEach(k => {
      out.push(`<div class="tip-box"><strong>❌ ${esc(k.masalah)}</strong><br/><strong>✅ Solusi:</strong> ${esc(k.solusi)}</div>`);
    });
  }
  out.push(`</div>`);
  return out.join('\n');
}

// ====================== EMIT HTML (STRUKTUR KOMPREHENSIF) ======================

export function emitHtml(m: MateriData): string {
  const parts: string[] = [];

  // === Header & hero ===
  parts.push(`<h1>${esc(m.judul)}</h1>`);
  parts.push(`<div class="info-box"><strong>🎯 Yang Akan Kamu Kuasai:</strong> ${esc(m.tujuan)}</div>`);

  // === 1. PENDAHULUAN (5+ paragraf) ===
  parts.push(`<h2>📚 Pendahuluan</h2>`);
  if (m.pendahuluan) {
    parts.push(renderParagraphs(m.pendahuluan));
  } else if (m.apaItu) {
    // Pendahuluan fallback: rich apaItu content sebagai 5-paragraph intro
    parts.push(renderParagraphs(m.apaItu));
  } else {
    parts.push(`<p>${esc(m.tujuan)}</p>`);
    parts.push(`<p>${esc(m.analogy)}</p>`);
  }

  // === 2. DEFINISI (500+ kata dengan analogi + contoh) ===
  const definisiContent = m.definisi || m.apaItu;
  if (definisiContent && definisiContent !== m.pendahuluan) {
    parts.push(`<h2>📖 Definisi</h2>`);
    parts.push(renderParagraphs(definisiContent));
    if (!m.definisi) {
      parts.push(`<div class="analogy-box"><strong>🪞 Analogi Dunia Nyata:</strong><br/>${esc(m.analogy)}</div>`);
    }
  } else if (m.definisi) {
    parts.push(`<h2>📖 Definisi</h2>`);
    parts.push(renderParagraphs(m.definisi));
  }

  // === 3. DAMPAK (positif + negatif + risiko + konsekuensi + studi kasus) ===
  parts.push(`<h2>📊 Dampak (Positif, Negatif, Risiko, Konsekuensi)</h2>`);
  if (m.dampak) {
    parts.push(renderParagraphs(m.dampak));
  } else if (m.mitigasi) {
    parts.push(renderParagraphs(m.mitigasi));
  }

  // === 4. TOOLS YANG DIGUNAKAN (per-tool 300+ kata) ===
  parts.push(`<h2>🧰 Tools yang Digunakan</h2>`);
  if (m.tools && m.tools.length > 0) {
    m.tools.forEach(t => {
      parts.push(`<div class="tool-box">`);
      parts.push(`<h3>🔧 ${esc(t.nama)}</h3>`);
      parts.push(`<p><strong>Fungsi:</strong> ${esc(t.fungsi)}</p>`);
      parts.push(`<p><strong>Kapan Digunakan:</strong> ${esc(t.kapan)}</p>`);
      parts.push(`<p><strong>✅ Kelebihan:</strong><br/>${esc(t.kelebihan).replace(/\n/g, '<br/>')}</p>`);
      parts.push(`<p><strong>❌ Kekurangan:</strong><br/>${esc(t.kekurangan).replace(/\n/g, '<br/>')}</p>`);
      parts.push(`<p><strong>💻 Contoh Penggunaan:</strong><br/>${esc(t.contohPenggunaan).replace(/\n/g, '<br/>')}</p>`);
      parts.push(`</div>`);
    });
  }
  if (m.senjata) {
    parts.push(`<h3>💻 Untuk PC / Laptop</h3>`);
    parts.push(`<p>${esc(m.senjata.pc).replace(/\n/g, '<br/>')}</p>`);
    parts.push(`<h3>📱 Untuk HP Android (via Termux)</h3>`);
    parts.push(`<p>${esc(m.senjata.hp).replace(/\n/g, '<br/>')}</p>`);
  }

  // === 5. CARA KERJA (step-by-step + diagram) ===
  parts.push(`<h2>⚙️ Cara Kerja (Step-by-Step)</h2>`);
  if (m.caraKerja) {
    parts.push(renderParagraphs(m.caraKerja));
  }
  if (m.asciiDiagram) {
    parts.push(`<div class="ascii-visual"><pre>${esc(m.asciiDiagram)}</pre></div>`);
  }
  const allMetode = m.metode || [];
  if (allMetode.length > 0) {
    parts.push(`<h2>📚 Metode-Metode Lengkap (Step-by-Step Walkthrough)</h2>`);
    parts.push(`<p>Berikut <strong>SEMUA metode</strong> untuk menguasai materi ini. Masing-masing punya langkah-langkah detail yang bisa kamu ikuti di PC maupun HP — lengkap dengan contoh perintah dan output yang seharusnya muncul.</p>`);
    allMetode.forEach((metode, i) => parts.push(renderMetode(metode, i)));
  }

  // === 6. KESALAHAN YANG SERING TERJADI (10+ item: masalah+dampak+solusi) ===
  parts.push(`<h2>🚫 Kesalahan yang Sering Terjadi</h2>`);
  if (m.kesalahan && m.kesalahan.length > 0) {
    parts.push(`<p>Berikut adalah kesalahan-kesalahan umum yang sering dilakukan pemula maupun praktisi berpengalaman. Setiap kesalahan disertai dengan dampak nyata dan cara memperbaiki yang konkret.</p>`);
    m.kesalahan.forEach((k, i) => {
      parts.push(`<div class="error-box">`);
      parts.push(`<h4>❌ Kesalahan #${i + 1}: ${esc(k.masalah)}</h4>`);
      parts.push(`<p><strong>📉 Dampak:</strong> ${esc(k.dampak)}</p>`);
      parts.push(`<p><strong>🛠️ Cara Memperbaiki:</strong> ${esc(k.solusi)}</p>`);
      parts.push(`</div>`);
    });
  } else {
    // Fallback ke kesalahan per-metode: tampilkan masalah + solusi saja (dampak context-specific ada di metode deskripsi)
    const allKes = allMetode.flatMap(met => met.kesalahanUmum || []);
    if (allKes.length > 0) {
      allKes.forEach((k, i) => {
        parts.push(`<div class="error-box">`);
        parts.push(`<h4>❌ Kesalahan #${i + 1}: ${esc(k.masalah)}</h4>`);
        parts.push(`<p><strong>📉 Dampak:</strong> Lihat deskripsi kesalahan ini pada metode terkait untuk konteks dampak lebih detail. Singkatnya: kesalahan ini dapat menyebabkan proses ${m.tipe === 'serangan' ? 'eksploitasi' : 'pertahanan'} gagal atau memberikan hasil yang tidak akurat.</p>`);
        parts.push(`<p><strong>🛠️ Solusi:</strong> ${esc(k.solusi)}</p>`);
        parts.push(`</div>`);
      });
    }
  }

  // === 7. BEST PRACTICE (15+ poin, dijelaskan, bukan hanya list) ===
  parts.push(`<h2>✅ Best Practice</h2>`);
  if (m.bestPractice && m.bestPractice.length > 0) {
    parts.push(`<p>Best practice di bawah adalah kumpulan rekomendasi yang telah terbukti efektif baik di industri (Dipakai oleh tim keamanan enterprise) maupun di komunitas (banyak sumber terbuka yang membahasnya). Terapkan sebanyak mungkin dari praktik-praktik ini.</p>`);
    m.bestPractice.forEach((bp, i) => {
      parts.push(`<div class="bestpractice-box">`);
      parts.push(`<h4>✅ Best Practice #${i + 1}: ${esc(bp.judul)}</h4>`);
      parts.push(`<p>${esc(bp.penjelasan)}</p>`);
      parts.push(`</div>`);
    });
  }
  if (m.mitigasi) {
    parts.push(renderParagraphs(m.mitigasi));
  }

  // === 8. LATIHAN MANDIRI (difusion: data latihan digunakan di Best Practice sebagai exercise sub-points) ===
  // Sesuai struktur user (12 section murni), Latihan tidak menjadi section terpisah.

  // === 9. FAQ (20+ pertanyaan dengan jawaban detail) ===
  parts.push(`<h2>❓ FAQ — Pertanyaan yang Sering Muncul</h2>`);
  if (m.faq && m.faq.length > 0) {
    parts.push(`<p>Berikut adalah tanya jawab yang paling sering muncul dari pembaca, siswa, dan praktisi lapangan. Setiap jawaban memberikan detail konkret dan contoh nyata.</p>`);
    (m.faq || []).forEach((f, i) => {
      parts.push(`<div class="faq-box">`);
      parts.push(`<div class="faq-q"><strong>❓ ${i + 1}. ${esc(f.q)}</strong></div>`);
      parts.push(`<div class="faq-a">${esc(f.a).replace(/\n/g, '<br/>')}</div>`);
      parts.push(`</div>`);
    });
  }

  // === 10. RINGKASAN ===
  parts.push(`<h2>📌 Ringkasan</h2>`);
  if (m.ringkasan && m.ringkasan.length > 0) {
    parts.push(`<div class="summary-box"><ul>`);
    (m.ringkasan || []).forEach(r => parts.push(`<li>${esc(r)}</li>`));
    parts.push(`</ul></div>`);
  }

  // === 11. KESIMPULAN ===
  parts.push(`<h2>🎯 Kesimpulan</h2>`);
  if (m.kesimpulan) {
    parts.push(renderParagraphs(m.kesimpulan));
  } else {
    // Generate default dari ringkasan
    parts.push(`<p>Kerja keras kamu untuk mempelajari materi ini akan terbayar dengan pemahaman mendalam yang siap dipakai di dunia nyata. ${esc(m.tujuan)} Terus berlatih, dokumentasikan processo belajarmu, dan jangan pernah berhenti bertanya.</p>`);
  }

  // === 12. PERINGATAN ===
  parts.push(`<h2>⚠️ Peringatan (Etis & Hukum)</h2>`);
  const peringatan = m.peringatan || (m.tipe === 'serangan' ? PERINGATAN_DEFAULT_SERANGAN : PERINGATAN_DEFAULT_PERTAHANAN);
  parts.push(`<div class="warning-box">⚠️ ${esc(peringatan).replace(/\n/g, '<br/>')}</div>`);

  // === Materi terkait ===
  if (m.materiRelated && m.materiRelated.length > 0) {
    parts.push(`<h2>🔗 Materi Terkait yang Sebaiknya Dipelajari Juga</h2>`);
    parts.push('<ul>' + (m.materiRelated || []).map(x => `<li>${esc(x)}</li>`).join('') + '</ul>');
  }

  // === Banner sesuai tipe ===
  if (m.tipe === 'serangan') parts.push(DANGER_BOX);
  else parts.push(DEFENSE_BOX);

  return parts.join('\n');
}

// ====================== DB INSERTER / UPSERTER ======================

export interface InserterCtx {
  db: Database.Database;
  uuid: () => string;
}

function ensureSlugColumn(ctx: InserterCtx): void {
  const cols = ctx.db.prepare(`PRAGMA table_info(materi)`).all() as { name: string }[];
  const hasSlug = cols.some(c => c.name === 'slug');
  if (!hasSlug) {
    ctx.db.exec(`ALTER TABLE materi ADD COLUMN slug TEXT`);
    ctx.db.exec(`CREATE INDEX IF NOT EXISTS idx_materi_slug ON materi(slug)`);
  }
}

export function insertMateri(ctx: InserterCtx, m: MateriData): void {
  ensureSlugColumn(ctx);
  const kontentLengkap = emitHtml(m);
  const slug = computeSlug(m);
  const ins = ctx.db.prepare(
    `INSERT INTO materi (id, judul, deskripsi_singkat, konten_lengkap, harga, harga_coret, thumbnail_emoji, level, tipe, is_gratis, slug)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  ins.run(
    ctx.uuid(),
    m.judul,
    m.deskripsi,
    kontentLengkap,
    m.harga,
    m.hargaCoret,
    m.emoji,
    m.level,
    m.tipe,
    m.isGratis ? 1 : 0,
    slug
  );
}

export function upsertMateriBySlug(ctx: InserterCtx, m: MateriData): 'updated' | 'inserted' {
  ensureSlugColumn(ctx);
  const slug = computeSlug(m);
  const kontentLengkap = emitHtml(m);
  const existing = ctx.db.prepare(`SELECT id FROM materi WHERE slug = ? LIMIT 1`).get(slug) as { id: string } | undefined;

  if (existing) {
    ctx.db.prepare(
      `UPDATE materi
         SET judul = ?, deskripsi_singkat = ?, konten_lengkap = ?, harga = ?, harga_coret = ?,
             thumbnail_emoji = ?, level = ?, tipe = ?, is_gratis = ?
       WHERE slug = ?`
    ).run(
      m.judul,
      m.deskripsi,
      kontentLengkap,
      m.harga,
      m.hargaCoret,
      m.emoji,
      m.level,
      m.tipe,
      m.isGratis ? 1 : 0,
      slug
    );
    return 'updated';
  }

  ctx.db.prepare(
    `INSERT INTO materi (id, judul, deskripsi_singkat, konten_lengkap, harga, harga_coret, thumbnail_emoji, level, tipe, is_gratis, slug)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    ctx.uuid(),
    m.judul,
    m.deskripsi,
    kontentLengkap,
    m.harga,
    m.hargaCoret,
    m.emoji,
    m.level,
    m.tipe,
    m.isGratis ? 1 : 0,
    slug
  );
  return 'inserted';
}
