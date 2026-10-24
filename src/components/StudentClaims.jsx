import StatusBadge from './StatusBadge.jsx';
import { formatDateTime } from '../utils/itemUtils.js';

const messages = {
  PENDING: 'Menunggu verifikasi petugas. Datang ke pos security dan sebutkan kode klaim bila ada.',
  APPROVED: 'Klaim disetujui petugas. Silakan datang ke pos security untuk serah terima.',
  RETURNED: 'Barang sudah diserahkan kepada Anda.',
};

export default function StudentClaims({ claims, publicItems }) {
  if (claims.length === 0) return <div className="empty-state">Anda belum mengajukan klaim. Buka tab Barang Temuan untuk mengajukan.</div>;
  return (
    <ul className="record-list" aria-label="Klaim saya">
      {claims.map((claim) => {
        const item = publicItems.find((i) => i.id === claim.itemId);
        return (
          <li key={claim.id} className="report-card">
            <p className="card-heading">
              <span><strong>{item?.category ?? claim.itemId}</strong><span className="meta"> · {claim.itemId} · {claim.id}</span></span>
              <StatusBadge status={claim.status} />
            </p>
            <p className="card-line">
              {claim.status === 'REJECTED' ? `Klaim ditolak: ${claim.rejectReason}` : messages[claim.status]}
            </p>
            {claim.claimCode && <p className="card-line">Kode klaim: <code>{claim.claimCode}</code></p>}
            <p className="card-line muted">Bukti Anda: {claim.proofNotes}</p>
            <p className="card-line muted">Diajukan {formatDateTime(claim.submittedAt)}</p>
          </li>
        );
      })}
    </ul>
  );
}
