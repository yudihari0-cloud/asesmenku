'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api, fmtDate, BENTUK_LABEL } from '@/lib/client';
import { Loading, Empty, Modal, Toast } from '@/components/ui';

export default function KisiList() {
  const [kisi, setKisi] = useState(null);
  const [msg, setMsg] = useState(null);
  const [cpOpen, setCpOpen] = useState(false);
  const [cpRes, setCpRes] = useState(null);
  const [cpBusy, setCpBusy] = useState(false);
  const cpFileRef = useRef(null);

  useEffect(() => {
    api('/api/kisi').then((j) => setKisi(j.kisi)).catch((e) => setMsg({ text: e.message, err: true }));
  }, []);

  async function hapus(k) {
    if (!confirm(`Hapus kisi-kisi "${k.judul}"?`)) return;
    try {
      await api('/api/kisi?id=' + k.id, { method: 'DELETE' });
      setKisi((k2) => k2.filter((x) => x.id !== k.id));
      setMsg({ text: 'Kisi-kisi dihapus' });
    } catch (e) { setMsg({ text: e.message, err: true }); }
  }

  async function importCp(e) {
    e.preventDefault();
    const f = cpFileRef.current?.files?.[0];
    if (!f) return setMsg({ text: 'Pilih file Excel CP dulu', err: true });
    setCpBusy(true);
    const fd = new FormData();
    fd.append('file', f);
    try {
      const r = await fetch('/api/cp/import', { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setCpRes(j);
      setMsg({ text: `${j.created} CP terimport ✅` });
    } catch (err) { setMsg({ text: err.message, err: true }); }
    setCpBusy(false);
  }

  if (!kisi) return <div className="content"><Loading /></div>;

  return (
    <div className="content">
      <div className="row spread mb">
        <div>
          <h1>Kisi-Kisi Maker</h1>
          <p className="muted small">Susun indikator dari elemen & CP (BSKAP 046/H/KR/2025) — nanti jadi cetak biru asesmen.</p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => { setCpRes(null); setCpOpen(true); }}>📥 Import Master CP</button>
          <Link className="btn primary" href="/guru/kisi/new">+ Kisi-Kisi Baru</Link>
        </div>
      </div>

      {kisi.length === 0 ? (
        <div className="card"><div className="bd"><Empty icon="📋" text="Belum ada kisi-kisi. Klik “Kisi-Kisi Baru” untuk mulai." /></div></div>
      ) : (
        <div className="grid2">
          {kisi.map((k) => {
            const totalBobot = k.items.reduce((a, b) => a + (b.bobot || 0), 0);
            const totalSoal = k.items.reduce((a, b) => a + (b.jumlah || 0), 0);
            return (
              <div className="card" key={k.id}>
                <div className="bd">
                  <div className="row spread">
                    <h3 style={{ flex: 1 }}>{k.judul}</h3>
                    {k.dipakaiOleh > 0 ? <span className="badge b-green">{k.dipakaiOleh} asesmen</span> : <span className="badge b-gray">belum dipakai</span>}
                  </div>
                  <div className="muted small mb">{k.mapel} · Fase {k.fase} · Kelas {k.kelas} · dibuat {fmtDate(k.createdAt)}</div>
                  <div className="row small">
                    <span className="pill">{k.items.length} indikator</span>
                    <span className="pill">{totalSoal} soal direncanakan</span>
                    <span className="pill">Bobot {totalBobot}</span>
                    <span className={`pill ${totalBobot === 100 ? 'b-green' : ''}`} style={totalBobot !== 100 ? { background: '#fef2f2', color: '#dc2626' } : {}}>{totalBobot === 100 ? 'Bobot pas 100 ✓' : 'Total bobot ≠ 100'}</span>
                    <span className="pill">{k.jumlahSoalBank} soal di bank</span>
                  </div>
                  <div className="row mt">
                    <Link className="btn primary sm" href={`/guru/kisi/${k.id}`}>✏️ Edit</Link>
                    <a className="btn sm" href={`/api/kisi?id=${k.id}&export=1`}>⬇️ Export Excel</a>
                    <Link className="btn sm" href={`/guru/soal?kisiId=${k.id}`}>🗃️ Soal</Link>
                    <button className="btn danger sm" onClick={() => hapus(k)}>Hapus</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cpOpen && (
        <Modal title="Import Master CP (BSKAP 046/H/KR/2025)" onClose={() => setCpOpen(false)}>
          {!cpRes ? (
            <form onSubmit={importCp}>
              <p className="muted small">
                Master CP berisi daftar Capaian Pembelajaran per <b>fase, mapel & elemen</b> — dipakai di dropdown Kisi-Kisi Maker.
                Semua jenjang didukung: <b>Fase A–C (SD), D (SMP), E–F (SMA/SMK)</b>.
              </p>
              <div className="field"><label className="lbl">Langkah 1 — unduh template</label>
                <a className="btn" href="/api/cp/template">⬇️ Template CP Semua Jenjang (.xlsx)</a>
              </div>
              <div className="field"><label className="lbl">Langkah 2 — isi dengan teks CP resmi, lalu unggah</label>
                <input type="file" accept=".xlsx,.xls" ref={cpFileRef} className="inp" />
              </div>
              <button className="btn primary" disabled={cpBusy}>{cpBusy ? 'Mengimpor…' : '📤 Unggah & Import'}</button>
            </form>
          ) : (
            <div>
              <h3>Hasil Import 🎉</h3>
              <p><b style={{ fontSize: 22, color: 'var(--green)' }}>{cpRes.created}</b> CP berhasil diimport.</p>
              {!!cpRes.skipped.length && (
                <details><summary className="muted small">{cpRes.skipped.length} baris dilewati</summary>
                  <ul className="muted small">{cpRes.skipped.map((s, i) => <li key={i}>{s.mapel} — {s.alasan}</li>)}</ul>
                </details>
              )}
              <p className="muted small mt">CP baru langsung muncul di dropdown “Elemen & CP” saat membuat/mengedit kisi-kisi.</p>
              <button className="btn primary mt" onClick={() => setCpOpen(false)}>Selesai</button>
            </div>
          )}
        </Modal>
      )}

      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
