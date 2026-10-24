import { useState } from 'react';
import Field from './Field.jsx';
import { CATEGORIES } from '../data/constants.js';
import { isHighValueCategory, todayString } from '../utils/itemUtils.js';

const emptyForm = () => ({
  category: '', color: '', brand: '', description: '', foundDate: todayString(), foundTime: '',
  locationFound: '', handedOverBy: '', storageLocation: '', highValue: false,
});

// US1 (R1): catat barang temuan + US8: penanda barang bernilai tinggi.
export default function ItemForm({ onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const locked = isHighValueCategory(form.category);

  const update = (name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [name]: value }));
  };

  function handleSubmit(event) {
    event.preventDefault();
    const result = onSubmit(form);
    if (result.ok) {
      setForm(emptyForm());
      setErrors({});
      setFormError('');
    } else {
      setErrors(result.errors ?? {});
      setFormError(result.error);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>Catat Barang Temuan</h2>
      <p className="muted">Isi informasi dasar barang yang diserahkan ke pos keamanan.</p>
      {formError && <p className="form-error" role="alert">{formError}</p>}

      <div className="form-grid">
        <Field id="if-category" label="Jenis barang *" error={errors.category}>
          <select id="if-category" value={form.category} onChange={update('category')}>
            <option value="">Pilih jenis…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field id="if-color" label="Warna">
          <input id="if-color" value={form.color} onChange={update('color')} placeholder="mis. Hitam" />
        </Field>
        <Field id="if-brand" label="Merek">
          <input id="if-brand" value={form.brand} onChange={update('brand')} />
        </Field>
        <Field id="if-handed" label="Pihak yang menyerahkan *" error={errors.handedOverBy}>
          <input id="if-handed" value={form.handedOverBy} onChange={update('handedOverBy')} placeholder="mis. Mahasiswa / staf kantin" />
        </Field>
        <Field id="if-date" label="Tanggal ditemukan *" error={errors.foundDate}>
          <input id="if-date" type="date" value={form.foundDate} onChange={update('foundDate')} />
        </Field>
        <Field id="if-time" label="Waktu ditemukan" hint="Opsional; tingkat kerincian waktu masih Open Question (Q16).">
          <input id="if-time" type="time" value={form.foundTime} onChange={update('foundTime')} />
        </Field>
        <Field id="if-location" label="Lokasi ditemukan *" error={errors.locationFound}>
          <input id="if-location" value={form.locationFound} onChange={update('locationFound')} placeholder="mis. Lobi Gedung A" />
        </Field>
        <Field id="if-storage" label="Lokasi penyimpanan *" error={errors.storageLocation}>
          <input id="if-storage" value={form.storageLocation} onChange={update('storageLocation')} placeholder="mis. Lemari Pos Security - Rak 1" />
        </Field>
      </div>

      <Field id="if-desc" label="Deskripsi umum *" error={errors.description}>
        <textarea id="if-desc" rows={3} value={form.description} onChange={update('description')} />
      </Field>

      <label className="checkbox">
        <input type="checkbox" checked={locked || form.highValue} disabled={locked} onChange={update('highValue')} />
        <span>
          Barang bernilai tinggi
          <small>
            {locked
              ? ' (otomatis untuk jenis ini; penyerahan wajib diverifikasi petugas)'
              : ' (centang bila perlu penanganan khusus; daftar jenis belum final, A5)'}
          </small>
        </span>
      </label>

      <button className="primary-button" type="submit">Simpan Catatan</button>
    </form>
  );
}
