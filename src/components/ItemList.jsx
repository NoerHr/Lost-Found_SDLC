import ItemCard from './ItemCard.jsx';

export default function ItemList({ items, selectedId, onSelect, emptyText = 'Tidak ada catatan barang.' }) {
  if (items.length === 0) return <div className="empty-state">{emptyText}</div>;

  return (
    <ul className="record-list" aria-label="Daftar barang temuan">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} isSelected={item.id === selectedId} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
