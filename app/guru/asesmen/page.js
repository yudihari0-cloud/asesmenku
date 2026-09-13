'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, fmtDate } from '@/lib/client';
import { Loading, Empty, Modal, Toast, StatusBadge } from '@/components/ui';

export default function AsesmenList() {
  const [list, setList] = useState(null);
  const [kisi, setKisi] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [f, setF] = useState({ judul: '', kisiId: '', kelasIds: [], durasiMenit: 60, token: '', kktp: 75, acakSoal: true, tampilkanHasil: true });

  useEffect(() => {
    Promise.all([api('/api/asesmen'), api('/api/kisi'), api('/api/kelas')])
      .then(([a, k, kl]) => { setList(a.asesmen); setKisi(k.kisi); setKelas(kl.kelas); })
      .catch((e) => setMsg({ text: e.message, err: true }));
  }, []);

  async function buat(e) {
    e.preventDefault();
    if (!f.kelasIds.length) return setMsg({ text: 'Pilih minimal satu kelas sasaran', err: true });
    setBusy(true);
    try {
      const j = await api('/api/asesmen', { method: 'POST', body: f });
      window.location.href = '/guru/asesmen/' + j.asesmen.id;
    } catch (err) { setMsg({ text: err.message, err: true }); setBusy(false); }
  }

  function toggleKelas(idv) {
    setF((f) => ({ ...f, kelasIds: f.kelasIds.includes(idv) ? f.kelasIds.filter((x) => x !== idv) : [...f.kelasIds, idv] }));
  }

  if (!list) return <div className="content"><Loading /></div>;

  return (
    <div className="content">
      <div className="row spread mb">
        <div>
          <h1>Asesmen & Hasil</h1>
          <p className="muted small">Buat asesmen dari kisi-kisi, bagikan link, pantau nilai otomatis.</p>
        </div>
        <button className="btn primary" onClick={() => setModal(true)}>+ Asesmen Baru</button>
      </div>

      {list.length === 0 ? (
        <div className="card"><div className="bd"><Empty icon="🚀" text="Belum ada asesmen. Buat dari kisi-kisi yang sudah siap." /></div></div>
      ) : (
        <div className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Judul</th><th>Token</th><th>Status</th><th>Soal</th><th>Peserta</th><th>Rata²</th><th>KKTP</th><th>Dibuka s/d</th><th className="right">Aksi</th></tr></thead>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id}>
                    <td style={{ maxWidth: 260 }}><b>{a.judul}</b><div className="muted small">{a.kisiJudul}</div></td>
                    <td><span className="badge b-violet mono">{a.token}</span></td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>{a.jumlahSoal}</td>
                    <td>{a.jumlahPeserta}</td>
                    <td><b>{a.rataSkor ?? '—'}</b></td>
                    <td>{a.kktp}</td>
                    <td className="muted small">{fmtDate(a.tutup)}</td>
                    <td className="aksi">
                      <Link className="btn sm primary" href={`/guru/asesmen/${a.id}`}>Kelola</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <Modal wide title="Asesmen Baru" onClose={() => setModal(false)}>
          <form onSubmit={buat}>
            <div className="field"><label className="lbl">Judul asesmen *</label>
              <input className="inp" required value={f.judul} onChange={(e) => setF({ ...f, judul: e.target.value })} placeholder="mis. Sumatif Tengah Semester — Matematika VIII" />
            </div>
            <div className="field"><label className="lbl">Kisi-kisi sumber *</label>
              <select className="sel" required value={f.kisiId} onChange={(e) => setF({ ...f, kisiId: e.target.value })}>
                <option value="">— pilih kisi-kisi —</option>
                {kisi.map((k) => <option key={k.id} value={k.id}>{k.judul} ({k.items.reduce((a, b) => a + b.jumlah, 0)} soal direncanakan)</option>)}
              </select>
              <p className="muted small" style={{ marginBottom: 0 }}>Paket soal akan disusun otomatis dari bank soal sesuai jumlah & bentuk tiap indikator. Bisa disusun ulang kapan saja.</p>
            </div>
            <div className="field"><label className="lbl">Kelas sasaran *</label>
              <div className="row">
                {kelas.map((k) => (
                  <label key={k.id} className={`opt ${f.kelasIds.includes(k.id) ? 'sel' : ''}`} style={{ marginBottom: 0, cursor: 'pointer' }}>
                    <input type="checkbox" checked={f.kelasIds.includes(k.id)} onChange={() => toggleKelas(k.id)} />
                    <b>{k.nama}</b> <span className="muted small">({k.jumlahSiswa} siswa)</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid3">
              <div className="field"><label className="lbl">Durasi (menit)</label><input className="inp" type="number" min="5" value={f.durasiMenit} onChange={(e) => setF({ ...f, durasiMenit: e.target.value })} /></div>
              <div className="field"><label className="lbl">Token (kosong = otomatis)</label><input className="inp mono" value={f.token} onChange={(e) => setF({ ...f, token: e.target.value })} placeholder="OTOMATIS" /></div>
              <div className="field"><label className="lbl">KKTP (batas tuntas)</label><input className="inp" type="number" min="0" max="100" value={f.kktp} onChange={(e) => setF({ ...f, kktp: e.target.value })} /></div>
            </div>
            <div className="row mb">
              <label className="row small" style={{ gap: 6 }}><input type="checkbox" checked={f.acakSoal} onChange={(e) => setF({ ...f, acakSoal: e.target.checked })} /> Acak urutan soal per siswa</label>
              <label className="row small" style={{ gap: 6 }}><input type="checkbox" checked={f.tampilkanHasil} onChange={(e) => setF({ ...f, tampilkanHasil: e.target.checked })} /> Tampilkan skor ke siswa setelah selesai</label>
            </div>
            <button className="btn primary" disabled={busy}>{busy ? 'Menyusun paket soal…' : '🚀 Buat Asesmen'}</button>
          </form>
        </Modal>
      )}

      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
