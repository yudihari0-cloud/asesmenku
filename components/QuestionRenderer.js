'use client';

/**
 * Renderer soal untuk siswa mengerjakan (dan preview guru).
 * - PG: pilih opsi (huruf A/B/C/D/E)
 * - BS: dua tombol besar BENAR / SALAH
 * - MENJODOKAN: dropdown per item kiri (opsi kanan sudah diacak server)
 * - ESSAY: textarea
 * - Semua tipe mendukung gambar (soal.gambar = URL atau data URI)
 */
function Gambar({ src }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt="gambar soal"
      style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 12, border: '1px solid var(--line)', marginBottom: 12, display: 'block' }}
    />
  );
}

export default function QuestionRenderer({ soal, nilai, onChange, kanan = null, kananIds = null }) {
  if (soal.tipe === 'PG') {
    return (
      <div>
        <Gambar src={soal.gambar} />
        {(soal.opsi || []).map((op, i) => {
          const huruf = String.fromCharCode(65 + i);
          return (
            <div key={i} className={`opt ${nilai === huruf ? 'sel' : ''}`} onClick={() => onChange(huruf)}>
              <span className="huruf">{huruf}</span>
              <span>{op}</span>
            </div>
          );
        })}
      </div>
    );
  }
  if (soal.tipe === 'BS') {
    return (
      <div>
        <Gambar src={soal.gambar} />
        <div className="row">
          {['BENAR', 'SALAH'].map((v) => (
            <div key={v} className={`opt ${nilai === v ? 'sel' : ''}`} style={{ flex: 1, minWidth: 140 }} onClick={() => onChange(v)}>
              <span className="huruf">{v === 'BENAR' ? '✔' : '✘'}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (soal.tipe === 'MENJODOKAN') {
    const kiri = soal.kiri || [];
    const kananArr = kanan || soal.kanan || [];
    const val = nilai || {};
    return (
      <div>
        <Gambar src={soal.gambar} />
        <p className="muted small mb">Pilih pasangan yang tepat untuk setiap pernyataan di kolom kiri.</p>
        {kiri.map((k, i) => (
          <div key={i} className="row mb" style={{ alignItems: 'stretch' }}>
            <div className="card card-p" style={{ flex: 1, padding: '10px 12px' }}>
              <span className="pill" style={{ marginRight: 6 }}>{i + 1}</span> {k}
            </div>
            <select
              className="sel"
              style={{ flex: 1, minWidth: 180 }}
              value={val['p' + i] || ''}
              onChange={(e) => onChange({ ...val, ['p' + i]: e.target.value })}
            >
              <option value="">— pilih pasangan —</option>
              {kananArr.map((op, j) => (
                <option key={j} value={'p' + (kananIds ? kananIds[j] : j)}>{op}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }
  // ESSAY
  return (
    <div>
      <Gambar src={soal.gambar} />
      <textarea
        className="ta"
        style={{ minHeight: 150 }}
        placeholder="Tulis jawabanmu di sini…"
        value={nilai || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
