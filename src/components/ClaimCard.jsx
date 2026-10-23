import { useState } from 'react';
import Field from './Field.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatDateTime } from '../utils/itemUtils.js';

// Kartu klaim untuk petugas: bandingkan bukti pengklaim dengan catatan barang,
// lalu SETUJUI atau TOLAK (US6).
export default function ClaimCard({ claim, item, actions, onOpenItem }) {
  const [proofMatches, setProofMatches] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState({ text: '', errors: {} });

  function run(result) {
    setFeedback(result.ok ? { text: '', errors: {} } : { text: result.error, errors: result.errors ?? {} });
    if (result.ok) {
      setRejecting(false);
      setReason('');
      setProofMatches(false);
    }
  }

  const active = claim.status === 'PENDING' || claim.status === 'APPROVED';

  return (
    <article className="claim-card">
      <header className="card-heading">
        <span>
          <strong>{claim.claimantName}</strong>
          <span className="meta"> · {claim.id} · {claim.source === 'WALK_IN' ? 'klaim langsung' : 'diajukan online'}</span>
        </span>
        <span className="badge-group">
          <StatusBadge status={claim.status} />
        </span>
      </header>

      {item && (
        <div className="claim-item">
          <p><strong>{item.category}</strong> · {item.id} · {[item.color, item.brand].filter(Boolean).join(' · ') || '-'}</p>
          <p className="muted">Catatan petugas: {item.description}</p>
          <p className="muted">Disimpan: {item.storageLocation}</p>
          {onOpenItem && <button className="secondary-button" type="button" onClick={() => onOpenItem(item.id)}>Buka barang</button>}
        </div>
      )}

      <dl className="details-list">
        <dt>Bukti dari pengklaim</dt><dd>{claim.proofNotes}</dd>
        <dt>Diajukan</dt><dd>{formatDateTime(claim.submittedAt)}</dd>
        {claim.verifierName && (<><dt>Petugas</dt><dd>{claim.verifierName} ({formatDateTime(claim.reviewedAt)})</dd></>)}
        {claim.status === 'REJECTED' && (<><dt>Alasan ditolak</dt><dd>{claim.rejectReason}</dd></>)}
      </dl>

      {feedback.text && <p className="form-error" role="alert">{feedback.text}</p>}

      {claim.status === 'PENDING' && !rejecting && (
        <div className="form compact">
          <label className="checkbox">
            <input type="checkbox" checked={proofMatches} onChange={(e) => setProofMatches(e.target.checked)} />
            <span>Bukti kepemilikan sesuai dengan catatan barang</span>
          </label>
          {feedback.errors.proofMatches && <p className="field-error" role="alert">{feedback.errors.proofMatches}</p>}
          {feedback.errors.verifierName && <p className="field-error" role="alert">Isi nama petugas di kolom “Petugas” pada bagian atas halaman.</p>}
          <div className="action-row">
            <button className="primary-button" type="button" onClick={() => run(actions.approveClaim(claim.id, { proofMatches }))}>Setujui Klaim</button>
            <button className="secondary-button" type="button" onClick={() => setRejecting(true)}>Tolak</button>
          </div>
        </div>
      )}

      {active && (claim.status === 'APPROVED' || rejecting) && (
        <div className="form compact">
          {rejecting ? (
            <>
              <Field id={`reason-${claim.id}`} label="Alasan penolakan *" error={feedback.errors.reason}>
                <input id={`reason-${claim.id}`} value={reason} onChange={(e) => setReason(e.target.value)} />
              </Field>
              <div className="action-row">
                <button className="primary-button" type="button" onClick={() => run(actions.rejectClaim(claim.id, { reason }))}>Konfirmasi Tolak</button>
                <button className="secondary-button" type="button" onClick={() => setRejecting(false)}>Batal</button>
              </div>
            </>
          ) : (
            <button className="secondary-button" type="button" onClick={() => setRejecting(true)}>Batalkan persetujuan / tolak</button>
          )}
        </div>
      )}
    </article>
  );
}
