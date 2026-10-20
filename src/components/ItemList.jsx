import ItemCard from './ItemCard.jsx';

export default function ItemList({ items, selectedId, onSelect }) {
  if (items.length === 0) {
    return <div className="empty-state">No item records are available.</div>;
  }

  return (
    <ul className="record-list" aria-label="Lost and found items">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard
            item={item}
            isSelected={item.id === selectedId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}
