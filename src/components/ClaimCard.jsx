import { useState } from 'react';
import Field from './Field.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatDateTime, passThreshold } from '../utils/itemUtils.js';

// Kartu klaim untuk petugas: bandingkan bukti pengklaim dengan catatan barang,
// lalu SETUJUI atau TOLAK (US6 + US8).
export default function ClaimCard({ claim, item, actions, onOpenItem }) {
  const answers = claim.answers ?? [];
  const [proofMatches, setProofMatches] = useState(false);
  const [marks, setMarks] = useState(() => answers.map(() => false));
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState({ text: '', errors: {} });

  function run(result) {
    setFeedback(result.ok ? { text: '', errors: {} } : { text: result.error, errors: result.errors ?? {} });
    if (result.ok) {
      setRejecting(false);
      setReason('');
      setProofMatches(false);
      setMarks(answers.map(() => false));
    }
  }

  const active = claim.status === 'PENDING' || claim.status === 'APPROVED';
  const pending = claim.status === 'PENDING';
  const markedCorrect = marks.filter(Boolean).length;
  const needed = passThreshold(answers.length);

  return (
    <article className="claim-card">
      <header className="card-heading">
        <span>
          <strong>{claim.claimantName}</strong>
          <span className="meta"> · {claim.id} · {claim.source === 'WALK_IN' ? 'klaim langsung' : 'diajukan online'}</span>
        </span>
        <span className="badge-group">
          {item?.highValue && <StatusBadge status="HIGH_VALUE" />}
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
        {claim.claimCode && (<><dt>Kode klaim</dt><dd><code>{claim.claimCode}</code></dd></>)}
        <dt>Diajukan</dt><dd>{formatDateTime(claim.submittedAt)}</dd>
        {claim.verifierName && (<><dt>Petugas</dt><dd>{claim.verifierName} ({formatDateTime(claim.reviewedAt)})</dd></>)}
        {claim.status === 'REJECTED' && (<><dt>Alasan ditolak</dt><dd>{claim.rejectReason}</dd></>)}
      </dl>

      {answers.length > 0 && (
        <section className="secondary-section" aria-label="Jawaban verifikasi">
          <h4>Jawaban verifikasi (barang bernilai tinggi)</h4>
          <ul className="qa-list">
            {answers.map((entry, index) => (
              <li className="qa-item" key={entry.question}>
                <p className="qa-question">{index + 1}. {entry.question}</p>
                <p className="qa-answer">{entry.dontRemember ? 'Tidak ingat' : entry.answer}</p>
                {pending ? (
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={marks[index] ?? false}
                      disabled={entry.dontRemember}
                      onChange={(e) => setMarks((current) => current.map((m, i) => (i === index ? e.target.checked : m)))}
                    />
                    <span>Jawaban benar (sesuai pengetahuan petugas / barang)</span>
                  </label>
                ) : (
                  claim.status !== 'REJECTED' && <StatusBadge status={entry.correct ? 'APPROVED' : 'REJECTED'} />
                )}
              </li>
            ))}
          </ul>
          {pending && <p className="helper-text">Dinilai benar {markedCorrect} dari {answers.length}; minimal {needed} agar dapat disetujui.</p>}
          {feedback.errors.marks && <p className="field-error" role="alert">{feedback.errors.marks}</p>}
        </section>
      )}

      {feedback.text && <p className="form-error" role="alert">{feedback.text}</p>}

      {claim.status === 'PENDING' && !rejecting && (
        <div className="form compact">
          <label className="checkbox">
            <input type="checkbox" checked={proofMatches} onChange={(e) => setProofMatches(e.target.checked)} />
            <span>{answers.length > 0 ? 'Bukti kepemilikan dan barang fisik sesuai (diperiksa tatap muka)' : 'Bukti kepemilikan sesuai dengan catatan barang'}</span>
          </label>
          {feedback.errors.proofMatches && <p className="field-error" role="alert">{feedback.errors.proofMatches}</p>}
          {feedback.errors.verifierName && <p className="field-error" role="alert">Isi nama petugas di kolom “Petugas” pada bagian atas halaman.</p>}
          <div className="action-row">
            <button className="primary-button" type="button" onClick={() => run(actions.approveClaim(claim.id, { proofMatches, marks }))}>Setujui Klaim</button>
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
