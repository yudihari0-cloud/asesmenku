'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, fmtDate } from '@/lib/client';
import { Loading, Empty, Modal, Toast } from '@/components/ui';

export default function KelasPage() {
  const [kelas, setKelas] = useState([]);
  const [pilih, setPilih] = useState(null);
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalKelas, setModalKelas] = useState(false);
  const [modalSiswa, setModalSiswa] = useState(false);
  const [formKelas, setFormKelas] = useState({ nama: '', tingkat: 8, fase: 'D' });
  const [formSiswa, setFormSiswa] = useState({ nama: '', nisn: '', wa: '' });
  const [importRes, setImportRes] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    const k = await api('/api/kelas');
    setKelas(k.kelas);
    if (!k.kelas.find((x) => x.id === pilih)) setPilih(k.kelas[0]?.id || null);
    setLoading(false);
  }, [pilih]);

  const loadSiswa = useCallback(async (kelasId) => {
    if (!kelasId) return setSiswa([]);
    const s = await api('/api/siswa?kelasId=' + kelasId);
    setSiswa(s.siswa);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadSiswa(pilih); }, [pilih, loadSiswa]);

  async function simpanKelas(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/kelas', { method: 'POST', body: formKelas });
      setModalKelas(false);
      setFormKelas({ nama: '', tingkat: 8, fase: 'D' });
      setMsg({ text: 'Kelas ditambahkan ✅' });
      await load();
    } catch (err) { setMsg({ text: err.message, err: true }); }
    setBusy(false);
  }

  async function tambahSiswa(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/siswa', { method: 'POST', body: { ...formSiswa, kelasId: pilih } });
      setFormSiswa({ nama: '', nisn: '' });
      setMsg({ text: 'Siswa ditambahkan — password awal: 123456' });
      await loadSiswa(pilih);
      await load();
    } catch (err) { setMsg({ text: err.message, err: true }); }
    setBusy(false);
  }

  async function hapusSiswa(s) {
    if (!confirm(`Hapus siswa "${s.nama}"?`)) return;
    await api('/api/siswa?id=' + s.id, { method: 'DELETE' });
    setMsg({ text: 'Siswa dihapus' });
    await loadSiswa(pilih);
    await load();
  }

  async function hapusKelas(k) {
    if (!confirm(`Hapus kelas "${k.nama}"? Siswa tidak ikut terhapus.`)) return;
    try {
      await api('/api/kelas?id=' + k.id, { method: 'DELETE' });
      setMsg({ text: 'Kelas dihapus' });
      await load();
    } catch (err) { setMsg({ text: err.message, err: true }); }
  }

  async function doImport(e) {
    e.preventDefault();
    const f = fileRef.current?.files?.[0];
    if (!f) return setMsg({ text: 'Pilih file Excel dulu', err: true });
    setBusy(true);
    const fd = new FormData();
    fd.append('file', f);
    try {
      const r = await fetch('/api/siswa/import', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setImportRes(j);
      setMsg({ text: `Import selesai: ${j.created} siswa baru ✅` });
      await load();
      await loadSiswa(pilih);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) { setMsg({ text: err.message, err: true }); }
    setBusy(false);
  }

  if (loading) return <div className="content"><Loading /></div>;

  return (
    <div className="content">
      <div className="row spread mb">
        <div>
          <h1>Kelas & Siswa</h1>
          <p className="muted small">Tambah siswa otomatis: unduh template Excel → isi → unggah. Akun & password awal dibuat otomatis.</p>
        </div>
        <div className="row">
          <a className="btn" href="/api/template" download>⬇️ Unduh Template Excel</a>
          <button className="btn primary" onClick={() => setModalKelas(true)}>+ Kelas Baru</button>
        </div>
      </div>

      <div className="card card-p mb">
        <form onSubmit={doImport} className="row">
          <b className="small">📤 Import siswa dari Excel:</b>
          <input type="file" accept=".xlsx,.xls" ref={fileRef} className="inp" style={{ maxWidth: 320 }} />
          <button className="btn primary" disabled={busy}>{busy ? 'Memproses…' : 'Unggah & Import'}</button>
        </form>
        {importRes && (
          <div className="mt small">
            <b>{importRes.created}</b> siswa dibuat.
            {!!importRes.kelasBaru?.length && <> Kelas baru: <b>{importRes.kelasBaru.join(', ')}</b>.</>}
            {!!importRes.skipped?.length && (
              <details className="mt"><summary className="muted">{importRes.skipped.length} baris dilewati (lihat detail)</summary>
                <ul className="muted">{importRes.skipped.map((s, i) => <li key={i}>{s.nama} — {s.alasan}</li>)}</ul>
              </details>
            )}
          </div>
        )}
      </div>

      <div className="row mb" style={{ gap: 8 }}>
        {kelas.map((k) => (
          <button key={k.id} className={`btn ${pilih === k.id ? 'primary' : ''}`} onClick={() => setPilih(k.id)}>
            {k.nama} <span className="pill">{k.jumlahSiswa}</span>
          </button>
        ))}
        {kelas.length === 0 && <span className="muted small">Belum ada kelas — buat dulu atau langsung import (kelas dibuat otomatis).</span>}
      </div>

      <div className="card">
        <div className="hd">
          <h3>👥 Daftar Siswa {kelas.find((k) => k.id === pilih)?.nama ? `— ${kelas.find((k) => k.id === pilih)?.nama}` : ''}</h3>
          <div className="row">
            <button className="btn sm" disabled={!pilih} onClick={() => setModalSiswa(true)}>+ Siswa</button>
            <button className="btn danger sm" disabled={!pilih} onClick={() => hapusKelas(kelas.find((k) => k.id === pilih))}>🗑 Hapus Kelas</button>
          </div>
        </div>
        {siswa.length === 0 ? (
          <div className="bd"><Empty icon="🧑‍🎓" text="Belum ada siswa di kelas ini. Gunakan import Excel atau tombol + Siswa." /></div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>#</th><th>Nama</th><th>NISN / Username</th><th>No. WA</th><th>Password Awal</th><th>Terdaftar</th><th className="right">Aksi</th></tr></thead>
              <tbody>
                {siswa.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td><b>{s.nama}</b></td>
                    <td className="mono">{s.nisn}</td>
                    <td className="small">{s.wa ? '+' + s.wa : <span className="muted">—</span>}</td>
                    <td><span className="badge b-gray mono">123456</span></td>
                    <td className="muted small">{fmtDate(s.createdAt)}</td>
                    <td className="aksi">
                      <Link className="btn sm" href={`/guru/rapor/${s.id}`}>📊 Rapor</Link>
                      <button className="btn danger sm" onClick={() => hapusSiswa(s)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalKelas && (
        <Modal title="Kelas Baru" onClose={() => setModalKelas(false)}>
          <form onSubmit={simpanKelas}>
            <div className="field"><label className="lbl">Nama kelas</label><input className="inp" required value={formKelas.nama} onChange={(e) => setFormKelas({ ...formKelas, nama: e.target.value })} placeholder="mis. VIII-A" /></div>
            <div className="grid2">
              <div className="field"><label className="lbl">Tingkat</label><input className="inp" type="number" value={formKelas.tingkat} onChange={(e) => setFormKelas({ ...formKelas, tingkat: e.target.value })} /></div>
              <div className="field"><label className="lbl">Fase</label>
                <select className="sel" value={formKelas.fase} onChange={(e) => setFormKelas({ ...formKelas, fase: e.target.value })}>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <button className="btn primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan Kelas'}</button>
          </form>
        </Modal>
      )}

      {modalSiswa && (
        <Modal title="Tambah Siswa" onClose={() => setModalSiswa(false)}>
          <form onSubmit={tambahSiswa}>
            <div className="field"><label className="lbl">Nama lengkap</label><input className="inp" required value={formSiswa.nama} onChange={(e) => setFormSiswa({ ...formSiswa, nama: e.target.value })} /></div>
            <div className="field"><label className="lbl">NISN (dipakai sebagai username login)</label><input className="inp mono" required value={formSiswa.nisn} onChange={(e) => setFormSiswa({ ...formSiswa, nisn: e.target.value })} placeholder="mis. 0091234599" /></div>
            <div className="field"><label className="lbl">No. WhatsApp (opsional — untuk kirim pengumuman ujian)</label><input className="inp" value={formSiswa.wa || ''} onChange={(e) => setFormSiswa({ ...formSiswa, wa: e.target.value })} placeholder="mis. 081234567890" /></div>
            <p className="muted small">Password awal otomatis <b>123456</b>.</p>
            <button className="btn primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan Siswa'}</button>
          </form>
        </Modal>
      )}

      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
