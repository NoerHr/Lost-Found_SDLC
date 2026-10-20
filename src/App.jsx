import { useEffect, useState } from 'react';
import ItemDetails from './components/ItemDetails.jsx';
import ItemList from './components/ItemList.jsx';
import ResetControl from './components/ResetControl.jsx';
import { createSeedData } from './data/seed.js';
import { getItemCounts, markItemAsStored } from './utils/itemUtils.js';
import { loadState, resetState, saveState } from './utils/storage.js';

const STORAGE_KEY = 'sdlc:case-a:v1';

export default function App() {
  const [data, setData] = useState(() => loadState(STORAGE_KEY, createSeedData));
  const [selectedId, setSelectedId] = useState(() => data.items[0]?.id ?? null);

  useEffect(() => {
    saveState(STORAGE_KEY, data);
  }, [data]);

  const selectedItem = data.items.find((item) => item.id === selectedId) ?? null;
  const counts = getItemCounts(data.items);

  function handleMarkStored(itemId) {
    setData((current) => ({
      ...current,
      items: markItemAsStored(current.items, itemId),
    }));
  }

  function handleReset() {
    const freshData = resetState(STORAGE_KEY, createSeedData);
    setData(freshData);
    setSelectedId(freshData.items[0]?.id ?? null);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">SDLC Starter App</p>
          <h1>Campus Lost &amp; Found</h1>
          <p className="subtitle">
            Browse simple campus item records and update their stored status.
          </p>
        </div>
        <ResetControl onReset={handleReset} />
      </header>

      <p className="browser-note">Demo data is saved in this browser only.</p>

      <section className="overview-grid" aria-label="Overview">
        <article className="summary-card">
          <p className="summary-label">Total items</p>
          <p className="summary-value">{counts.total}</p>
        </article>
        <article className="summary-card">
          <p className="summary-label">Stored items</p>
          <p className="summary-value">{counts.stored}</p>
        </article>
      </section>

      <section className="content-grid">
        <section className="panel" aria-labelledby="item-list-heading">
          <h2 id="item-list-heading">Item Records</h2>
          <ItemList
            items={data.items}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>
        <aside className="panel" aria-label="Selected item details">
          <ItemDetails item={selectedItem} onMarkStored={handleMarkStored} />
        </aside>
      </section>
    </main>
  );
}
