'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, BENTUK_LABEL, LEVEL_LABEL } from '@/lib/client';
import { Loading, Empty, Modal, Toast } from '@/components/ui';
import QuestionRenderer from '@/components/QuestionRenderer';

const BENTUK = ['PG', 'BS', 'MENJODOKAN', 'ESSAY'];
const LEVEL = ['L1', 'L2', 'L3'];
const kosong = () => ({ id: null, tipe: 'PG', pertanyaan: '', gambar: '', opsi: ['', '', '', ''], kunci: '', kiri: ['', ''], kanan: ['', '', ''], kunciPoin: '', skor: 10, level: 'L1', kisiId: '', kisiItemId: '' });

/** Kompres gambar di sisi browser → data URI JPEG kecil (aman untuk Google Sheets) */
function fileToDataUri(file, maxDim = 480, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const skala = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * skala);
        canvas.height = Math.round(img.height * skala);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BankSoal() {
  const sp = useSearchParams();
  const [soal, setSoal] = useState(null);
  const [kisi, setKisi] = useState([]);
  const [fKisi, setFKisi] = useState(sp.get('kisiId') || '');
  const [fTipe, setFTipe] = useState('');
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [preview, setPreview] = useState(false);
  const [modalImport, setModalImport] = useState(false);
  const [importKisi, setImportKisi] = useState('');
  const [importRes, setImportRes] = useState(null);
  const fileRef = useRef(null);

  async function pilihFileGambar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setMsg({ text: 'File harus berupa gambar', err: true });
    try {
      const dataUri = await fileToDataUri(file);
      setForm((f) => ({ ...f, gambar: dataUri }));
    } catch {
      setMsg({ text: 'Gagal membaca gambar', err: true });
    }
    e.target.value = '';
  }


  const load = useCallback(async () => {
    const qs = new URLSearchParams();
    if (fKisi) qs.set('kisiId', fKisi);
    if (fTipe) qs.set('tipe', fTipe);
    const j = await api('/api/soal?' + qs.toString());
    setSoal(j.soal);
  }, [fKisi, fTipe]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api('/api/kisi').then((j) => setKisi(j.kisi)).catch(() => {}); }, []);

  const kisiAktif = kisi.find((k) => k.id === fKisi) || null;

  function itemTerkait() {
    if (!kisiAktif) return [];
    return kisiAktif.items || [];
  }

  async function simpan(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        ...form,
        opsi: form.tipe === 'PG' ? form.opsi.filter((o) => o.trim()) : null,
        kiri: form.tipe === 'MENJODOKAN' ? form.kiri.filter((o) => o.trim()) : null,
        kanan: form.tipe === 'MENJODOKAN' ? form.kanan.filter((o) => o.trim()) : null,
      };
      if (body.id) await api('/api/soal?id=' + body.id, { method: 'PUT', body });
      else await api('/api/soal', { method: 'POST', body });
      setForm(null);
      setPreview(false);
      setMsg({ text: 'Soal tersimpan ✅' });
      await load();
    } catch (err) { setMsg({ text: err.message, err: true }); }
    setBusy(false);
  }

  async function hapus(s) {
    if (!confirm('Hapus soal ini? Soal juga dilepas dari paket asesmen.')) return;
    await api('/api/soal?id=' + s.id, { method: 'DELETE' });
    setMsg({ text: 'Soal dihapus' });
    await load();
  }

  function edit(s) {
    const f = { ...kosong(), ...s };
    if (s.tipe === 'PG') f.opsi = [...(s.opsi || ['', '', '', ''])];
    if (s.tipe === 'MENJODOKAN') { f.kiri = [...(s.kiri || ['', ''])]; f.kanan = [...(s.kanan || ['', '', ''])]; }
    setForm(f);
  }

  if (!soal) return <div className="content"><Loading /></div>;

  return (
    <div className="content">
      <div className="row spread mb">
        <div>
          <h1>Bank Soal</h1>
          <p className="muted small">Soal tertaut ke indikator kisi-kisi → nilai otomatis bisa dianalisis per indikator/CP.</p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => { setImportRes(null); setModalImport(true); }}>📤 Import Excel</button>
          <button className="btn primary" onClick={() => { setForm(kosong()); }}>+ Soal Baru</button>
        </div>
      </div>

      <div className="row mb">
        <select className="sel" style={{ maxWidth: 300 }} value={fKisi} onChange={(e) => setFKisi(e.target.value)}>
          <option value="">Semua kisi-kisi</option>
          {kisi.map((k) => <option key={k.id} value={k.id}>{k.judul}</option>)}
        </select>
        <select className="sel" style={{ maxWidth: 200 }} value={fTipe} onChange={(e) => setFTipe(e.target.value)}>
          <option value="">Semua bentuk soal</option>
          {BENTUK.map((b) => <option key={b} value={b}>{BENTUK_LABEL[b]}</option>)}
        </select>
        <span className="pill">{soal.length} soal</span>
      </div>

      {soal.length === 0 ? (
        <div className="card"><div className="bd"><Empty icon="🗃️" text="Belum ada soal pada filter ini. Klik “Soal Baru” untuk menulis soal pertama." /></div></div>
      ) : (
        <div className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Soal</th><th>Bentuk</th><th>Level</th><th>Skor</th><th>Indikator Kisi</th><th className="right">Aksi</th></tr></thead>
              <tbody>
                {soal.map((s) => {
                  const item = kisi.find((k) => k.id === s.kisiId)?.items?.find((it) => it.id === s.kisiItemId);
                  return (
                    <tr key={s.id}>
                      <td style={{ maxWidth: 380 }}><b>{s.pertanyaan.slice(0, 90)}{s.pertanyaan.length > 90 ? '…' : ''}</b></td>
                      <td><span className="badge b-violet">{BENTUK_LABEL[s.tipe]}</span></td>
                      <td>{LEVEL_LABEL[s.level] || s.level}</td>
                      <td>{s.skor}</td>
                      <td className="muted small" style={{ maxWidth: 200 }}>{item ? item.indikator.slice(0, 70) + (item.indikator.length > 70 ? '…' : '') : '—'}</td>
                      <td className="aksi">
                        <button className="btn sm" onClick={() => { edit(s); setTimeout(() => setPreview(true), 0); }}>👁</button>
                        <button className="btn sm" onClick={() => edit(s)}>✏️</button>
                        <button className="btn danger sm" onClick={() => hapus(s)}>🗑</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {form && (
        <Modal wide title={form.id ? 'Edit Soal' : 'Soal Baru'} onClose={() => { setForm(null); setPreview(false); }}>
          <form onSubmit={simpan}>
            <div className="grid2">
              <div className="field"><label className="lbl">Bentuk soal</label>
                <select className="sel" value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value, kunci: e.target.value === 'BS' ? 'BENAR' : '' })}>
                  {BENTUK.map((b) => <option key={b} value={b}>{BENTUK_LABEL[b]}</option>)}
                </select>
              </div>
              <div className="field"><label className="lbl">Level kognitif</label>
                <select className="sel" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  {LEVEL.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label className="lbl">Pertanyaan / pernyataan *</label>
              <textarea className="ta" required value={form.pertanyaan} onChange={(e) => setForm({ ...form, pertanyaan: e.target.value })} placeholder="Tulis pertanyaan…" />
            </div>

            <div className="field"><label className="lbl">Gambar soal (opsional — untuk soal bergambar)</label>
              <div className="row">
                <input className="inp" style={{ flex: 1, minWidth: 220 }} placeholder="Tempel URL gambar, atau unggah di samping →" value={form.gambar || ''} onChange={(e) => setForm({ ...form, gambar: e.target.value })} />
                <label className="btn sm" style={{ cursor: 'pointer' }}>
                  🖼️ Unggah
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={pilihFileGambar} />
                </label>
                {!!form.gambar && <button type="button" className="btn danger sm" onClick={() => setForm({ ...form, gambar: '' })}>Hapus gambar</button>}
              </div>
              {!!form.gambar && (
                <img src={form.gambar} alt="preview gambar soal" style={{ maxWidth: '100%', maxHeight: 180, marginTop: 8, borderRadius: 10, border: '1px solid var(--line)' }} />
              )}
              <p className="muted small" style={{ marginBottom: 0 }}>Unggahan dikompres otomatis (±480px) sehingga tetap kecil dan aman untuk Google Sheets. Cocok untuk soal bergambar jenjang SD.</p>
            </div>

            {form.tipe === 'PG' && (
              <div className="field">
                <label className="lbl">Opsi jawaban — klik ⭕ untuk menandai kunci</label>
                {form.opsi.map((op, i) => (
                  <div className="row mb" key={i}>
                    <input type="radio" name="kunci" checked={form.kunci === String.fromCharCode(65 + i)} onChange={() => setForm({ ...form, kunci: String.fromCharCode(65 + i) })} title="Tandai sebagai kunci" />
                    <span className="pill">{String.fromCharCode(65 + i)}</span>
                    <input className="inp" value={op} onChange={(e) => setForm({ ...form, opsi: form.opsi.map((o, j) => (j === i ? e.target.value : o)) })} placeholder={`Opsi ${String.fromCharCode(65 + i)}`} />
                    <button type="button" className="btn ghost sm" onClick={() => setForm({ ...form, opsi: form.opsi.filter((_, j) => j !== i) })}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn sm" onClick={() => setForm({ ...form, opsi: [...form.opsi, ''] })}>+ Opsi</button>
              </div>
            )}

            {form.tipe === 'BS' && (
              <div className="field"><label className="lbl">Kunci jawaban</label>
                <select className="sel" value={form.kunci} onChange={(e) => setForm({ ...form, kunci: e.target.value })}>
                  <option value="BENAR">BENAR</option>
                  <option value="SALAH">SALAH</option>
                </select>
              </div>
            )}

            {form.tipe === 'MENJODOKAN' && (
              <div className="grid2">
                <div className="field">
                  <label className="lbl">Pernyataan kiri (urutan = kunci)</label>
                  {form.kiri.map((k, i) => (
                    <div className="row mb" key={i}>
                      <span className="pill">{i + 1}</span>
                      <input className="inp" value={k} onChange={(e) => setForm({ ...form, kiri: form.kiri.map((o, j) => (j === i ? e.target.value : o)) })} placeholder={`Pernyataan ${i + 1}`} />
                    </div>
                  ))}
                  <button type="button" className="btn sm" onClick={() => setForm({ ...form, kiri: [...form.kiri, ''] })}>+ Baris kiri</button>
                </div>
                <div className="field">
                  <label className="lbl">Pilihan kanan (pasangan ke-n cocok urutan kiri; tambahkan pengecoh)</label>
                  {form.kanan.map((k, i) => (
                    <div className="row mb" key={i}>
                      <span className="pill">{String.fromCharCode(65 + i)}</span>
                      <input className="inp" value={k} onChange={(e) => setForm({ ...form, kanan: form.kanan.map((o, j) => (j === i ? e.target.value : o)) })} placeholder={`Pilihan ${String.fromCharCode(65 + i)}`} />
                    </div>
                  ))}
                  <button type="button" className="btn sm" onClick={() => setForm({ ...form, kanan: [...form.kanan, ''] })}>+ Pilihan kanan</button>
                </div>
              </div>
            )}

            {form.tipe === 'ESSAY' && (
              <div className="field"><label className="lbl">Rubrik / kunci poin (bantu guru mengoreksi)</label>
                <textarea className="ta" value={form.kunciPoin} onChange={(e) => setForm({ ...form, kunciPoin: e.target.value })} placeholder="mis. Model matematis benar (5), proses perhitungan (6), kesimpulan (4)" />
              </div>
            )}

            <div className="grid2">
              <div className="field"><label className="lbl">Skor maksimal</label><input className="inp" type="number" min="1" value={form.skor} onChange={(e) => setForm({ ...form, skor: e.target.value })} /></div>
              <div className="field"><label className="lbl">Indikator kisi-kisi (opsional tapi disarankan)</label>
                <select className="sel" value={form.kisiItemId} onChange={(e) => {
                  const item = kisi.flatMap((k) => k.items.map((it) => ({ k, it }))).find((x) => x.it.id === e.target.value);
                  setForm({ ...form, kisiItemId: e.target.value, kisiId: item?.k.id || '' });
                }}>
                  <option value="">— tanpa indikator —</option>
                  {kisi.flatMap((k) => k.items.map((it) => (
                    <option key={it.id} value={it.id}>{k.judul.slice(0, 24)}… · {it.indikator.slice(0, 60)}</option>
                  )))}
                </select>
              </div>
            </div>

            <div className="row spread">
              <button className="btn" type="button" onClick={() => setPreview(!preview)}>{preview ? '🙈 Tutup Preview' : '👁 Preview tampilan siswa'}</button>
              <div className="row">
                <button type="button" className="btn" onClick={() => { setForm(null); setPreview(false); }}>Batal</button>
                <button className="btn primary" disabled={busy}>{busy ? 'Menyimpan…' : '💾 Simpan Soal'}</button>
              </div>
            </div>

            {preview && (
              <div className="qcard mt">
                <b><span className="no">P</span>{form.pertanyaan || '(pertanyaan kosong)'}</b>
                <div className="mt">
                  <QuestionRenderer
                    soal={{
                      tipe: form.tipe,
                      gambar: form.gambar,
                      opsi: form.opsi,
                      kiri: form.kiri,
                      kanan: form.kanan,
                    }}
                    nilai={null}
                    onChange={() => {}}
                  />
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}

      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
