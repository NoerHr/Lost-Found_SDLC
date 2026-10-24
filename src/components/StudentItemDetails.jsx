import { useState } from 'react';
import ClaimForm from './ClaimForm.jsx';

// US7: mahasiswa hanya melihat informasi publik. Rincian lengkap tidak pernah dikirim ke tampilan ini.
export default function StudentItemDetails({ item, studentName, onClaim }) {
  const [denied, setDenied] = useState(false);
  if (!item) return <div className="empty-state">Pilih barang untuk melihat informasi publik dan mengajukan klaim.</div>;

  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{item.id}</p>
          <h2>{item.category}</h2>
        </div>
      </div>
      <dl className="details-list">
        <dt>Tanggal ditemukan</dt><dd>{item.foundDate}</dd>
      </dl>
      <p className="notice neutral">
        Rincian lain disembunyikan agar tidak disalahgunakan untuk mengaku sebagai pemilik. Barang hanya diserahkan setelah petugas memverifikasi kepemilikan.
      </p>
      <button className="secondary-button" type="button" onClick={() => setDenied(true)}>Lihat rincian lengkap</button>
      {denied && <p className="form-error" role="alert">Akses ditolak: rincian lengkap hanya dapat dilihat petugas yang berwenang.</p>}

      <section className="secondary-section">
        <ClaimForm key={`${item.id}-${studentName}`} highValue={item.highValue} questions={item.verificationQuestions ?? []} onSubmit={(input) => onClaim(item.id, input)} />
      </section>
    </>
  );
}
