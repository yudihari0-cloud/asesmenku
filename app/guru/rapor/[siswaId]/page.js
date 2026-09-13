'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, fmtDate } from '@/lib/client';
import { Loading, Empty, Toast } from '@/components/ui';

/** Rapor mini: rekap nilai lintas asesmen + penguasaan indikator per siswa */
export default function RaporSiswa() {
  const { siswaId } = useParams();
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api('/api/rapor?siswaId=' + siswaId).then(setData).catch((e) => setMsg({ text: e.message, err: true }));
  }, [siswaId]);

  if (!data) return <div className="content"><Loading /></div>;
  const { siswa, kelasNama, rows, mastery, ringkas, sekolah, guruInfo } = data;
  const diikuti = rows.filter((r) => r.status !== 'belum');
  const chartData = diikuti.filter((r) => r.skor != null);

  return (
    <div className="content">
      {/* Kop sekolah — ikut tercetak */}
      <div className="card card-p mb" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        {sekolah?.logo && <img src={sekolah.logo} alt="logo" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', border: '1px solid var(--line)', flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 200 }}>
          <b style={{ fontSize: 16 }}>{sekolah?.nama || 'RAPOR MINI ASESMEN'}</b>
          {sekolah?.alamat && <div className="muted small">{sekolah.alamat}</div>}
          <div className="muted small">Guru: <b>{guruInfo?.nama}</b>{guruInfo?.nip ? ` · NIP ${guruInfo.nip}` : ''}{guruInfo?.jabatan ? ` · ${guruInfo.jabatan}` : ''}</div>
        </div>
      </div>

      <div className="row spread mb">
        <div>
          <h1>📊 Rapor Mini — {siswa.nama}</h1>
          <p className="muted small">Kelas {kelasNama} · NISN {siswa.nisn || '-'}{siswa.wa ? <> · WA +{siswa.wa}</> : null}</p>
        </div>
        <div className="row">
          <button className="btn primary no-print" onClick={() => window.print()}>🖨 Cetak / PDF</button>
          <a className="btn" href={`/api/rapor?siswaId=${siswaId}&export=1`}>⬇️ Export Excel</a>
          <Link className="btn" href="/guru/kelas">← Kelas</Link>
        </div>
      </div>

      <div className="stat mb">
        <div className="st"><div className="num">{ringkas.rata ?? '—'}</div><div className="lbl">Rata-rata skor</div></div>
        <div className="st"><div className="num">{ringkas.ikut}</div><div className="lbl">Asesmen diikuti</div></div>
        <div className="st"><div className="num" style={{ color: 'var(--green)' }}>{ringkas.tuntas}</div><div className="lbl">Tuntas</div></div>
        <div className="st"><div className="num" style={{ color: 'var(--red)' }}>{ringkas.ikut - ringkas.tuntas}</div><div className="lbl">Belum tuntas</div></div>
        <div className="st"><div className="num">{ringkas.tertinggi ?? '—'}</div><div className="lbl">Tertinggi</div></div>
        <div className="st"><div className="num">{ringkas.terendah ?? '—'}</div><div className="lbl">Terendah</div></div>
      </div>

      {chartData.length >= 2 && (
        <div className="card mb">
          <div className="hd"><h3>📈 Tren Perkembangan Nilai</h3></div>
          <div className="bd">
            <Chart data={chartData} />
            <div className="row small muted mt" style={{ justifyContent: 'space-between' }}>
              {chartData.map((r, i) => (
                <span key={i} style={{ maxWidth: 120, textAlign: 'center' }}>{r.mapel === '-' ? r.judul.slice(0, 14) : r.mapel + ' #' + (i + 1)}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card mb">
        <div className="hd"><h3>📝 Nilai Semua Asesmen</h3></div>
        {rows.length === 0 ? (
          <div className="bd"><Empty icon="📝" text="Belum ada asesmen untuk kelas siswa ini." /></div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Asesmen</th><th>Mapel</th><th>Skor</th><th>KKTP</th><th>Status</th><th>Selesai</th><th></th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.asesmenId}>
                    <td><b>{r.judul}</b></td>
                    <td>{r.mapel}</td>
                    <td><b style={{ color: r.skor == null ? 'inherit' : r.skor >= r.kktp ? 'var(--green)' : 'var(--red)' }}>{r.skor ?? '—'}</b></td>
                    <td>{r.kktp}</td>
                    <td>
                      <span className={`badge ${r.statusLabel === 'Tuntas' ? 'b-green' : r.statusLabel === 'Belum tuntas' ? 'b-red' : r.statusLabel === 'Belum mengikuti' ? 'b-gray' : 'b-amber'}`}>{r.statusLabel}</span>
                    </td>
                    <td className="muted small">{r.selesai ? fmtDate(r.selesai) : '-'}</td>
                    <td className="right"><Link className="btn sm" href={`/guru/asesmen/${r.asesmenId}`}>Detail →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="hd"><h3>🧭 Penguasaan Indikator (agregat lintas asesmen — terlemah dulu)</h3></div>
        <div className="bd">
          {mastery.length === 0 && <Empty icon="🧭" text="Belum ada data penguasaan. Nilai muncul setelah siswa mengerjakan asesmen." />}
          {mastery.map((m, i) => (
            <div key={i} className="mb">
              <div className="row spread small">
                <span><b>{m.indikator.slice(0, 80)}{m.indikator.length > 80 ? '…' : ''}</b> <span className="pill">{m.mapel}</span> <span className="pill">{m.level}</span></span>
                <span className={`badge ${m.persen >= 75 ? 'b-green' : m.persen >= 50 ? 'b-amber' : 'b-red'}`}>{m.persen}% · {m.kategori}</span>
              </div>
              <div className="bar mt"><i className={m.persen >= 75 ? '' : m.persen >= 50 ? 'kuning' : 'merah'} style={{ width: m.persen + '%' }} /></div>
            </div>
          ))}
        </div>
      </div>
      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}

/** Grafik garis sederhana tanpa library (SVG) */
function Chart({ data }) {
  const W = 660, H = 200, PL = 38, PR = 16, PT = 16, PB = 26;
  const iw = W - PL - PR, ih = H - PT - PB;
  const x = (i) => PL + (data.length === 1 ? iw / 2 : (i * iw) / (data.length - 1));
  const y = (s) => PT + ih - (s / 100) * ih;
  const pts = data.map((r, i) => `${x(i)},${y(r.skor)}`).join(' ');
  const gridY = [0, 25, 50, 75, 100];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {gridY.map((g) => (
        <g key={g}>
          <line x1={PL} y1={y(g)} x2={W - PR} y2={y(g)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={PL - 6} y={y(g) + 4} textAnchor="end" fontSize="10" fill="#64748b">{g}</text>
        </g>
      ))}
      <polyline points={pts} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round" />
      {data.map((r, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(r.skor)} r="5.5" fill={r.skor >= r.kktp ? '#059669' : '#dc2626'} stroke="#fff" strokeWidth="2">
            <title>{`${r.judul}: ${r.skor}`}</title>
          </circle>
          <text x={x(i)} y={y(r.skor) - 10} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1e293b">{r.skor}</text>
        </g>
      ))}
    </svg>
  );
}
