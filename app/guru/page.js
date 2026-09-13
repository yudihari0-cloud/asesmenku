'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, fmtDate } from '@/lib/client';
import { Loading, StatusBadge } from '@/components/ui';

export default function GuruDashboard() {
  const [kelas, setKelas] = useState([]);
  const [asesmen, setAsesmen] = useState([]);
  const [siswa, setSiswa] = useState([]);
  const [status, setStatus] = useState(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    Promise.all([api('/api/kelas'), api('/api/asesmen'), api('/api/siswa'), api('/api/status').catch(() => null)])
      .then(([k, a, s, st]) => {
        setKelas(k.kelas);
        setAsesmen(a.asesmen);
        setSiswa(s.siswa);
        setStatus(st);
      })
      .finally(() => setLoad(false));
  }, []);

  if (load) return <div className="content"><Loading /></div>;

  const publik = asesmen.filter((a) => a.status === 'publik');
  const rata = asesmen.filter((a) => a.rataSkor != null);
  const rataAll = rata.length ? Math.round((rata.reduce((x, y) => x + y.rataSkor, 0) / rata.length) * 10) / 10 : null;
  const totalPeserta = asesmen.reduce((x, y) => x + y.jumlahPeserta, 0);

  return (
    <div className="content">
      <div className="row spread mb">
        <div>
          <h1>Dashboard</h1>
          <p className="muted small">Ringkasan aktivitas asesmen berbasis CP 046.</p>
        </div>
        <Link className="btn primary" href="/guru/kisi">+ Buat Kisi-Kisi</Link>
      </div>

      <div className="stat mb">
        <div className="st"><div className="num">{kelas.length}</div><div className="lbl">Kelas</div></div>
        <div className="st"><div className="num">{siswa.length}</div><div className="lbl">Siswa</div></div>
        <div className="st"><div className="num">{asesmen.length}</div><div className="lbl">Asesmen dibuat</div></div>
        <div className="st"><div className="num">{publik.length}</div><div className="lbl">Sedang aktif</div></div>
        <div className="st"><div className="num">{totalPeserta}</div><div className="lbl">Total partisipasi</div></div>
        <div className="st"><div className="num">{rataAll ?? '—'}</div><div className="lbl">Rata-rata skor</div></div>
      </div>

      <div className="card">
        <div className="hd"><h3>🚀 Asesmen Terbaru</h3><Link className="btn sm" href="/guru/asesmen">Lihat semua →</Link></div>
        {asesmen.length === 0 ? (
          <div className="bd"><div className="empty"><div className="big">🚀</div>Belum ada asesmen. Mulai dari <Link href="/guru/kisi">membuat kisi-kisi</Link> → isi bank soal → buat asesmen.</div></div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Judul</th><th>Token</th><th>Status</th><th>Soal</th><th>Peserta</th><th>Rata²</th><th>Dibuat</th><th></th></tr></thead>
              <tbody>
                {asesmen.slice(0, 6).map((a) => (
                  <tr key={a.id}>
                    <td><b>{a.judul}</b><div className="muted small">{a.kisiJudul}</div></td>
                    <td><span className="badge b-violet mono">{a.token}</span></td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>{a.jumlahSoal}</td>
                    <td>{a.jumlahPeserta}</td>
                    <td>{a.rataSkor ?? '—'}</td>
                    <td className="muted small">{fmtDate(a.createdAt)}</td>
                    <td className="right"><Link className="btn sm" href={`/guru/asesmen/${a.id}`}>Kelola →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {status && (
        <div className="card card-p mt small muted">
          🗄️ Mode penyimpanan: <b>{status.storeLabel}</b> · Data: {status.jumlah.users} pengguna, {status.jumlah.kelas} kelas, {status.jumlah.soal} soal, {status.jumlah.attempt} attempt ·{' '}
          {status.store !== 'sheets' && <>untuk produksi, hubungkan Google Sheets melalui environment variable (panduan di README).</>}
        </div>
      )}

      <div className="grid3 mt">
        <div className="card card-p">
          <h3>📋 1. Kisi-kisi</h3>
          <p className="muted small">Susun indikator soal dari elemen & CP (BSKAP 046/H/KR/2025), lengkap level kognitif L1–L3.</p>
          <Link className="btn sm" href="/guru/kisi">Buka Kisi-Kisi Maker →</Link>
        </div>
        <div className="card card-p">
          <h3>🗃️ 2. Bank soal</h3>
          <p className="muted small">Tulis soal PG, benar/salah, menjodohkan & essay yang tertaut ke indikator kisi-kisi.</p>
          <Link className="btn sm" href="/guru/soal">Buka Bank Soal →</Link>
        </div>
        <div className="card card-p">
          <h3>👥 3. Siswa</h3>
          <p className="muted small">Unduh template Excel, isi data siswa, unggah — akun siswa dibuat otomatis per kelas.</p>
          <Link className="btn sm" href="/guru/kelas">Kelola Kelas & Siswa →</Link>
        </div>
      </div>
    </div>
  );
}
