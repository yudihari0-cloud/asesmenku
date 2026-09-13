'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, BENTUK_LABEL } from '@/lib/client';
import { Loading } from '@/components/ui';

/** Halaman publik hasil asesmen (share by link, tanpa login) — siap cetak */
export default function BagikanHasil() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api('/api/bagikan/' + token).then(setData).catch((e) => setErr(e.message));
  }, [token]);

  if (err) {
    return (
      <div className="content" style={{ maxWidth: 560, margin: '60px auto' }}>
        <div className="card card-p center">
          <div style={{ fontSize: 44 }}>🔒</div>
          <h2>Hasil tidak tersedia</h2>
          <p className="muted">{err}</p>
        </div>
      </div>
    );
  }
  if (!data) return <div className="content"><Loading text="Memuat hasil…" /></div>;

  const { judul, mapel, guru, nip, jabatan, sekolah, kktp, ringkas, leaderboard, mastery, butir, anonim, status } = data;
  const MEDALI = ['🥇', '🥈', '🥉'];

  return (
    <div className="content" style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="row spread mb no-print">
        <span className="badge b-violet">🔗 HASIL ASESMEN — LINK PUBLIK</span>
        <div className="row">
          <button className="btn sm primary" onClick={() => window.print()}>🖨 Cetak / Simpan PDF</button>
        </div>
      </div>

      <div className="card mb">
        <div className="bd" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          {sekolah?.logo && <img src={sekolah.logo} alt="logo sekolah" style={{ width: 58, height: 58, borderRadius: 14, objectFit: 'cover', border: '1px solid var(--line)', flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 220 }}>
            {sekolah?.nama && (
              <>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{sekolah.nama}</div>
                {sekolah.alamat && <div className="muted small">{sekolah.alamat}</div>}
              </>
            )}
            <h1 style={{ marginBottom: 2, marginTop: sekolah?.nama ? 6 : 0 }}>{judul}</h1>
            <div className="muted small">
              {mapel !== '-' ? <>Mapel: <b>{mapel}</b> · </> : null}
              Guru: <b>{guru}</b>{nip ? <> · NIP {nip}</> : ''}{jabatan ? <> · {jabatan}</> : ''}
              <span className={`badge ${status === 'publik' ? 'b-green' : 'b-red'}`} style={{ marginLeft: 6 }}>
                {status === 'publik' ? 'Aktif' : 'Ditutup'}
              </span>
              {anonim && <span className="badge b-gray" style={{ marginLeft: 6 }}>leaderboard anonim</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="stat mb">
        <div className="st"><div className="num">{ringkas.jumlahPeserta}/{ringkas.jumlahSiswa}</div><div className="lbl">Peserta</div></div>
        <div className="st"><div className="num">{ringkas.rata ?? '—'}</div><div className="lbl">Rata-rata</div></div>
        <div className="st"><div className="num" style={{ color: 'var(--green)' }}>{ringkas.tuntas}</div><div className="lbl">Tuntas (≥{kktp})</div></div>
        <div className="st"><div className="num">{ringkas.tertinggi ?? '—'}</div><div className="lbl">Tertinggi</div></div>
        <div className="st"><div className="num">{ringkas.terendah ?? '—'}</div><div className="lbl">Terendah</div></div>
      </div>

      <div className="grid2 mb">
        <div className="card">
          <div className="hd"><h3>🏆 Leaderboard</h3></div>
          <div className="bd" style={{ padding: 0 }}>
            {leaderboard.length === 0 && <div className="empty">Belum ada peserta selesai.</div>}
            {leaderboard.slice(0, 10).map((r) => (
              <div key={r.peringkat} className={`lb-row ${r.peringkat <= 3 ? 'top3' : ''}`}>
                <div className="lb-rank">{MEDALI[r.peringkat - 1] || r.peringkat}</div>
                <div className="lb-nama">{r.nama}</div>
                <div className="lb-skor">{r.skor}</div>
              </div>
            ))}
            {leaderboard.length > 10 && <div className="muted small center" style={{ padding: 8 }}>…dan {leaderboard.length - 10} peserta lainnya</div>}
          </div>
        </div>
        <div className="card">
          <div className="hd"><h3>🧭 Penguasaan per Indikator</h3></div>
          <div className="bd">
            {mastery.length === 0 && <div className="muted small">Belum ada data.</div>}
            {mastery.map((m, i) => (
              <div key={i} className="mb small">
                <div className="row spread">
                  <span style={{ maxWidth: '70%' }}>{m.indikator.slice(0, 60)}{m.indikator.length > 60 ? '…' : ''}</span>
                  <span className={`badge ${m.persen >= 75 ? 'b-green' : m.persen >= 50 ? 'b-amber' : 'b-red'}`}>{m.persen}%</span>
                </div>
                <div className="bar mt"><i className={m.persen >= 75 ? '' : m.persen >= 50 ? 'kuning' : 'merah'} style={{ width: m.persen + '%' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="hd"><h3>🔬 Analisis Butir Soal</h3><span className="muted small">P = kesukaran · D = daya beda</span></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>#</th><th>Tipe</th><th>N</th><th>P</th><th>Kesukaran</th><th>D</th><th>Daya Beda</th></tr></thead>
            <tbody>
              {butir.map((b, i) => (
                <tr key={b.soalId}>
                  <td>{i + 1}</td>
                  <td className="small">{BENTUK_LABEL[b.tipe] || b.tipe}</td>
                  <td>{b.N}</td>
                  <td>{b.P ?? '—'}</td>
                  <td><span className={`badge ${b.P == null ? 'b-gray' : b.P >= 0.71 ? 'b-green' : b.P >= 0.31 ? 'b-amber' : 'b-red'}`}>{b.kesukaran}</span></td>
                  <td>{b.D ?? '—'}</td>
                  <td><span className={`badge ${b.D == null ? 'b-gray' : b.D >= 0.4 ? 'b-green' : b.D >= 0.2 ? 'b-amber' : 'b-red'}`}>{b.dayaBeda}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="muted small center mt no-print">Dibuat dengan <b>AsesmenKu</b> · Kurikulum Merdeka CP 046 (BSKAP 046/H/KR/2025)</p>
    </div>
  );
}
