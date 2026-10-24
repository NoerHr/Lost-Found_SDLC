import StatusBadge from './StatusBadge.jsx';
import ClaimCard from './ClaimCard.jsx';
import ClaimForm from './ClaimForm.jsx';
import HandoverSection from './HandoverSection.jsx';
import VerificationQuestions from './VerificationQuestions.jsx';
import { formatDateTime, getClaimsForItem } from '../utils/itemUtils.js';

// Rincian LENGKAP khusus petugas (US1 AC1.2) + klaim masuk + penyerahan.
export default function SecurityItemDetails({ item, state, data, actions }) {
  if (!item) return <div className="empty-state">Pilih catatan barang untuk melihat rinciannya.</div>;
  const claims = getClaimsForItem(data, item.id);
  const hasActiveClaim = claims.some((c) => c.status === 'PENDING' || c.status === 'APPROVED');

  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{item.id}</p>
          <h2>{item.category}</h2>
        </div>
        <span className="badge-group">
          {item.highValue && <StatusBadge status="HIGH_VALUE" />}
          <StatusBadge status={state} />
        </span>
      </div>

      <dl className="details-list">
        <dt>Warna</dt><dd>{item.color || '-'}</dd>
        <dt>Merek</dt><dd>{item.brand || '-'}</dd>
        <dt>Deskripsi</dt><dd>{item.description}</dd>
        <dt>Lokasi ditemukan</dt><dd>{item.locationFound}</dd>
        <dt>Waktu ditemukan</dt><dd>{item.foundDate}{item.foundTime ? `, ${item.foundTime}` : ''}</dd>
        <dt>Diserahkan oleh</dt><dd>{item.handedOverBy}</dd>
        <dt>Lokasi penyimpanan</dt><dd>{item.storageLocation}</dd>
        <dt>Dicatat</dt><dd>{formatDateTime(item.recordedAt)}</dd>
      </dl>

      {item.highValue && item.status === 'STORED' && (
        <VerificationQuestions key={item.id} item={item} locked={hasActiveClaim} onSave={actions.setQuestions} />
      )}

      <section className="secondary-section" aria-label="Klaim untuk barang ini">
        <h3>Klaim untuk barang ini ({claims.length})</h3>
        {claims.length === 0 && <p className="helper-text">Belum ada klaim.</p>}
        {claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} item={null} actions={actions} />
        ))}
        {item.status === 'STORED' && (
          <ClaimForm key={`${item.id}-${(item.verificationQuestions ?? []).join('|')}`} askName highValue={item.highValue} questions={item.verificationQuestions ?? []} onSubmit={(input) => actions.submitClaim(item.id, input, 'WALK_IN')} />
        )}
      </section>

      <HandoverSection key={item.id} item={item} data={data} actions={actions} />
    </>
  );
}
