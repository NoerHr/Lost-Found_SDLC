import StatusBadge from './StatusBadge.jsx';

export default function ItemDetails({ item, onMarkStored }) {
  if (!item) {
    return <div className="empty-state">Select an item to view its details.</div>;
  }

  const isStored = item.status === 'STORED';

  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{item.id}</p>
          <h2>{item.category}</h2>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <dl className="details-list">
        <dt>Location found</dt>
        <dd>{item.locationFound}</dd>
        <dt>Date found</dt>
        <dd>{item.dateFound}</dd>
        <dt>Description</dt>
        <dd>{item.description}</dd>
      </dl>

      <button
        className="primary-button"
        type="button"
        onClick={() => onMarkStored(item.id)}
        disabled={isStored}
      >
        {isStored ? 'Already Stored' : 'Mark as Stored'}
      </button>
    </>
  );
}
