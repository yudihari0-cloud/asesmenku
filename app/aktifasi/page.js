'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/client';
import { Toast } from '@/components/ui';

export default function Aktifasi() {
  const [user, setUser] = useState(null);
  const [siap, setSiap] = useState(false);
  const [kode, setKode] = useState('');
  const [busy, setBusy] = useState(false);
  const [berhasil, setBerhasil] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api('/api/auth')
      .then((j) => setUser(j.user))
      .catch(() => setUser(null))
      .finally(() => setSiap(true));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const j = await api('/api/aktifasi', { method: 'POST', body: { kode } });
      setBerhasil(j);
    } catch (err) {
      setMsg({ text: err.message, err: true });
    }
    setBusy(false);
  }

  const guruLogin = user && user.role !== 'siswa';

  return (
    <div className="auth-wrap">
      <div className="auth-hero">
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>Asesmen<span>Ku</span></div>
          <h1 className="mt" style={{ marginTop: 26 }}>Aktivasi &<br />Perpanjang Masa Aktif</h1>
        </div>
        <div className="small" style={{ color: '#a5b4fc' }}>
          Satu kode aktivasi = masa aktif sekolah diperpanjang <b>1 tahun</b>. Kode didapat dari admin setelah pembelian.
        </div>
      </div>
      <div className="auth-form">
        <div className="auth-card">
          {!siap ? (
            <p className="muted center">Memuat…</p>
          ) : berhasil ? (
            <div className="card card-p center">
              <div style={{ fontSize: 44 }}>✅</div>
              <h2>Aktivasi berhasil!</h2>
              <p className="muted small">
                Masa aktif <b>{berhasil.namaSekolah}</b> kini sampai<br />
                <b style={{ color: 'var(--primary)', fontSize: 17 }}>
                  {new Date(berhasil.masaAktifSampai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </b>
              </p>
              <Link className="btn primary" href="/guru">→ Kembali ke Dashboard</Link>
            </div>
          ) : guruLogin ? (
            <>
              <h2>Perpanjang Sekolahmu</h2>
              <p className="muted small">
                Login sebagai <b>{user.nama}</b>. Masukkan kode aktivasi untuk menambah masa aktif sekolah <b>1 tahun</b>.
              </p>
              <form onSubmit={submit} className="mt">
                <div className="field"><label className="lbl">Kode aktivasi</label>
                  <input className="inp mono" required value={kode} onChange={(e) => setKode(e.target.value.toUpperCase())} placeholder="ASMT-XXXX-XXXX" style={{ letterSpacing: 1, fontSize: 17, textAlign: 'center' }} />
                </div>
                <button className="btn primary" disabled={busy} style={{ width: '100%' }}>
                  {busy ? 'Memproses…' : '🔓 Aktivasi Sekarang'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Punya Kode Aktivasi?</h2>
              <p className="muted small">
                Untuk <b>sekolah baru</b>: kode dipakai saat pendaftaran — klik tombol di bawah dan masukkan kodenya di formulir.
              </p>
              <Link className="btn primary" href="/daftar" style={{ width: '100%', textAlign: 'center' }}>🎓 Daftar Sekolah Baru dengan Kode</Link>
              <p className="muted small" style={{ marginTop: 12 }}>
                Untuk <b>perpanjangan</b>: masuk dulu dengan akun guru sekolahmu, lalu buka halaman ini lagi.
              </p>
              <Link className="btn" href="/login" style={{ width: '100%', textAlign: 'center' }}>🔑 Masuk Dulu</Link>
            </>
          )}
          <p className="muted small center" style={{ marginTop: 14 }}>
            <Link href="/">← Beranda</Link>
            {' · '}
            <Link href="https://wa.me/?text=Halo%2C%20saya%20mau%20beli%20kode%20aktivasi%20AsesmenKu" target="_blank" rel="noopener noreferrer">Beli kode via WhatsApp</Link>
          </p>
        </div>
      </div>
      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
