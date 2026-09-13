'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, copyText } from '@/lib/client';
import { Loading, Toast } from '@/components/ui';

const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const sisaHari = (iso) => (iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5) : null);

export default function AdminAktivasi() {
  const [data, setData] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [jumlah, setJumlah] = useState(5);
  const [untuk, setUntuk] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const me = await api('/api/auth');
    setAdmin(!!me.user?.admin);
    if (!me.user?.admin) return;
    setData(await api('/api/aktivasi'));
  }, []);

  useEffect(() => { load().catch((e) => setMsg({ text: e.message, err: true })); }, [load]);

  if (admin === null) return <div className="content"><Loading /></div>;
  if (!admin) {
    return (
      <div className="content">
        <div className="card"><div className="bd center card-p">
          <div style={{ fontSize: 40 }}>🔒</div>
          <h2>Khusus Admin</h2>
          <p className="muted small">Halaman ini hanya untuk pengelola AsesmenKu.</p>
          <Link className="btn" href="/guru">← Dashboard</Link>
        </div></div>
      </div>
    );
  }

  async function generate(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const j = await api('/api/aktivasi', { method: 'POST', body: { jumlah, dibuatUntuk: untuk } });
      setMsg({ text: `${j.codes.length} kode dibuat ✅` });
      setUntuk('');
      await load();
    } catch (err) { setMsg({ text: err.message, err: true }); }
    setBusy(false);
  }

  async function hapus(c) {
    if (!confirm(`Hapus kode ${c.kode}?`)) return;
    try {
      await api('/api/aktivasi?id=' + c.id, { method: 'DELETE' });
      setMsg({ text: 'Kode dihapus' });
      await load();
    } catch (err) { setMsg({ text: err.message, err: true }); }
  }

  const codes = data?.codes || [];
  const tersedia = codes.filter((c) => c.status === 'tersedia');
  const terpakai = codes.filter((c) => c.status !== 'tersedia');
  const sekolahs = data?.sekolahs || [];

  return (
    <div className="content">
      <div className="row spread mb">
        <div>
          <h1>🔑 Panel Aktivasi</h1>
          <p className="muted small">Generate kode aktivasi (ASMT-XXXX-XXXX) untuk dibagikan ke sekolah pembeli. Satu kode = masa aktif 1 tahun.</p>
        </div>
      </div>

      <div className="stat mb">
        <div className="st"><div className="num">{tersedia.length}</div><div className="lbl">Kode tersedia</div></div>
        <div className="st"><div className="num">{terpakai.length}</div><div className="lbl">Kode terpakai</div></div>
        <div className="st"><div className="num">{sekolahs.length}</div><div className="lbl">Sekolah terdaftar</div></div>
        <div className="st"><div className="num">{sekolahs.filter((s) => sisaHari(s.masaAktifSampai) !== null && sisaHari(s.masaAktifSampai) < 0).length}</div><div className="lbl">Masa aktif habis</div></div>
      </div>

      <div className="card card-p mb">
        <form onSubmit={generate} className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
          <b className="small">Generate kode:</b>
          <input className="inp" type="number" min="1" max="50" value={jumlah} onChange={(e) => setJumlah(e.target.value)} style={{ width: 80 }} />
          <span className="small muted">kode</span>
          <input className="inp" value={untuk} onChange={(e) => setUntuk(e.target.value)} placeholder="Catatan (opsional) — mis. utk SMPN 2 Sidoarjo" style={{ maxWidth: 320 }} />
          <button className="btn primary" disabled={busy}>{busy ? 'Membuat…' : '+ Buat Kode'}</button>
        </form>
      </div>

      <div className="card mb">
        <div className="hd"><h3>🎟️ Kode Aktivasi ({codes.length})</h3>
          <button className="btn sm" onClick={() => { copyText(tersedia.map((c) => c.kode).join('\n')); setMsg({ text: 'Semua kode tersedia dikopi ✅' }); }}>📋 Copy kode tersedia</button>
        </div>
        {codes.length === 0 ? (
          <div className="bd"><p className="muted center">Belum ada kode — buat dulu di atas.</p></div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Kode</th><th>Status</th><th>Catatan</th><th>Dipakai oleh</th><th>Aktif s/d</th><th className="right">Aksi</th></tr></thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id}>
                    <td className="mono"><b>{c.kode}</b></td>
                    <td>{c.status === 'tersedia' ? <span className="badge b-green">tersedia</span> : <span className="badge b-gray">terpakai</span>}</td>
                    <td className="small muted">{c.dibuatUntuk || '—'}</td>
                    <td className="small">{c.dipakaiOleh || '—'}</td>
                    <td className="small">{c.kedaluwarsa ? fmt(c.kedaluwarsa) : '—'}</td>
                    <td className="aksi">
                      <button className="btn sm" onClick={() => { copyText(c.kode); setMsg({ text: 'Kode dikopi ✅' }); }}>📋</button>
                      {c.status === 'tersedia' && <button className="btn danger sm" onClick={() => hapus(c)}>🗑</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="hd"><h3>🏫 Masa Aktif Sekolah</h3></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Sekolah</th><th>Masa aktif s/d</th><th>Sisa</th><th>Status</th></tr></thead>
            <tbody>
              {sekolahs.map((s) => {
                const hari = sisaHari(s.masaAktifSampai);
                return (
                  <tr key={s.id}>
                    <td><b>{s.nama}</b></td>
                    <td className="small">{fmt(s.masaAktifSampai)}</td>
                    <td className="small">{hari != null ? Math.max(0, hari) + ' hari' : '—'}</td>
                    <td>
                      {hari == null ? <span className="badge b-gray">?</span>
                        : hari < 0 ? <span className="badge b-red">habis</span>
                        : hari <= 30 ? <span className="badge b-amber">segera habis</span>
                        : <span className="badge b-green">aktif</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
