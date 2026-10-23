import { useState } from 'react';
import ClaimCard from './ClaimCard.jsx';

// Tab petugas: semua klaim masuk, tempat menyetujui atau menolak.
export default function ClaimsInbox({ data, actions, onOpenItem }) {
  const [filter, setFilter] = useState('PENDING');
  const claims = [...data.claims]
    .filter((c) => filter === 'ALL' || c.status === 'PENDING' || c.status === 'APPROVED')
    .sort((a, b) => (a.status === 'PENDING' ? -1 : 0) - (b.status === 'PENDING' ? -1 : 0));

  return (
    <>
      <div className="panel-heading">
        <h2>Klaim Masuk</h2>
        <select aria-label="Filter klaim" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="PENDING">Perlu tindakan</option>
          <option value="ALL">Semua klaim</option>
        </select>
      </div>
      {claims.length === 0 && <div className="empty-state">Tidak ada klaim.</div>}
      <div className="claim-list">
        {claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} item={data.items.find((i) => i.id === claim.itemId)} actions={actions} onOpenItem={onOpenItem} />
        ))}
      </div>
    </>
  );
}
