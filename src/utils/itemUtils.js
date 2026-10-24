import { HIGH_VALUE_CATEGORIES, PUBLIC_ITEM_FIELDS, VERIFICATION } from '../data/constants.js';

// Semua operasi menerima `data` ({ studentName, items, claims }) dan
// mengembalikan { ok: true, data, ... } atau { ok: false, error, errors }.
// Fungsi murni, mudah diuji.
//
// Item.status : STORED | RETURNED
// Claim.status: PENDING (diajukan mahasiswa/petugas) -> APPROVED (diverifikasi petugas)
//               -> RETURNED (barang diserahkan)  atau  REJECTED

const clean = (value) => String(value ?? '').trim();
const succeed = (data, extra = {}) => ({ ok: true, data, ...extra });
const fail = (error, errors = {}) => ({ ok: false, error, errors });
const sameName = (a, b) => clean(a).toLowerCase() === clean(b).toLowerCase();

export function isHighValueCategory(category) {
  return HIGH_VALUE_CATEGORIES.includes(category);
}

// P10 A7: ambang lolos verifikasi = 2/3 dari jumlah pertanyaan (3 -> 2, 4 -> 3, 5 -> 4).
export function passThreshold(total) {
  return Math.ceil((total * 2) / 3);
}

export function nextId(prefix, entries) {
  const max = entries.reduce((highest, entry) => {
    const number = Number(String(entry.id).split('-').pop());
    return Number.isFinite(number) && number > highest ? number : highest;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

export function todayString(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function formatDateTime(iso) {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

/* ---------- Turunan status ---------- */

export const getClaimsForItem = (data, itemId) => data.claims.filter((c) => c.itemId === itemId);
export const getClaimsForStudent = (data, name) => data.claims.filter((c) => sameName(c.claimantName, name));
export const getApprovedClaim = (data, itemId) =>
  data.claims.find((c) => c.itemId === itemId && c.status === 'APPROVED') ?? null;

// Status tampilan barang untuk petugas.
export function getItemState(data, item) {
  if (item.status === 'RETURNED') return 'RETURNED';
  if (getApprovedClaim(data, item.id)) return 'VERIFIED';
  if (data.claims.some((c) => c.itemId === item.id && c.status === 'PENDING')) return 'CLAIMED';
  return 'STORED';
}

export function getItemCounts(data) {
  const states = data.items.map((item) => getItemState(data, item));
  return {
    total: data.items.length,
    stored: states.filter((s) => s === 'STORED').length,
    claimed: states.filter((s) => s === 'CLAIMED').length,
    verified: states.filter((s) => s === 'VERIFIED').length,
    returned: states.filter((s) => s === 'RETURNED').length,
    highValue: data.items.filter((i) => i.highValue && i.status !== 'RETURNED').length,
    pendingClaims: data.claims.filter((c) => c.status === 'PENDING').length,
    publicItems: data.items.filter((i) => i.status !== 'RETURNED').length,
    myClaims: getClaimsForStudent(data, data.studentName).length,
  };
}

/* ---------- US1: catat barang temuan (petugas) ---------- */

export function validateFoundItem(input) {
  const errors = {};
  if (!clean(input.category)) errors.category = 'Pilih jenis barang.';
  if (!clean(input.foundDate)) errors.foundDate = 'Isi tanggal ditemukan.';
  if (!clean(input.locationFound)) errors.locationFound = 'Isi lokasi ditemukan.';
  if (!clean(input.description)) errors.description = 'Isi deskripsi umum barang.';
  if (!clean(input.handedOverBy)) errors.handedOverBy = 'Isi pihak yang menyerahkan.';
  if (!clean(input.storageLocation)) errors.storageLocation = 'Isi lokasi penyimpanan.';
  return errors;
}

export function createFoundItem(data, input, now = new Date()) {
  const errors = validateFoundItem(input);
  if (Object.keys(errors).length > 0) return fail('Periksa kembali isian yang ditandai.', errors);

  const category = clean(input.category);
  const item = {
    id: nextId('ITEM', data.items),
    category,
    color: clean(input.color),
    brand: clean(input.brand),
    description: clean(input.description),
    foundDate: clean(input.foundDate),
    foundTime: clean(input.foundTime),
    locationFound: clean(input.locationFound),
    handedOverBy: clean(input.handedOverBy),
    storageLocation: clean(input.storageLocation),
    // US8 / C4: jenis bernilai tinggi otomatis ditandai dan tidak bisa dilepas.
    highValue: isHighValueCategory(category) || Boolean(input.highValue),
    status: 'STORED',
    recordedAt: now.toISOString(),
    returnedTo: '',
    returnedAt: '',
    handoverNotes: '',
    // US8 / R11: pertanyaan verifikasi disiapkan petugas setelah barang dicatat.
    verificationQuestions: [],
  };
  return succeed({ ...data, items: [item, ...data.items] }, { item });
}

/* ---------- US8 / R11: petugas menyiapkan pertanyaan verifikasi ---------- */

export function setVerificationQuestions(data, itemId, questions) {
  const item = data.items.find((i) => i.id === itemId);
  if (!item) return fail('Barang tidak ditemukan.');
  if (!item.highValue) return fail('Pertanyaan verifikasi hanya untuk barang bernilai tinggi.');
  if (item.status !== 'STORED') return fail('Barang ini sudah dikembalikan.');
  if (data.claims.some((c) => c.itemId === itemId && (c.status === 'PENDING' || c.status === 'APPROVED'))) {
    return fail('Pertanyaan tidak dapat diubah selama masih ada klaim aktif untuk barang ini.');
  }

  const list = (questions ?? []).map(clean).filter(Boolean);
  const errors = {};
  if (list.length < VERIFICATION.MIN_QUESTIONS || list.length > VERIFICATION.MAX_QUESTIONS) {
    errors.questions = `Siapkan ${VERIFICATION.MIN_QUESTIONS}-${VERIFICATION.MAX_QUESTIONS} pertanyaan verifikasi.`;
  } else if (new Set(list.map((q) => q.toLowerCase())).size !== list.length) {
    errors.questions = 'Pertanyaan tidak boleh sama.';
  }
  if (Object.keys(errors).length > 0) return fail('Pertanyaan verifikasi belum dapat disimpan.', errors);

  return succeed({
    ...data,
    items: data.items.map((i) => (i.id === itemId ? { ...i, verificationQuestions: list } : i)),
  });
}

/* ---------- Klaim: diajukan mahasiswa, diverifikasi petugas (US6 + US8) ---------- */

export function submitClaim(data, itemId, input, source = 'ONLINE', now = new Date(), codeSuffix = randomSuffix()) {
  const item = data.items.find((i) => i.id === itemId);
  if (!item) return fail('Barang tidak ditemukan.');
  if (item.status !== 'STORED') return fail('Barang ini sudah dikembalikan dan tidak dapat diklaim.');

  const errors = {};
  if (!clean(input.claimantName)) errors.claimantName = 'Isi nama pengklaim.';
  if (!clean(input.proofNotes)) errors.proofNotes = 'Isi ciri-ciri / isi barang sebagai bukti kepemilikan.';
  if (Object.keys(errors).length > 0) return fail('Periksa kembali isian yang ditandai.', errors);

  const duplicate = data.claims.some(
    (c) => c.itemId === itemId && sameName(c.claimantName, input.claimantName) && (c.status === 'PENDING' || c.status === 'APPROVED'),
  );
  if (duplicate) return fail('Klaim untuk barang ini sudah diajukan dan masih diproses.');

  // US8 / R11: barang bernilai tinggi -> pengklaim menjawab pertanyaan verifikasi petugas.
  let answers = [];
  if (item.highValue) {
    const questions = item.verificationQuestions ?? [];
    if (questions.length < VERIFICATION.MIN_QUESTIONS) {
      return fail(
        source === 'ONLINE'
          ? 'Petugas belum menyiapkan pertanyaan verifikasi untuk barang ini. Silakan datang ke pos security.'
          : 'Siapkan pertanyaan verifikasi barang ini terlebih dahulu.',
      );
    }
    // P10 A9: jawaban online hanya satu kali per klaim; percobaan berikutnya langsung di pos.
    const usedOnline = data.claims.some(
      (c) => c.itemId === itemId && sameName(c.claimantName, input.claimantName) && c.source === 'ONLINE',
    );
    if (source === 'ONLINE' && usedOnline) {
      return fail('Jawaban verifikasi online hanya dapat dikirim satu kali. Percobaan berikutnya dilakukan langsung di pos security.');
    }
    let missing = false;
    answers = questions.map((question, index) => {
      const given = input.answers?.[index] ?? {};
      const dontRemember = Boolean(given.dontRemember);
      const answer = dontRemember ? '' : clean(given.answer);
      if (!dontRemember && !answer) missing = true;
      return { question, answer, dontRemember, correct: false };
    });
    if (missing) {
      return fail('Periksa kembali isian yang ditandai.', { answers: 'Jawab semua pertanyaan atau pilih "Tidak ingat".' });
    }
  }

  const claim = {
    id: nextId('CLM', data.claims),
    itemId,
    claimantName: clean(input.claimantName),
    proofNotes: clean(input.proofNotes),
    // US8 ("Verifikasi & Kode Klaim"): barang bernilai tinggi mendapat kode klaim.
    answers,
    claimCode: item.highValue ? `CLM-${itemId.split('-').pop()}-${codeSuffix}` : '',
    status: 'PENDING',
    verifierName: '',
    rejectReason: '',
    submittedAt: now.toISOString(),
    reviewedAt: '',
    source,
  };
  return succeed({ ...data, claims: [...data.claims, claim] }, { claim });
}

function updateClaim(data, claimId, changes) {
  return { ...data, claims: data.claims.map((c) => (c.id === claimId ? { ...c, ...changes } : c)) };
}

export function approveClaim(data, claimId, input, now = new Date()) {
  const claim = data.claims.find((c) => c.id === claimId);
  if (!claim) return fail('Klaim tidak ditemukan.');
  if (claim.status !== 'PENDING') return fail('Hanya klaim yang menunggu verifikasi yang dapat disetujui.');
  if (getApprovedClaim(data, claim.itemId)) return fail('Sudah ada klaim lain yang disetujui untuk barang ini.');

  const item = data.items.find((i) => i.id === claim.itemId);
  const errors = {};
  if (!clean(input.verifierName)) errors.verifierName = 'Isi nama petugas yang memverifikasi.';
  if (input.proofMatches !== true) errors.proofMatches = 'Centang untuk menegaskan bahwa bukti sesuai dengan catatan barang.';

  // US8 / AC8.1-8.2: barang bernilai tinggi wajib lolos verifikasi pertanyaan sebelum disetujui.
  let assessed = claim.answers ?? [];
  if (item?.highValue) {
    if (assessed.length === 0) {
      errors.marks = 'Klaim ini belum memuat jawaban verifikasi.';
    } else {
      const marks = Array.isArray(input.marks) ? input.marks : [];
      assessed = assessed.map((a, i) => ({ ...a, correct: marks[i] === true && !a.dontRemember }));
      const correct = assessed.filter((a) => a.correct).length;
      const needed = passThreshold(assessed.length);
      if (correct < needed) {
        errors.marks = `Verifikasi belum terpenuhi: ${correct} dari ${assessed.length} jawaban dinilai benar, minimal ${needed}.`;
      }
    }
  }
  if (Object.keys(errors).length > 0) return fail('Verifikasi belum dapat disetujui.', errors);

  // P10 A10: hasil penilaian, nama petugas, dan waktu verifikasi dicatat.
  return succeed(
    updateClaim(data, claimId, {
      status: 'APPROVED',
      verifierName: clean(input.verifierName),
      reviewedAt: now.toISOString(),
      answers: assessed,
    }),
  );
}

export function rejectClaim(data, claimId, input, now = new Date()) {
  const claim = data.claims.find((c) => c.id === claimId);
  if (!claim) return fail('Klaim tidak ditemukan.');
  if (claim.status !== 'PENDING' && claim.status !== 'APPROVED') return fail('Klaim ini sudah selesai diproses.');

  const errors = {};
  if (!clean(input.reason)) errors.reason = 'Isi alasan penolakan.';
  if (Object.keys(errors).length > 0) return fail('Alasan penolakan wajib diisi.', errors);

  return succeed(
    updateClaim(data, claimId, {
      status: 'REJECTED',
      rejectReason: clean(input.reason),
      verifierName: clean(input.verifierName) || claim.verifierName,
      reviewedAt: now.toISOString(),
    }),
  );
}

export function canHandOver(data, itemId) {
  return getApprovedClaim(data, itemId) !== null;
}

// R8 / C1 / aturan baru Security: barang HANYA berstatus RETURNED lewat fungsi ini,
// dan fungsi ini menolak jika belum ada klaim yang disetujui petugas.
export function markReturned(data, itemId, input = {}, now = new Date()) {
  const item = data.items.find((i) => i.id === itemId);
  if (!item) return fail('Barang tidak ditemukan.');
  if (item.status === 'RETURNED') return fail('Barang ini sudah ditandai dikembalikan.');

  const approved = getApprovedClaim(data, itemId);
  if (!approved) {
    return fail(
      item.highValue
        ? 'Penyerahan ditahan: barang bernilai tinggi harus diverifikasi petugas terlebih dahulu.'
        : 'Penyerahan ditahan: petugas belum menyetujui bukti kepemilikan.',
    );
  }

  const reason = 'Barang sudah dikembalikan kepada pengklaim lain.';
  return succeed({
    ...data,
    items: data.items.map((i) =>
      i.id === itemId
        ? { ...i, status: 'RETURNED', returnedTo: approved.claimantName, returnedAt: now.toISOString(), handoverNotes: clean(input.handoverNotes) }
        : i,
    ),
    claims: data.claims.map((c) => {
      if (c.itemId !== itemId) return c;
      if (c.id === approved.id) return { ...c, status: 'RETURNED' };
      if (c.status === 'PENDING' || c.status === 'APPROVED') return { ...c, status: 'REJECTED', rejectReason: reason, reviewedAt: now.toISOString() };
      return c;
    }),
  });
}

/* ---------- US7: tampilan mahasiswa dibatasi ---------- */

export function getPublicItem(item) {
  const publicItem = {};
  PUBLIC_ITEM_FIELDS.forEach((field) => {
    publicItem[field] = item[field];
  });
  publicItem.highValue = Boolean(item.highValue); // hanya penanda, bukan rincian
  // Pertanyaan verifikasi ditampilkan ke pengklaim (US8); bukan rincian barang.
  publicItem.verificationQuestions = item.highValue ? [...(item.verificationQuestions ?? [])] : [];
  return publicItem;
}

export function getPublicItems(items) {
  return items.filter((item) => item.status !== 'RETURNED').map(getPublicItem);
}

export function setStudentName(data, name) {
  return succeed({ ...data, studentName: String(name ?? '') });
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, 'X');
}
