'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, BENTUK_LABEL, LEVEL_LABEL } from '@/lib/client';
import { Loading, Toast } from '@/components/ui';

const BENTUK = ['PG', 'BS', 'MENJODOKAN', 'ESSAY'];
const LEVEL = ['L1', 'L2', 'L3'];
const KOSONG = { judul: '', mapel: '', fase: 'D', kelas: '', tp: '', items: [] };
const ITEM_BARU = () => ({ id: null, elemen: '', cpId: '', cpTeks: '', materi: '', indikator: '', level: 'L1', bentuk: 'PG', jumlah: 1, bobot: 10 });

export default function KisiEditor() {
  const { id: kid } = useParams();
  const router = useRouter();
  const isNew = kid === 'new';
  const [form, setForm] = useState(KOSONG);
  const [cp, setCp] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [load, setLoad] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api('/api/cp').then((j) => { setCp(j.cp); setMapelList(j.mapelList); }).catch(() => {});
    if (!isNew) {
      api('/api/kisi?id=' + kid)
        .then((j) => j.kisi && setForm({ ...j.kisi }))
        .catch((e) => setMsg({ text: e.message, err: true }))
        .finally(() => setLoad(false));
    }
  }, [kid, isNew]);

  const totalBobot = form.items.reduce((a, b) => a + (Number(b.bobot) || 0), 0);
  const totalSoal = form.items.reduce((a, b) => a + (Number(b.jumlah) || 0), 0);

  function ubahItem(i, field, val) {
    setForm((f) => {
      const items = f.items.map((it, j) => (j === i ? { ...it, [field]: val } : it));
      return { ...f, items };
    });
  }
  function pilihCp(i, cpId) {
    const c = cp.find((x) => x.id === cpId);
    setForm((f) => ({
      ...f,
      items: f.items.map((it, j) => (j === i ? { ...it, cpId, cpTeks: c?.teks || '', elemen: c?.elemen || it.elemen } : it)),
    }));
  }
  function tambahItem() { setForm((f) => ({ ...f, items: [...f.items, ITEM_BARU()] })); }
  function hapusItem(i) { setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) })); }

  async function simpan(e) {
    e.preventDefault();
    if (totalBobot !== 100 && !confirm(`Total bobot saat ini ${totalBobot} (idealnya 100). Lanjutkan menyimpan?`)) return;
    setBusy(true);
    try {
      const body = { ...form, items: form.items.map((it) => ({ ...it, jumlah: Number(it.jumlah), bobot: Number(it.bobot) })) };
      if (isNew) {
        const j = await api('/api/kisi', { method: 'POST', body });
        router.push('/guru/kisi/' + j.kisi.id);
      } else {
        await api('/api/kisi?id=' + kid, { method: 'PUT', body });
        setMsg({ text: 'Kisi-kisi tersimpan ✅' });
      }
    } catch (err) { setMsg({ text: err.message, err: true }); }
    setBusy(false);
  }

  if (load) return <div className="content"><Loading /></div>;
  const cpUntukMapel = cp.filter((c) => !form.mapel || c.mapel === form.mapel);

  return (
    <div className="content">
      <div className="row spread mb">
        <div>
          <h1>{isNew ? 'Kisi-Kisi Baru' : 'Edit Kisi-Kisi'}</h1>
          <p className="muted small">Kaitkan setiap indikator ke elemen & CP terpilih agar rekap hasil bisa dianalisis per CP.</p>
        </div>
        {!isNew && <a className="btn" href={`/api/kisi?id=${kid}&export=1`}>⬇️ Export Excel</a>}
      </div>

      <form onSubmit={simpan}>
        <div className="card mb">
          <div className="hd"><h3>ℹ️ Identitas Kisi-Kisi</h3></div>
          <div className="bd">
            <div className="field"><label className="lbl">Judul *</label><input className="inp" required value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} placeholder="mis. Kisi-Kisi Sumatif Tengah Semester — Matematika VIII" /></div>
            <div className="grid3">
              <div className="field"><label className="lbl">Mata pelajaran</label>
                <input className="inp" list="mapelOpt" value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} placeholder="mis. Matematika" />
                <datalist id="mapelOpt">{mapelList.map((m) => <option key={m} value={m} />)}</datalist>
              </div>
              <div className="field"><label className="lbl">Fase</label>
                <select className="sel" value={form.fase} onChange={(e) => setForm({ ...form, fase: e.target.value })}>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((f) => <option key={f} value={f}>Fase {f}</option>)}
                </select>
              </div>
              <div className="field"><label className="lbl">Kelas</label><input className="inp" value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} placeholder="mis. VIII" /></div>
            </div>
            <div className="field"><label className="lbl">Tujuan Pembelajaran (TP)</label><textarea className="ta" value={form.tp} onChange={(e) => setForm({ ...form, tp: e.target.value })} placeholder="TP yang diases…" /></div>
          </div>
        </div>

        <div className="card mb">
          <div className="hd">
            <h3>🧭 Indikator Soal</h3>
            <div className="row small">
              <span className="pill">{form.items.length} indikator</span>
              <span className="pill">{totalSoal} soal</span>
              <span className="pill" style={totalBobot === 100 ? { background: '#ecfdf5', color: '#059669' } : { background: '#fef2f2', color: '#dc2626' }}>Bobot total: {totalBobot}</span>
            </div>
          </div>
          <div className="bd">
            {form.items.length === 0 && <div className="empty">Belum ada indikator — klik “+ Tambah Indikator”.<br /><span className="small">Tips: satu indikator = satu kemampuan yang diukur.</span></div>}
            {form.items.map((it, i) => (
              <div className="qcard" key={i}>
                <div className="row spread mb">
                  <b><span className="no">{i + 1}</span>Indikator #{i + 1}</b>
                  <button type="button" className="btn danger sm" onClick={() => hapusItem(i)}>Hapus</button>
                </div>
                <div className="grid2">
                  <div className="field">
                    <label className="lbl">Elemen & CP (BSKAP 046/H/KR/2025)</label>
                    <select className="sel" value={it.cpId} onChange={(e) => pilihCp(i, e.target.value)}>
                      <option value="">— pilih elemen & CP —</option>
                      {cpUntukMapel.map((c) => (
                        <option key={c.id} value={c.id}>{c.mapel} · {c.elemen}</option>
                      ))}
                    </select>
                    {!it.cpId && <p className="muted small" style={{ marginBottom: 0 }}>CP untuk jenjang/mapel lain? Import dulu via tombol “📥 Import Master CP” di halaman daftar kisi-kisi — mendukung Fase A–F (SD s.d. SMA).</p>}
                    {it.cpTeks && <p className="muted small mt" style={{ marginBottom: 0 }}>{it.cpTeks.slice(0, 180)}{it.cpTeks.length > 180 ? '…' : ''}</p>}
                  </div>
                  <div className="field"><label className="lbl">Lingkup materi</label><input className="inp" value={it.materi} onChange={(e) => ubahItem(i, 'materi', e.target.value)} placeholder="mis. SPLDV — Metode Substitusi" /></div>
                </div>
                <div className="field"><label className="lbl">Indikator soal *</label><input className="inp" value={it.indikator} onChange={(e) => ubahItem(i, 'indikator', e.target.value)} placeholder="Disajikan masalah kontekstual, peserta didik dapat …" /></div>
                <div className="grid3">
                  <div className="field"><label className="lbl">Level kognitif</label>
                    <select className="sel" value={it.level} onChange={(e) => ubahItem(i, 'level', e.target.value)}>
                      {LEVEL.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
                    </select>
                  </div>
                  <div className="field"><label className="lbl">Bentuk soal</label>
                    <select className="sel" value={it.bentuk} onChange={(e) => ubahItem(i, 'bentuk', e.target.value)}>
                      {BENTUK.map((b) => <option key={b} value={b}>{BENTUK_LABEL[b]}</option>)}
                    </select>
                  </div>
                  <div className="grid2">
                    <div className="field"><label className="lbl">Jumlah</label><input className="inp" type="number" min="0" value={it.jumlah} onChange={(e) => ubahItem(i, 'jumlah', e.target.value)} /></div>
                    <div className="field"><label className="lbl">Bobot</label><input className="inp" type="number" min="0" value={it.bobot} onChange={(e) => ubahItem(i, 'bobot', e.target.value)} /></div>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="btn" onClick={tambahItem}>+ Tambah Indikator</button>
          </div>
        </div>

        <div className="row">
          <button className="btn primary" disabled={busy}>{busy ? 'Menyimpan…' : '💾 Simpan Kisi-Kisi'}</button>
          <button type="button" className="btn" onClick={() => router.push('/guru/kisi')}>← Kembali</button>
          {!isNew && <a className="btn" href={`/api/kisi?id=${kid}&export=1`}>⬇️ Export Excel</a>}
        </div>
      </form>
      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
