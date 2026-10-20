const items = [
  {
    id: 'ITEM-001',
    category: 'Wallet',
    locationFound: 'Building A Lobby',
    dateFound: '2026-10-08',
    description: 'Black wallet with a plain cover',
    status: 'FOUND',
  },
  {
    id: 'ITEM-002',
    category: 'Water Bottle',
    locationFound: 'Library Level 2',
    dateFound: '2026-10-09',
    description: 'Blue reusable water bottle',
    status: 'STORED',
  },
  {
    id: 'ITEM-003',
    category: 'Notebook',
    locationFound: 'Room C-204',
    dateFound: '2026-10-09',
    description: 'Small green spiral notebook',
    status: 'FOUND',
  },
  {
    id: 'ITEM-004',
    category: 'Umbrella',
    locationFound: 'Main Cafeteria',
    dateFound: '2026-10-10',
    description: 'Foldable grey umbrella',
    status: 'STORED',
  },
  {
    id: 'ITEM-005',
    category: 'Pencil Case',
    locationFound: 'Science Laboratory',
    dateFound: '2026-10-10',
    description: 'Navy fabric pencil case',
    status: 'FOUND',
  },
  {
    id: 'ITEM-006',
    category: 'USB Drive',
    locationFound: 'Computer Lab 1',
    dateFound: '2026-10-11',
    description: 'Silver USB drive without a label',
    status: 'FOUND',
  },
];

export function createSeedData() {
  return { items: items.map((item) => ({ ...item })) };
}
