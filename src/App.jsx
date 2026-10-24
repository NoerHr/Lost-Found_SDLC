import { useEffect, useMemo, useState } from 'react';
import ClaimsInbox from './components/ClaimsInbox.jsx';
import ItemForm from './components/ItemForm.jsx';
import ItemList from './components/ItemList.jsx';
import ResetControl from './components/ResetControl.jsx';
import RoleSwitch from './components/RoleSwitch.jsx';
import SecurityItemDetails from './components/SecurityItemDetails.jsx';
import StudentClaims from './components/StudentClaims.jsx';
import StudentItemDetails from './components/StudentItemDetails.jsx';
import Tabs from './components/Tabs.jsx';
import { ROLES } from './data/constants.js';
import { createSeedData } from './data/seed.js';
import {
  approveClaim, createFoundItem, getClaimsForStudent, getItemCounts, getItemState,
  getPublicItems, markReturned, rejectClaim, setStudentName, setVerificationQuestions, submitClaim,
} from './utils/itemUtils.js';
import { loadState, resetState, saveState } from './utils/storage.js';

const STORAGE_KEY = 'sdlc:case-a:roles-v2';

export default function App() {
  const [data, setData] = useState(() => loadState(STORAGE_KEY, createSeedData));
  const [role, setRole] = useState(ROLES.STUDENT);
  const [tab, setTab] = useState('items');
  const [staffName, setStaffName] = useState('Ahmad Fuady');
  const [selectedItemId, setSelectedItemId] = useState(() => data.items[0]?.id ?? null);
  const [selectedPublicId, setSelectedPublicId] = useState(null);

  useEffect(() => {
    saveState(STORAGE_KEY, data);
  }, [data]);

  const isStaff = role === ROLES.STAFF;
  const counts = getItemCounts(data);

  // Semua perubahan lewat apply(): state hanya disimpan jika operasi berhasil.
  function apply(operation) {
    const result = operation(data);
    if (result.ok) setData(result.data);
    return result;
  }

  const staffActions = {
    approveClaim: (id, input) => apply((d) => approveClaim(d, id, { ...input, verifierName: staffName })),
    rejectClaim: (id, input) => apply((d) => rejectClaim(d, id, { ...input, verifierName: staffName })),
    markReturned: (id, input) => apply((d) => markReturned(d, id, input)),
    setQuestions: (itemId, questions) => apply((d) => setVerificationQuestions(d, itemId, questions)),
    submitClaim: (itemId, input, source) => apply((d) => submitClaim(d, itemId, input, source)),
  };

  function handleCreateItem(input) {
    const result = apply((d) => createFoundItem(d, input));
    if (result.ok) {
      setSelectedItemId(result.item.id);
      setTab('items');
    }
    return result;
  }

  function handleStudentClaim(itemId, input) {
    return apply((d) =>
      submitClaim(d, itemId, { claimantName: d.studentName, proofNotes: input.proofNotes, answers: input.answers }, 'ONLINE'),
    );
  }

  function openItem(itemId) {
    setSelectedItemId(itemId);
    setTab('items');
  }

  function handleRoleChange(nextRole) {
    setRole(nextRole);
    setTab('items');
  }

  function handleReset() {
    const fresh = resetState(STORAGE_KEY, createSeedData);
    setData(fresh);
    setSelectedItemId(fresh.items[0]?.id ?? null);
    setSelectedPublicId(null);
  }

  const staffItems = useMemo(
    () => data.items.map((item) => ({ ...item, state: getItemState(data, item) })),
    [data],
  );
  const publicItems = useMemo(() => getPublicItems(data.items), [data.items]);
  const selectedItem = staffItems.find((item) => item.id === selectedItemId) ?? null;
  const selectedPublic = publicItems.find((item) => item.id === selectedPublicId) ?? null;
  const myClaims = getClaimsForStudent(data, data.studentName);

  const tabs = isStaff
    ? [
        { id: 'items', label: 'Barang Temuan' },
        { id: 'record', label: 'Catat Barang Temuan' },
        { id: 'claims', label: 'Klaim Masuk', count: counts.pendingClaims },
      ]
    : [
        { id: 'items', label: 'Barang Temuan' },
        { id: 'claims', label: 'Klaim Saya', count: counts.myClaims },
      ];

  const overview = isStaff
    ? [
        ['Total barang', counts.total],
        ['Tersimpan', counts.stored],
        ['Ada klaim', counts.claimed],
        ['Terverifikasi', counts.verified],
        ['Dikembalikan', counts.returned],
        ['Bernilai tinggi (aktif)', counts.highValue],
      ]
    : [
        ['Barang temuan', counts.publicItems],
        ['Klaim saya', counts.myClaims],
      ];

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">SDLC · Case A · {isStaff ? 'Tampilan Petugas Security' : 'Tampilan Mahasiswa'}</p>
          <h1>Campus Lost &amp; Found</h1>
          <p className="subtitle">
            {isStaff
              ? 'Catat barang temuan, lalu setujui atau tolak klaim mahasiswa sebelum barang diserahkan.'
              : 'Lihat barang temuan dan ajukan klaim dengan ciri-ciri barang. Barang baru diserahkan setelah petugas memverifikasi.'}
          </p>
        </div>
        <div className="header-actions">
          <RoleSwitch role={role} onChange={handleRoleChange} />
          {isStaff ? (
            <label className="identity">
              Petugas
              <input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Nama petugas" aria-label="Nama petugas" />
            </label>
          ) : (
            <label className="identity">
              Nama saya
              <input value={data.studentName} onChange={(e) => apply((d) => setStudentName(d, e.target.value))} placeholder="Nama mahasiswa" aria-label="Nama mahasiswa" />
            </label>
          )}
          <ResetControl onReset={handleReset} />
        </div>
      </header>

      <p className="browser-note">
        Data demo disimpan di browser ini saja. Peran dan nama hanya simulasi; otorisasi petugas belum ditentukan (P10 Q4).
      </p>

      <section className="overview-grid" aria-label="Ringkasan">
        {overview.map(([label, value]) => (
          <article className="summary-card" key={label}>
            <p className="summary-label">{label}</p>
            <p className="summary-value">{value}</p>
          </article>
        ))}
      </section>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {/* ---------------- PETUGAS SECURITY ---------------- */}
      {isStaff && tab === 'items' && (
        <section className="content-grid">
          <section className="panel" aria-labelledby="item-list-heading">
            <h2 id="item-list-heading">Catatan Barang Temuan</h2>
            <ItemList items={staffItems} selectedId={selectedItemId} onSelect={setSelectedItemId} />
          </section>
          <aside className="panel" aria-label="Rincian barang">
            <SecurityItemDetails item={selectedItem} state={selectedItem?.state} data={data} actions={staffActions} />
          </aside>
        </section>
      )}
      {isStaff && tab === 'record' && (
        <section className="panel"><ItemForm onSubmit={handleCreateItem} /></section>
      )}
      {isStaff && tab === 'claims' && (
        <section className="panel"><ClaimsInbox data={data} actions={staffActions} onOpenItem={openItem} /></section>
      )}

      {/* ---------------- MAHASISWA ---------------- */}
      {!isStaff && tab === 'items' && (
        <section className="content-grid">
          <section className="panel" aria-labelledby="public-heading">
            <h2 id="public-heading">Barang Temuan (Informasi Publik)</h2>
            <ItemList items={publicItems} selectedId={selectedPublicId} onSelect={setSelectedPublicId} emptyText="Belum ada barang temuan." />
          </section>
          <aside className="panel" aria-label="Informasi publik barang">
            <StudentItemDetails key={selectedPublicId} item={selectedPublic} studentName={data.studentName} onClaim={handleStudentClaim} />
          </aside>
        </section>
      )}
      {!isStaff && tab === 'claims' && (
        <section className="panel">
          <h2>Klaim Saya</h2>
          <StudentClaims claims={myClaims} publicItems={publicItems} />
        </section>
      )}
    </main>
  );
}
