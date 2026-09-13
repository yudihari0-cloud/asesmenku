'use client';

import { useEffect, useRef, useState } from 'react';
import { api, fileToDataUri } from '@/lib/client';
import { Loading, Toast } from '@/components/ui';

/** Profil Guru & Sekolah — foto/logo/data muncul di sidebar, kartu ujian, hasil publik & export */
export default function ProfilPage() {
  const [sekolah, setSekolah] = useState(null);
  const [profil, setProfil] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const logoRef = useRef(null);
  const fotoRef = useRef(null);

  useEffect(() => {
    Promise.all([api('/api/sekolah'), api('/api/profil')])
      .then(([s, p]) => { setSekolah(s.sekolah); setProfil(p.profil); })
      .catch((e) => setMsg({ text: e.message, err: true }));
  }, []);

  async function pilihGambar(e, jenis) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setMsg({ text: 'File harus berupa gambar', err: true });
    try {
      const dataUri = await fileToDataUri(file, jenis === 'logo' ? 220 : 280, 0.78);
      if (jenis === 'logo') setSekolah((s) => ({ ...s, logo: dataUri }));
      else setProfil((p) => ({ ...p, foto: dataUri }));
    } catch {
      setMsg({ text: 'Gagal membaca gambar', err: true });
    }
    e.target.value = '';
  }

  async function simpanSekolah(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/sekolah', { method: 'PUT', body: sekolah });
      setMsg({ text: 'Data sekolah tersimpan ✅ — logo tampil di sidebar, kartu ujian & hasil publik' });
    } catch (err) { setMsg({ text: err.message, err: true }); }
    setBusy(false);
  }

  async function simpanProfil(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const j = await api('/api/profil', { method: 'PUT', body: profil });
      setProfil(j.profil);
      setMsg({ text: 'Profil guru tersimpan ✅ — data tampil di dokumen & export' });
    } catch (err) { setMsg({ text: err.message, err: true }); }
    setBusy(false);
  }

  if (!sekolah || !profil) return <div className="content"><Loading /></div>;

  return (
    <div className="content">
      <div className="mb">
        <h1>Profil & Sekolah</h1>
        <p className="muted small">Foto, logo, dan data di halaman ini otomatis muncul di sidebar, kartu ujian, halaman hasil publik, rapor, dan export Excel.</p>
      </div>

      <div className="grid2">
        {/* ===== Sekolah ===== */}
        <form className="card" onSubmit={simpanSekolah}>
          <div className="hd"><h3>🏫 Data Sekolah</h3></div>
          <div className="bd">
            <div className="row mb" style={{ gap: 14 }}>
              {sekolah.logo ? (
                <img src={sekolah.logo} alt="logo" style={{ width: 76, height: 76, borderRadius: 14, objectFit: 'cover', border: '1px solid var(--line)' }} />
              ) : (
                <div className="center" style={{ width: 76, height: 76, borderRadius: 14, background: '#f1f5f9', color: 'var(--muted)', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>belum ada<br />logo</div>
              )}
              <div>
                <label className="btn sm" style={{ cursor: 'pointer' }}>
                  🖼️ {sekolah.logo ? 'Ganti Logo' : 'Unggah Logo'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} ref={logoRef} onChange={(e) => pilihGambar(e, 'logo')} />
                </label>
                {sekolah.logo && (
                  <button type="button" className="btn danger sm" style={{ marginLeft: 6 }} onClick={() => setSekolah({ ...sekolah, logo: '' })}>Hapus</button>
                )}
                <div className="muted small mt">Disarankan logo persegi (akan dikompres otomatis).</div>
              </div>
            </div>
            <div className="field"><label className="lbl">Nama sekolah</label>
              <input className="inp" required value={sekolah.nama || ''} onChange={(e) => setSekolah({ ...sekolah, nama: e.target.value })} placeholder="mis. SMP Tunas Bangsa" />
            </div>
            <div className="field"><label className="lbl">Alamat</label>
              <input className="inp" value={sekolah.alamat || ''} onChange={(e) => setSekolah({ ...sekolah, alamat: e.target.value })} placeholder="Jl. Pendidikan No. 17, Surabaya" />
            </div>
            <button className="btn primary" disabled={busy}>💾 Simpan Data Sekolah</button>
          </div>
        </form>

        {/* ===== Guru ===== */}
        <form className="card" onSubmit={simpanProfil}>
          <div className="hd"><h3>👤 Data Guru</h3></div>
          <div className="bd">
            <div className="row mb" style={{ gap: 14 }}>
              {profil.foto ? (
                <img src={profil.foto} alt="foto guru" style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--line)' }} />
              ) : (
                <div className="center" style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(profil.nama || 'G').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
              )}
              <div>
                <label className="btn sm" style={{ cursor: 'pointer' }}>
                  📷 {profil.foto ? 'Ganti Foto' : 'Unggah Foto'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} ref={fotoRef} onChange={(e) => pilihGambar(e, 'foto')} />
                </label>
                {profil.foto && (
                  <button type="button" className="btn danger sm" style={{ marginLeft: 6 }} onClick={() => setProfil({ ...profil, foto: '' })}>Hapus</button>
                )}
                <div className="muted small mt">Foto tampil di sidebar & dokumen cetak.</div>
              </div>
            </div>
            <div className="field"><label className="lbl">Nama lengkap & gelar</label>
              <input className="inp" required value={profil.nama || ''} onChange={(e) => setProfil({ ...profil, nama: e.target.value })} placeholder="mis. Yudi Ahari Siswanto, S.Pd." />
            </div>
            <div className="grid2">
              <div className="field"><label className="lbl">NIP / NUPTK</label>
                <input className="inp mono" value={profil.nip || ''} onChange={(e) => setProfil({ ...profil, nip: e.target.value })} placeholder="mis. 19850512 201003 2 004" />
              </div>
              <div className="field"><label className="lbl">No. WhatsApp</label>
                <input className="inp" value={profil.wa || ''} onChange={(e) => setProfil({ ...profil, wa: e.target.value })} placeholder="081234567890" />
              </div>
            </div>
            <div className="field"><label className="lbl">Jabatan / bidang</label>
              <input className="inp" value={profil.jabatan || ''} onChange={(e) => setProfil({ ...profil, jabatan: e.target.value })} placeholder="mis. Guru Matematika · Wali Kelas VIII" />
            </div>
            <button className="btn primary" disabled={busy}>💾 Simpan Profil Guru</button>
          </div>
        </form>
      </div>

      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
