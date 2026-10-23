import { useEffect, useState } from 'react';
import ItemForm from './components/ItemForm.jsx';
import ItemList from './components/ItemList.jsx';
import ResetControl from './components/ResetControl.jsx';
import SecurityItemDetails from './components/SecurityItemDetails.jsx';
import Tabs from './components/Tabs.jsx';
import { createSeedData } from './data/seed.js';
import { createFoundItem, getItemCounts } from './utils/itemUtils.js';
import { loadState, resetState, saveState } from './utils/storage.js';

const STORAGE_KEY = 'sdlc:case-a:us1-v1';

export default function App() {
  const [data, setData] = useState(() => loadState(STORAGE_KEY, createSeedData));
  const [tab, setTab] = useState('items');
  const [selectedItemId, setSelectedItemId] = useState(() => data.items[0]?.id ?? null);

  useEffect(() => {
    saveState(STORAGE_KEY, data);
  }, [data]);

  const counts = getItemCounts(data);

  // Semua perubahan lewat apply(): state hanya disimpan jika operasi berhasil.
  function apply(operation) {
    const result = operation(data);
    if (result.ok) setData(result.data);
    return result;
  }

  function handleCreateItem(input) {
    const result = apply((d) => createFoundItem(d, input));
    if (result.ok) {
      setSelectedItemId(result.item.id);
      setTab('items');
    }
    return result;
  }

  function handleReset() {
    const fresh = resetState(STORAGE_KEY, createSeedData);
    setData(fresh);
    setSelectedItemId(fresh.items[0]?.id ?? null);
  }

  const selectedItem = data.items.find((item) => item.id === selectedItemId) ?? null;

  const tabs = [
    { id: 'items', label: 'Barang Temuan' },
    { id: 'record', label: 'Catat Barang Temuan' },
  ];

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">SDLC · Case A · Tampilan Petugas Security</p>
          <h1>Campus Lost &amp; Found</h1>
          <p className="subtitle">Catat barang temuan beserta informasi dasar dan lokasi penyimpanannya.</p>
        </div>
        <div className="header-actions">
          <ResetControl onReset={handleReset} />
        </div>
      </header>

      <p className="browser-note">
        Data demo disimpan di browser ini saja. Otorisasi petugas belum ditentukan (P10 Q4).
      </p>

      <section className="overview-grid" aria-label="Ringkasan">
        <article className="summary-card">
          <p className="summary-label">Total barang</p>
          <p className="summary-value">{counts.total}</p>
        </article>
      </section>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'items' && (
        <section className="content-grid">
          <section className="panel" aria-labelledby="item-list-heading">
            <h2 id="item-list-heading">Catatan Barang Temuan</h2>
            <ItemList items={data.items} selectedId={selectedItemId} onSelect={setSelectedItemId} />
          </section>
          <aside className="panel" aria-label="Rincian barang">
            <SecurityItemDetails item={selectedItem} />
          </aside>
        </section>
      )}
      {tab === 'record' && (
        <section className="panel"><ItemForm onSubmit={handleCreateItem} /></section>
      )}
    </main>
  );
}
