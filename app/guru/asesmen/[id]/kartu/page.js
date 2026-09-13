'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, fmtDate } from '@/lib/client';
import { Loading } from '@/components/ui';

/** Kartu ujian siap cetak: 1 kartu per siswa berisi QR, link, token, dan kredensial login */
export default function KartuUjian() {
  const { id: aid } = useParams();
  const [data, setData] = useState(null);
  const [kelasFilter, setKelasFilter] = useState('');

  useEffect(() => {
    api('/api/asesmen/' + aid).then(setData).catch(() => {});
  }, [aid]);

  if (!data) return <div className="content"><Loading /></div>;
  const { asesmen, rekap, link, sekolah, guruInfo } = data;
  const rows = rekap.rows.filter((r) => !kelasFilter || r.kelas === kelasFilter);

  return (
    <div className="content">
      <div className="row spread mb no-print">
        <div>
          <h1>🖨 Kartu Ujian</h1>
          <p className="muted small">{asesmen.judul} — potong per kartu, lalu bagikan ke siswa.</p>
        </div>
        <div className="row">
          <select className="sel" style={{ maxWidth: 160 }} value={kelasFilter} onChange={(e) => setKelasFilter(e.target.value)}>
            <option value="">Semua kelas</option>
            {data.kelas.map((k) => <option key={k.id} value={k.nama}>{k.nama}</option>)}
          </select>
          <button className="btn primary" onClick={() => window.print()}>🖨 Cetak</button>
          <a className="btn" href={`/guru/asesmen/${aid}`}>← Kembali</a>
        </div>
      </div>
      <p className="muted small mb">Kartu memakai identitas: <b>{sekolah?.nama || 'Sekolah (belum diatur)'}</b> · Guru: <b>{guruInfo?.nama}</b>{guruInfo?.nip ? ` · NIP ${guruInfo.nip}` : ''} — ubah di menu <b>👤 Profil & Sekolah</b>.</p>

      <div className="kartu-grid">
        {rows.map((r) => (
          <div className="kartu-uji" key={r.siswaId}>
          <div className="khd">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {sekolah?.logo && <img src={sekolah.logo} alt="logo" style={{ height: 36, width: 36, borderRadius: 8, objectFit: 'cover', background: '#fff', padding: 2, flexShrink: 0 }} />}
              <div style={{ minWidth: 0 }}>
                <b>{sekolah?.nama || 'KARTU UJIAN'}</b>
                <div className="small" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asesmen.judul}</div>
              </div>
            </div>
          </div>
            <div className="kbd">
              <img src={'/api/qr?text=' + encodeURIComponent(link) + '&size=100'} width={96} height={96} alt="QR" />
              <div className="small" style={{ lineHeight: 1.7 }}>
                <b style={{ fontSize: 15 }}>{r.nama}</b>
                <div>Kelas: <b>{r.kelas}</b></div>
                <div>NISN: <span className="mono">{r.nisn}</span></div>
                <div>Password awal: <span className="mono">123456</span></div>
                <div>Token: <b className="mono" style={{ color: 'var(--primary)' }}>{asesmen.token}</b></div>
                <div className="muted">{asesmen.durasiMenit} menit · tutup {asesmen.tutup ? fmtDate(asesmen.tutup) : '-'}</div>
                {r.wa && (
                  <a className="btn green sm no-print mt" target="_blank" rel="noopener noreferrer"
                    href={waLink(
                      `Assalamualaikum ${r.nama} 👋\n\nBerikut data *KARTU UJIAN ONLINE*:\nUjian: ${asesmen.judul}\nNISN: ${r.nisn}\nPassword awal: 123456\nToken: ${asesmen.token}\nDurasi: ${asesmen.durasiMenit} menit\n\nBuka link:\n${link}\n\nSelamat mengerjakan! 💪`,
                      r.wa
                    )}>📱 Kirim via WA</a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 && <div className="empty">Tidak ada siswa pada filter ini.</div>}
    </div>
  );
}
