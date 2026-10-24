import { useState } from 'react';
import Field from './Field.jsx';
import { canHandOver, formatDateTime, getApprovedClaim } from '../utils/itemUtils.js';

// US6 + US8: penyerahan ditahan sampai ada klaim yang disetujui petugas.
export default function HandoverSection({ item, data, actions }) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (item.status === 'RETURNED') {
    return (
      <section className="secondary-section handover" aria-label="Penyerahan">
        <h3>Penyerahan</h3>
        <dl className="details-list">
          <dt>Diserahkan kepada</dt><dd>{item.returnedTo}</dd>
          <dt>Waktu</dt><dd>{formatDateTime(item.returnedAt)}</dd>
          {item.handoverNotes && (<><dt>Catatan</dt><dd>{item.handoverNotes}</dd></>)}
        </dl>
      </section>
    );
  }

  const approved = getApprovedClaim(data, item.id);
  const ready = canHandOver(data, item.id);

  function handleReturn() {
    const result = actions.markReturned(item.id, { handoverNotes: notes });
    setError(result.ok ? '' : result.error);
  }

  return (
    <section className="secondary-section handover" aria-label="Penyerahan">
      <h3>Penyerahan</h3>
      <p className={`notice ${item.highValue ? 'warning' : 'info'}`}>
        {item.highValue
          ? 'Barang bernilai tinggi: penyerahan ditahan sampai petugas memverifikasi bukti kepemilikan (aturan baru Campus Security).'
          : 'Barang hanya dapat ditandai dikembalikan setelah petugas memeriksa bukti kepemilikan.'}
      </p>
      {error && <p className="form-error" role="alert">{error}</p>}
      {ready && (
        <>
          <p className="form-success">Klaim {approved.claimantName} telah disetujui. Barang dapat diserahkan.</p>
          <Field id="ho-notes" label="Catatan serah terima" hint="Opsional (pencatatan serah terima masih Open Question, Q10).">
            <textarea id="ho-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </>
      )}
      <div className="footer-actions">
        <button className="primary-button" type="button" disabled={!ready} onClick={handleReturn}>Tandai Dikembalikan</button>
      </div>
      {!ready && <p className="helper-text">Tombol aktif setelah petugas menyetujui sebuah klaim.</p>}
    </section>
  );
}
