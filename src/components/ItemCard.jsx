import StatusBadge from './StatusBadge.jsx';

// Dipakai untuk tampilan petugas (rincian lengkap) maupun mahasiswa (field terbatas).
export default function ItemCard({ item, isSelected, onSelect }) {
  const summary = [item.color, item.brand].filter(Boolean).join(' · ');
  return (
    <button className={`record-card${isSelected ? ' selected' : ''}`} type="button" onClick={() => onSelect(item.id)} aria-pressed={isSelected}>
      <span className="card-heading">
        <span>
          <strong>{item.category}</strong>
          <span className="meta"> · {item.id}</span>
        </span>
        <span className="badge-group">
          {item.highValue && <StatusBadge status="HIGH_VALUE" />}
          {item.state && <StatusBadge status={item.state} />}
        </span>
      </span>
      {summary && <span className="card-line">{summary}</span>}
      {item.description && <span className="card-line muted">{item.description}</span>}
      <span className="card-footer">
        <span>{item.locationFound ?? ''}</span>
        <span>{item.foundDate}</span>
      </span>
      {item.storageLocation && <span className="card-line muted">Disimpan: {item.storageLocation}</span>}
    </button>
  );
}
