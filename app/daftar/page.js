'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';
import { Toast } from '@/components/ui';

export default function Daftar() {
  const [f, setF] = useState({ sekolah: '', nama: '', username: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/daftar', { method: 'POST', body: f });
      setOkMsg(true);
    } catch (err) {
      setMsg({ text: err.message, err: true });
    }
    setBusy(false);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-hero">
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>Asesmen<span>Ku</span></div>
          <h1 className="mt" style={{ marginTop: 26 }}>Satu akun untuk<br />seluruh sekolahmu.</h1>
        </div>
        <div className="small" style={{ color: '#a5b4fc' }}>
          Data sekolah Bapak/Ibu terpisah penuh dari sekolah lain — siap dipakai komunal maupun komersial.
        </div>
      </div>
      <div className="auth-form">
        <div className="auth-card">
          {okMsg ? (
            <div className="card card-p center">
              <div style={{ fontSize: 44 }}>🎉</div>
              <h2>Pendaftaran berhasil!</h2>
              <p className="muted small">Akun guru <b>{f.username}</b> untuk <b>{f.sekolah}</b> sudah dibuat. Silakan masuk.</p>
              <Link className="btn primary" href="/login">→ Ke Halaman Login</Link>
            </div>
          ) : (
            <>
              <h2>Daftar Sekolah Baru</h2>
              <p className="muted small">Membuat akun guru pertama untuk sekolah Bapak/Ibu. Siswa nanti diimport lewat Excel.</p>
              <form onSubmit={submit} className="mt">
                <div className="field"><label className="lbl">Nama sekolah</label>
                  <input className="inp" required value={f.sekolah} onChange={(e) => setF({ ...f, sekolah: e.target.value })} placeholder="mis. SMP Negeri 1 Surabaya" />
                </div>
                <div className="field"><label className="lbl">Nama lengkap guru</label>
                  <input className="inp" required value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} placeholder="mis. Yudi Ahari Siswanto, S.Pd." />
                </div>
                <div className="field"><label className="lbl">Username (untuk login)</label>
                  <input className="inp mono" required value={f.username} onChange={(e) => setF({ ...f, username: e.target.value.toLowerCase() })} placeholder="mis. yudi" />
                </div>
                <div className="field"><label className="lbl">Password (min. 6 karakter)</label>
                  <input className="inp" type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
                </div>
                <button className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: 11 }} disabled={busy}>
                  {busy ? 'Mendaftarkan…' : '🏫 Daftarkan Sekolah'}
                </button>
                <p className="small muted mt center">Sudah punya akun? <Link href="/login">Masuk di sini</Link></p>
              </form>
            </>
          )}
        </div>
      </div>
      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
