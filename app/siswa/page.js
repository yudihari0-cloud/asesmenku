'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, fmtDate } from '@/lib/client';
import { Loading, Empty, Toast, StatusBadge } from '@/components/ui';

export default function SiswaHome() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [token, setToken] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/auth').then(async (j) => {
      // daftar asesmen kelas siswa diambil via endpoint per token → gunakan /api/asesmen publik khusus siswa
      const list = await api('/api/siswa/asesmen');
      setData(list);
    }).catch((e) => setErr(e.message));
  }, []);

  async function bukaToken(e) {
    e.preventDefault();
    if (!token.trim()) return;
    setBusy(true);
    try {
      const j = await api('/api/uji/' + token.trim().toUpperCase());
      router.push('/uji/' + token.trim().toUpperCase());
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  if (!data) return <div className="content"><Loading /></div>;

  return (
    <div className="content">
      <h1>Halo, {data.siswa.nama.split(' ')[0]}! 👋</h1>
      <p className="muted small">Kelas {data.siswa.kelasNama}. Ini daftar asesmen yang tersedia untukmu.</p>

      <div className="card card-p mb">
        <form onSubmit={bukaToken} className="row">
          <b className="small">🎫 Punya kode/token ujian?</b>
          <input className="inp mono" style={{ maxWidth: 200 }} value={token} onChange={(e) => setToken(e.target.value)} placeholder="mis. MTK800" />
          <button className="btn primary" disabled={busy}>Buka</button>
        </form>
      </div>

      {data.asesmen.length === 0 ? (
        <div className="card"><div className="bd"><Empty icon="📝" text="Belum ada asesmen aktif untuk kelasmu. Cek lagi nanti atau masukkan token di atas." /></div></div>
      ) : (
        <div className="grid2">
          {data.asesmen.map((a) => (
            <div className="card" key={a.token}>
              <div className="bd">
                <div className="row spread">
                  <h3 style={{ flex: 1 }}>{a.judul}</h3>
                  {a.attempt ? <StatusBadge status={a.attempt.status} /> : <span className="badge b-blue">Belum dikerjakan</span>}
                </div>
                <div className="muted small mb">{a.mapel} · {a.guru} · {a.jumlahSoal} soal · {a.durasiMenit} menit · tutup {fmtDate(a.tutup)}</div>
                {a.attempt && a.attempt.status !== 'berlangsung' && a.skorTampil != null && (
                  <p className="small">Skor terakhir: <b style={{ color: a.skorTampil >= a.kktp ? 'var(--green)' : 'var(--red)' }}>{a.skorTampil}</b> {a.attempt.status === 'selesai' && <span className="badge b-amber">menunggu koreksi essay</span>}</p>
                )}
                <div className="row">
                  {!a.attempt && a.status === 'publik' && (
                    <button className="btn primary sm" onClick={() => router.push('/uji/' + a.token)}>🚀 Kerjakan</button>
                  )}
                  {a.attempt?.status === 'berlangsung' && (
                    <button className="btn primary sm" onClick={() => router.push('/uji/' + a.token)}>⏱ Lanjutkan (masih berjalan)</button>
                  )}
                  {a.attempt && a.attempt.status !== 'berlangsung' && (
                    <button className="btn sm" onClick={() => router.push('/uji/' + a.token)}>Lihat hasil & leaderboard</button>
                  )}
                  {a.attempt?.status === 'selesai' && <span className="badge b-amber">Menunggu guru mengoreksi essay</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Toast msg={err ? { text: err, err: true } : null} onDone={() => setErr(null)} />
    </div>
  );
}
