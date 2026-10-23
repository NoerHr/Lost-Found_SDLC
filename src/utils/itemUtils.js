// Semua operasi menerima `data` ({ items }) dan mengembalikan
// { ok: true, data, ... } atau { ok: false, error, errors }. Fungsi murni, mudah diuji.
//
// Item.status : STORED

const clean = (value) => String(value ?? '').trim();
const succeed = (data, extra = {}) => ({ ok: true, data, ...extra });
const fail = (error, errors = {}) => ({ ok: false, error, errors });

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

export function getItemCounts(data) {
  return { total: data.items.length };
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

  const item = {
    id: nextId('ITEM', data.items),
    category: clean(input.category),
    color: clean(input.color),
    brand: clean(input.brand),
    description: clean(input.description),
    foundDate: clean(input.foundDate),
    foundTime: clean(input.foundTime),
    locationFound: clean(input.locationFound),
    handedOverBy: clean(input.handedOverBy),
    storageLocation: clean(input.storageLocation),
    status: 'STORED',
    recordedAt: now.toISOString(),
  };
  return succeed({ ...data, items: [item, ...data.items] }, { item });
}
