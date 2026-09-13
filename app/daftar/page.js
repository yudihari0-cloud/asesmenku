'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';
import { Toast } from '@/components/ui';

export default function Daftar() {
  const [f, setF] = useState({ kode: '', sekolah: '', nama: '', username: '', password: '' });
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
          Kode aktivasi didapat setelah pembelian (hubungi admin via WhatsApp). Satu kode untuk satu sekolah — masa aktif 1 tahun, semua guru & siswa.
        </div>
      </div>
      <div className="auth-form">
        <div className="auth-card">
          {okMsg ? (
            <div className="card card-p center">
              <div style={{ fontSize: 44 }}>🎉</div>
              <h2>Pendaftaran berhasil!</h2>
              <p className="muted small">
                Akun guru <b>{f.username}</b> untuk <b>{f.sekolah}</b> sudah dibuat.<br />
                Masa aktif sekolahmu: <b>1 tahun</b> sejak hari ini.
              </p>
              <Link className="btn primary" href="/login">→ Masuk Sekarang</Link>
            </div>
          ) : (
            <>
              <h2>Daftar Sekolah Baru</h2>
              <p className="muted small">Masukkan kode aktivasi (ASMT-XXXX-XXXX) beserta data sekolah. Akun guru pertama dibuat otomatis.</p>
              <form onSubmit={submit} className="mt">
                <div className="field"><label className="lbl">Kode aktivasi</label>
                  <input className="inp mono" required value={f.kode} onChange={(e) => setF({ ...f, kode: e.target.value.toUpperCase() })} placeholder="ASMT-XXXX-XXXX" style={{ letterSpacing: 1 }} />
                </div>
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
                  <input className="inp" type="password" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••••" />
                </div>
                <button className="btn primary" disabled={busy} style={{ width: '100%' }}>
                  {busy ? 'Mendaftarkan…' : '🎓 Daftarkan Sekolahku'}
                </button>
              </form>
              <p className="muted small center" style={{ marginTop: 14 }}>
                Belum punya kode? <Link href="https://wa.me/?text=Halo%2C%20saya%20mau%20beli%20kode%20aktivasi%20AsesmenKu" target="_blank" rel="noopener noreferrer">Beli via WhatsApp</Link>
                {' · '}
                <Link href="/login">Sudah punya akun</Link>
              </p>
            </>
          )}
        </div>
      </div>
      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
