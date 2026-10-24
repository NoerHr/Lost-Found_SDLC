import { useState } from 'react';
import { VERIFICATION } from '../data/constants.js';

// US8 / R11: petugas menyiapkan 3-5 pertanyaan verifikasi untuk barang bernilai tinggi (P10 A7).
export default function VerificationQuestions({ item, locked, onSave }) {
  const [questions, setQuestions] = useState(() => {
    const base = [...(item.verificationQuestions ?? [])];
    while (base.length < VERIFICATION.MIN_QUESTIONS) base.push('');
    return base;
  });
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const change = (index, value) => setQuestions((current) => current.map((q, i) => (i === index ? value : q)));
  const remove = (index) => setQuestions((current) => current.filter((_, i) => i !== index));
  const add = () => setQuestions((current) => [...current, '']);

  function handleSave() {
    const result = onSave(item.id, questions);
    setFeedback(
      result.ok
        ? { type: 'success', text: 'Pertanyaan verifikasi tersimpan.' }
        : { type: 'error', text: result.errors?.questions ?? result.error },
    );
  }

  return (
    <section className="secondary-section" aria-label="Pertanyaan verifikasi">
      <h3>Pertanyaan verifikasi (barang bernilai tinggi)</h3>
      <p className="helper-text">
        Siapkan {VERIFICATION.MIN_QUESTIONS}-{VERIFICATION.MAX_QUESTIONS} pertanyaan. Pengklaim menjawab dengan teks bebas atau “Tidak ingat”.
        {locked && ' Tidak dapat diubah selama masih ada klaim aktif.'}
      </p>
      {feedback.text && <p className={feedback.type === 'error' ? 'form-error' : 'form-success'} role="alert">{feedback.text}</p>}
      <div className="form compact">
        {questions.map((question, index) => (
          <div className="question-row" key={index}>
            <input
              aria-label={`Pertanyaan ${index + 1}`}
              value={question}
              disabled={locked}
              placeholder={`Pertanyaan ${index + 1}`}
              onChange={(e) => change(index, e.target.value)}
            />
            {questions.length > VERIFICATION.MIN_QUESTIONS && !locked && (
              <button className="secondary-button" type="button" onClick={() => remove(index)}>Hapus</button>
            )}
          </div>
        ))}
        <div className="action-row">
          {questions.length < VERIFICATION.MAX_QUESTIONS && (
            <button className="secondary-button" type="button" disabled={locked} onClick={add}>Tambah pertanyaan</button>
          )}
          <button className="primary-button" type="button" disabled={locked} onClick={handleSave}>Simpan Pertanyaan</button>
        </div>
      </div>
    </section>
  );
}
