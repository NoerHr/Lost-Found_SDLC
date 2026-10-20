export function getItemCounts(items) {
  return {
    total: items.length,
    stored: items.filter((item) => item.status === 'STORED').length,
  };
}

export function markItemAsStored(items, itemId) {
  return items.map((item) =>
    item.id === itemId ? { ...item, status: 'STORED' } : item,
  );
}
