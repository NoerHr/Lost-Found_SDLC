import { useState } from 'react';
import Field from './Field.jsx';

// Pengajuan klaim. Mahasiswa: nama dari header (askName = false). Petugas: klaim langsung di pos (askName = true).
// US8: untuk barang bernilai tinggi, pengklaim menjawab pertanyaan verifikasi yang disiapkan petugas (P10 R11).
export default function ClaimForm({ onSubmit, askName = false, highValue = false, questions = [] }) {
  const emptyAnswers = () => questions.map(() => ({ answer: '', dontRemember: false }));
  const [form, setForm] = useState({ claimantName: '', proofNotes: '' });
  const [answers, setAnswers] = useState(emptyAnswers);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const needsQuestions = highValue && questions.length === 0;

  function updateAnswer(index, changes) {
    setAnswers((current) => current.map((entry, i) => (i === index ? { ...entry, ...changes } : entry)));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = onSubmit({ ...form, answers });
    if (result.ok) {
      setForm({ claimantName: '', proofNotes: '' });
      setAnswers(emptyAnswers());
      setErrors({});
      setMessage({
        type: 'success',
        text: result.claim.claimCode
          ? `Klaim terkirim. Kode klaim: ${result.claim.claimCode}. Sebutkan kode ini ke petugas saat verifikasi.`
          : 'Klaim terkirim. Petugas akan memverifikasi bukti kepemilikan.',
      });
    } else {
      setErrors(result.errors ?? {});
      setMessage({ type: 'error', text: result.error });
    }
  }

  return (
    <form className="form compact" onSubmit={handleSubmit} noValidate>
      <h3>{askName ? 'Catat klaim langsung (di pos)' : 'Ajukan klaim barang ini'}</h3>
      {highValue && (
        <p className="notice warning">
          Barang bernilai tinggi: jawab pertanyaan verifikasi di bawah. Jawaban online hanya dapat dikirim satu kali, dan barang baru
          diserahkan setelah petugas memverifikasi secara tatap muka.
        </p>
      )}
      {needsQuestions && (
        <p className="notice neutral">
          {askName
            ? 'Siapkan pertanyaan verifikasi di bagian “Pertanyaan verifikasi” di atas sebelum mencatat klaim.'
            : 'Petugas belum menyiapkan pertanyaan verifikasi untuk barang ini. Silakan datang ke pos security.'}
        </p>
      )}
      {message.text && <p className={message.type === 'error' ? 'form-error' : 'form-success'} role="alert">{message.text}</p>}
      {askName && (
        <Field id="cf-name" label="Nama pengklaim *" error={errors.claimantName}>
          <input id="cf-name" value={form.claimantName} onChange={(e) => setForm({ ...form, claimantName: e.target.value })} />
        </Field>
      )}
      {!askName && errors.claimantName && <p className="field-error" role="alert">{errors.claimantName}</p>}
      <Field id="cf-proof" label="Ciri-ciri / isi barang (bukti kepemilikan) *" error={errors.proofNotes} hint="mis. isi dompet, ciri khusus yang tidak mudah diketahui orang lain.">
        <textarea id="cf-proof" rows={3} value={form.proofNotes} onChange={(e) => setForm({ ...form, proofNotes: e.target.value })} />
      </Field>

      {highValue && questions.length > 0 && (
        <fieldset className="secondary-section">
          <legend>Pertanyaan verifikasi *</legend>
          <ul className="qa-list">
            {questions.map((question, index) => (
              <li className="qa-item" key={question}>
                <p className="qa-question">{index + 1}. {question}</p>
                <textarea
                  rows={2}
                  aria-label={`Jawaban pertanyaan ${index + 1}`}
                  value={answers[index]?.answer ?? ''}
                  disabled={answers[index]?.dontRemember}
                  onChange={(e) => updateAnswer(index, { answer: e.target.value })}
                />
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={answers[index]?.dontRemember ?? false}
                    onChange={(e) => updateAnswer(index, { dontRemember: e.target.checked, answer: e.target.checked ? '' : answers[index]?.answer ?? '' })}
                  />
                  <span>Tidak ingat</span>
                </label>
              </li>
            ))}
          </ul>
          {errors.answers && <p className="field-error" role="alert">{errors.answers}</p>}
        </fieldset>
      )}

      <button className="primary-button" type="submit" disabled={needsQuestions}>{askName ? 'Catat Klaim' : 'Kirim Klaim'}</button>
    </form>
  );
}
