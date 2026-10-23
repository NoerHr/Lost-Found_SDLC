import { ROLES } from '../data/constants.js';

export default function RoleSwitch({ role, onChange }) {
  return (
    <div className="role-switch" role="group" aria-label="Pilih peran demo">
      <button type="button" className={role === ROLES.STAFF ? 'active' : ''} aria-pressed={role === ROLES.STAFF} onClick={() => onChange(ROLES.STAFF)}>
        Petugas Security
      </button>
      <button type="button" className={role === ROLES.STUDENT ? 'active' : ''} aria-pressed={role === ROLES.STUDENT} onClick={() => onChange(ROLES.STUDENT)}>
        Mahasiswa
      </button>
    </div>
  );
}
