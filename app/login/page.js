'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
import { Toast } from '@/components/ui';

const FITUR = [
  ['🧩', 'Kisi-kisi maker berbasis CP 046 (BSKAP 046/H/KR/2025)'],
  ['🗃️', 'Bank soal: pilihan ganda, menjodohkan, benar/salah, essay'],
  ['🚀', 'Share link asesmen online + penilaian otomatis'],
  ['📊', 'Rekap otomatis, leaderboard, dan refleksi belajar'],
];

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const j = await api('/api/auth', { method: 'POST', body: { username, password } });
      router.push(j.role === 'siswa' ? '/siswa' : '/guru');
    } catch (err) {
      setMsg({ text: err.message, err: true });
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-hero">
        <div>
          <div className="logo" style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>
            Asesmen<span>Ku</span>
          </div>
          <p style={{ marginTop: 4, fontSize: 13 }}>Platform asesmen Kurikulum Merdeka</p>
          <h1 className="mt" style={{ marginTop: 26 }}>Ujian online yang terukur,<br />terhubung langsung ke CP.</h1>
        </div>
        <div className="fitur">
          {FITUR.map(([i, t]) => (
            <div key={t}><span>{i}</span><span>{t}</span></div>
          ))}
        </div>
        <div className="small" style={{ color: '#a5b4fc' }}>Mengacu BSKAP No. 046/H/KR/2025 · database Google Sheets</div>
      </div>
      <div className="auth-form">
        <div className="auth-card">
          <h2>Selamat datang 👋</h2>
          <p className="muted small">Masuk untuk membuat kisi-kisi, menyusun soal, dan memantau hasil asesmen.</p>
          <form onSubmit={submit} className="mt">
            <div className="field">
              <label className="lbl">Username / NISN</label>
              <input className="inp" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="mis. yudi atau NISN siswa" autoFocus />
            </div>
            <div className="field">
              <label className="lbl">Password</label>
              <input className="inp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={busy}>
              {busy ? 'Memproses…' : '🔓 Masuk'}
            </button>
          </form>
          <div className="card card-p mt" style={{ background: '#f8fafc' }}>
            <b className="small">🔑 Akun demo:</b>
            <div className="small mt" style={{ lineHeight: 1.9 }}>
              <b>Guru:</b> <span className="mono">yudi</span> / <span className="mono">guru123</span><br />
              <b>Siswa:</b> <span className="mono">0061234501</span> / <span className="mono">123456</span>
            </div>
          </div>
          <p className="small muted mt center">Guru sekolah lain? <a href="/daftar"><b>Daftarkan sekolahmu →</b></a></p>
        </div>
      </div>
      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
