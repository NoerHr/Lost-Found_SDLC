import { formatDateTime } from '../utils/itemUtils.js';

// Rincian LENGKAP khusus petugas (US1 AC1.2): termasuk lokasi penyimpanan.
export default function SecurityItemDetails({ item }) {
  if (!item) return <div className="empty-state">Pilih catatan barang untuk melihat rinciannya.</div>;

  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{item.id}</p>
          <h2>{item.category}</h2>
        </div>
      </div>

      <dl className="details-list">
        <dt>Warna</dt><dd>{item.color || '-'}</dd>
        <dt>Merek</dt><dd>{item.brand || '-'}</dd>
        <dt>Deskripsi</dt><dd>{item.description}</dd>
        <dt>Lokasi ditemukan</dt><dd>{item.locationFound}</dd>
        <dt>Waktu ditemukan</dt><dd>{item.foundDate}{item.foundTime ? `, ${item.foundTime}` : ''}</dd>
        <dt>Diserahkan oleh</dt><dd>{item.handedOverBy}</dd>
        <dt>Lokasi penyimpanan</dt><dd>{item.storageLocation}</dd>
        <dt>Dicatat</dt><dd>{formatDateTime(item.recordedAt)}</dd>
      </dl>
    </>
  );
}
