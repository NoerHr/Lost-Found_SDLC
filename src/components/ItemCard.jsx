import StatusBadge from './StatusBadge.jsx';

export default function ItemCard({ item, isSelected, onSelect }) {
  return (
    <button
      className={`record-card${isSelected ? ' selected' : ''}`}
      type="button"
      onClick={() => onSelect(item.id)}
      aria-pressed={isSelected}
    >
      <span className="card-heading">
        <span>
          <strong>{item.category}</strong>
          <span className="meta"> · {item.id}</span>
        </span>
        <StatusBadge status={item.status} />
      </span>
      <span className="card-footer">
        <span>{item.locationFound}</span>
        <span>{item.dateFound}</span>
      </span>
    </button>
  );
}
