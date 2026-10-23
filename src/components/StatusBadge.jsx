const successStatuses = new Set(['STORED', 'VERIFIED', 'APPROVED']);
const infoStatuses = new Set(['CLAIMED']);
const warningStatuses = new Set(['PENDING', 'HIGH_VALUE']);
const dangerStatuses = new Set(['REJECTED']);

const labels = {
  STORED: 'Tersimpan',
  CLAIMED: 'Ada klaim',
  VERIFIED: 'Terverifikasi',
  RETURNED: 'Dikembalikan',
  HIGH_VALUE: 'Bernilai tinggi',
  PENDING: 'Menunggu verifikasi',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};

function getTone(status) {
  if (successStatuses.has(status)) return 'success';
  if (infoStatuses.has(status)) return 'info';
  if (warningStatuses.has(status)) return 'warning';
  if (dangerStatuses.has(status)) return 'danger';
  return 'neutral';
}

export default function StatusBadge({ status }) {
  return <span className={`status-badge ${getTone(status)}`}>{labels[status] ?? status}</span>;
}
