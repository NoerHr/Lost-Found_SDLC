import { useState } from 'react';

export default function ResetControl({ onReset }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button className="secondary-button" type="button" onClick={() => setIsConfirming(true)}>
        Reset Data Demo
      </button>
    );
  }

  function confirmReset() {
    onReset();
    setIsConfirming(false);
  }

  return (
    <div className="reset-control" role="group" aria-label="Konfirmasi reset data demo">
      <span>Reset data demo?</span>
      <button className="secondary-button" type="button" onClick={() => setIsConfirming(false)}>
        Batal
      </button>
      <button className="primary-button" type="button" onClick={confirmReset}>
        Ya, Reset
      </button>
    </div>
  );
}
