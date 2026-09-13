'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, fmtDate, copyText, waLink, BENTUK_LABEL } from '@/lib/client';
import { Loading, Empty, Toast, StatusBadge } from '@/components/ui';

const TABS = [
  ['ringkasan', '🔗 Link & Pengaturan'],
  ['soal', '🗃️ Paket Soal'],
  ['koreksi', '✍️ Koreksi Essay'],
  ['rekap', '📊 Rekap & Analisis'],
  ['leaderboard', '🏆 Leaderboard'],
  ['refleksi', '🪞 Refleksi'],
];

export default function AsesmenDetail() {
  const { id: aid } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('ringkasan');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(null);
  const [skorDraft, setSkorDraft] = useState({});
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);

  const load = useCallback(async () => {
    const j = await api('/api/asesmen/' + aid);
    setData(j);
    setForm({
      judul: j.asesmen.judul, token: j.asesmen.token, durasiMenit: j.asesmen.durasiMenit,
      kktp: j.asesmen.kktp, buka: (j.asesmen.buka || '').slice(0, 16), tutup: (j.asesmen.tutup || '').slice(0, 16),
      acakSoal: j.asesmen.acakSoal, acakOpsi: j.asesmen.acakOpsi, tampilkanHasil: j.asesmen.tampilkanHasil,
      anonimLeaderboard: j.asesmen.anonimLeaderboard,
    });
  }, [aid]);

  useEffect(() => { load().catch((e) => setMsg({ text: e.message, err: true })); }, [load]);

  async function aksi(body, teks) {
    setBusy(true);
    try {
      await api('/api/asesmen/' + aid, { method: 'POST', body });
      if (teks) setMsg({ text: teks });
      await load();
    } catch (e) { setMsg({ text: e.message, err: true }); }
    setBusy(false);
  }

  async function simpanGrade(attemptId) {
    const scores = skorDraft[attemptId];
    if (!scores) return setMsg({ text: 'Tidak ada perubahan skor' });
    await aksi({ action: 'grade', attemptId, scores }, 'Nilai essay tersimpan — skor akhir diperbarui ✅');
    setSkorDraft((s) => ({ ...s, [attemptId]: undefined }));
  }

  if (!data || !form) return <div className="content"><Loading /></div>;
  const { asesmen, kisi, soal, rekap, koreksi, leaderboard, refleksi, link } = data;
  const menungguKoreksi = koreksi.filter((k) => k.status === 'selesai');

  function simpanPengaturan() {
    aksi({
      action: 'update',
      ...form,
      buka: form.buka ? new Date(form.buka).toISOString() : '',
      tutup: form.tutup ? new Date(form.tutup).toISOString() : '',
    }, 'Pengaturan disimpan ✅');
  }

  return (
    <div className="content">
      <div className="row spread mb">
        <div>
          <div className="row">
            <h1 style={{ marginBottom: 0 }}>{asesmen.judul}</h1> <StatusBadge status={asesmen.status} />
          </div>
          <p className="muted small">Token <b className="mono">{asesmen.token}</b> · {asesmen.durasiMenit} menit · KKTP {asesmen.kktp} · {kisi?.judul || 'tanpa kisi'}</p>
        </div>
        <div className="row">
          {asesmen.status !== 'publik' && <button className="btn green" disabled={busy} onClick={() => aksi({ action: 'publish' }, 'Asesmen dipublikasikan 🎉')}>🚀 Publikasikan</button>}
          {asesmen.status === 'publik' && <button className="btn danger" disabled={busy} onClick={() => aksi({ action: 'tutup' }, 'Asesmen ditutup')}>⏹ Tutup Ujian</button>}
          <a className="btn" href={`/guru/asesmen/${aid}/kartu`}>🖨 Kartu Ujian</a>
          <a className="btn" href={`/api/asesmen/${aid}?export=rekap`}>⬇️ Export Rekap Excel</a>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(([idv, label]) => (
          <button key={idv} className={`tab ${tab === idv ? 'active' : ''}`} onClick={() => setTab(idv)}>
            {label}{idv === 'koreksi' && menungguKoreksi.length ? ` (${menungguKoreksi.length})` : ''}
          </button>
        ))}
      </div>

      {/* ============ TAB RINGKASAN ============ */}
      {tab === 'ringkasan' && (
        <div className="grid2">
          <div className="card">
            <div className="hd"><h3>🔗 Bagikan ke Siswa</h3></div>
            <div className="bd">
              <p className="small muted">Bagikan tautan ini (atau QR/token) — siswa login dengan NISN & password, lalu langsung mengerjakan.</p>
              <div className="linkbox mb">
                <code>{link}</code>
                <button className="btn sm primary" onClick={() => { copyText(link); setMsg({ text: 'Link dikopi ✅' }); }}>📋 Copy</button>
              </div>
              <div className="row mb">
                <a
                  className="btn green sm"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={waLink(
                    `📢 *ASESMEN ONLINE*\n\n${asesmen.judul}\n${kisi?.mapel && kisi.mapel !== '-' ? 'Mapel: ' + kisi.mapel + '\n' : ''}Token: *${asesmen.token}*\nDurasi: ${asesmen.durasiMenit} menit\n\nBuka link:\n${link}\n\nLogin dengan NISN & password dari guru.${asesmen.tutup ? '\nTutup: ' + fmtDate(asesmen.tutup) : ''}`
                  )}
                >📱 Bagikan via WhatsApp</a>
              </div>
              <div className="linkbox mb">
                <code>{origin}/bagikan/{asesmen.token}</code>
                <button className="btn sm primary" onClick={() => { copyText(origin + '/bagikan/' + asesmen.token); setMsg({ text: 'Link hasil dikopi ✅' }); }}>📋 Copy</button>
                <a className="btn sm" href={`/bagikan/${asesmen.token}`} target="_blank" rel="noopener noreferrer">🔓 Buka</a>
              </div>
              <p className="muted small mb">Link publik <b>hasil asesmen</b> (rekap nilai, leaderboard, analisis butir) — <b>tanpa perlu login</b>, cocok dibagikan ke kepala sekolah / wali murid.{asesmen.anonimLeaderboard ? ' Mode anonim aktif.' : ''} Bisa langsung dicetak/PDF dari halamannya.</p>
              <div className="row" style={{ alignItems: 'stretch' }}>
                <div className="center" style={{ flexShrink: 0 }}>
                  <img src={'/api/qr?text=' + encodeURIComponent(link) + '&size=150'} width={140} height={140} alt="QR Code link asesmen" style={{ borderRadius: 12, border: '1px solid var(--line)' }} />
                  <div className="muted small">Scan untuk membuka</div>
                </div>
                <div className="card card-p center" style={{ flex: 1 }}>
                  <div className="muted small">Token Ujian</div>
                  <div className="mono" style={{ fontSize: 30, fontWeight: 800, color: 'var(--primary)' }}>{asesmen.token}</div>
                </div>
                <div className="card card-p" style={{ flex: 2 }}>
                  <div className="kv">
                    <b>Jumlah soal</b><span>{soal.length}</span>
                    <b>Ada essay</b><span>{soal.some((s) => s.tipe === 'ESSAY') ? 'Ya — perlu koreksi guru' : 'Tidak — dinilai penuh otomatis'}</span>
                    <b>Peserta</b><span>{rekap.ringkas.jumlahPeserta} / {rekap.ringkas.jumlahSiswa} siswa</span>
                    <b>Rata-rata</b><span>{rekap.ringkas.rata ?? '—'}</span>
                    <b>Tuntas (≥{asesmen.kktp})</b><span>{rekap.ringkas.tuntas} siswa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="hd"><h3>⚙️ Pengaturan</h3></div>
            <div className="bd">
              <div className="field"><label className="lbl">Judul</label><input className="inp" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} /></div>
              <div className="grid2">
                <div className="field"><label className="lbl">Token</label><input className="inp mono" value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} /></div>
                <div className="field"><label className="lbl">Durasi (menit)</label><input className="inp" type="number" value={form.durasiMenit} onChange={(e) => setForm({ ...form, durasiMenit: e.target.value })} /></div>
              </div>
              <div className="grid2">
                <div className="field"><label className="lbl">Jadwal buka (opsional)</label><input className="inp" type="datetime-local" value={form.buka} onChange={(e) => setForm({ ...form, buka: e.target.value })} /></div>
                <div className="field"><label className="lbl">Jadwal tutup (opsional)</label><input className="inp" type="datetime-local" value={form.tutup} onChange={(e) => setForm({ ...form, tutup: e.target.value })} /></div>
              </div>
              <div className="field"><label className="lbl">KKTP — Kriteria Ketercapaian TP</label><input className="inp" type="number" min="0" max="100" value={form.kktp} onChange={(e) => setForm({ ...form, kktp: e.target.value })} /></div>
              <div className="row mb small" style={{ gap: 14 }}>
                <label className="row" style={{ gap: 6 }}><input type="checkbox" checked={!!form.acakSoal} onChange={(e) => setForm({ ...form, acakSoal: e.target.checked })} /> Acak soal</label>
                <label className="row" style={{ gap: 6 }}><input type="checkbox" checked={!!form.tampilkanHasil} onChange={(e) => setForm({ ...form, tampilkanHasil: e.target.checked })} /> Tampilkan skor ke siswa</label>
                <label className="row" style={{ gap: 6 }}><input type="checkbox" checked={!!form.anonimLeaderboard} onChange={(e) => setForm({ ...form, anonimLeaderboard: e.target.checked })} /> Leaderboard anonim</label>
              </div>
              <div className="row">
                <button className="btn primary" disabled={busy} onClick={simpanPengaturan}>💾 Simpan Pengaturan</button>
                <button className="btn" disabled={busy} onClick={() => aksi({ action: 'compose' }, 'Paket soal disusun ulang dari kisi-kisi')}>🔄 Susun ulang soal otomatis</button>
                <button className="btn danger" disabled={busy} onClick={() => { if (confirm('Hapus asesmen beserta seluruh hasil?')) api('/api/asesmen/' + aid, { method: 'DELETE' }).then(() => (window.location.href = '/guru/asesmen')); }}>🗑 Hapus asesmen</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ TAB SOAL ============ */}
      {tab === 'soal' && (
        <div className="card">
          <div className="hd">
            <h3>🗃️ Paket Soal ({soal.length})</h3>
            <div className="row">
              <button className="btn sm" disabled={busy} onClick={() => aksi({ action: 'compose' }, 'Paket soal disusun ulang')}>🔄 Susun otomatis dari kisi</button>
              <a className="btn sm primary" href={kisi ? `/guru/soal?kisiId=${kisi.id}` : '/guru/soal'}>+ Tulis soal di Bank Soal</a>
            </div>
          </div>
          {soal.length === 0 ? (
            <div className="bd"><Empty icon="🗃️" text="Paket masih kosong. Tulis soal di Bank Soal (tautkan ke indikator kisi-kisi), lalu klik 'Susun otomatis dari kisi'." /></div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>#</th><th>Soal</th><th>Bentuk</th><th>Skor</th><th>Indikator</th><th className="right">Aksi</th></tr></thead>
                <tbody>
                  {soal.map((s, i) => {
                    const item = kisi?.items?.find((it) => it.id === s.kisiItemId);
                    return (
                      <tr key={s.id}>
                        <td>{i + 1}</td>
                        <td style={{ maxWidth: 340 }}><b>{s.pertanyaan.slice(0, 100)}{s.pertanyaan.length > 100 ? '…' : ''}</b></td>
                        <td><span className="badge b-violet">{BENTUK_LABEL[s.tipe]}</span></td>
                        <td>{s.skor}</td>
                        <td className="muted small" style={{ maxWidth: 220 }}>{item ? item.indikator.slice(0, 80) + (item.indikator.length > 80 ? '…' : '') : '—'}</td>
                        <td className="aksi"><button className="btn danger sm" onClick={() => aksi({ action: 'hapusSoal', soalId: s.id }, 'Soal dikeluarkan dari paket')}>Keluarkan</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============ TAB KOREKSI ============ */}
      {tab === 'koreksi' && (
        <div>
          <p className="muted small mb">Soal PG, benar/salah, dan menjodohkan sudah dinilai otomatis. Di sini guru mengoreksi essay memakai rubrik, lalu skor akhir dihitung ulang otomatis.</p>
          {koreksi.length === 0 && <div className="card"><div className="bd"><Empty icon="✍️" text="Belum ada siswa yang mengerjakan." /></div></div>}
          {koreksi.map((k) => (
            <div className="card mb" key={k.attemptId}>
              <div className="hd">
                <div className="row">
                  <b>{k.nama}</b>
                  <StatusBadge status={k.status} />
                  {k.skorAkhir != null && <span className="badge b-violet">Akhir: {k.skorAkhir}</span>}
                  {k.skorObjektif != null && <span className="muted small">Objektif {k.skorObjektif} · Essay {k.skorEssay ?? 'belum'}</span>}
                </div>
                {k.essays.length > 0 && (
                  <button className="btn primary sm" disabled={busy || !skorDraft[k.attemptId]} onClick={() => simpanGrade(k.attemptId)}>💾 Simpan Nilai Essay</button>
                )}
              </div>
              {k.essays.length === 0 ? (
                <div className="bd small muted">Tidak ada soal essay dalam asesmen ini — attempt dinilai otomatis penuh.</div>
              ) : (
                <div className="bd">
                  {k.essays.map((es) => {
                    const draft = skorDraft[k.attemptId]?.[es.soalId];
                    const nilai = draft !== undefined ? draft : es.skor;
                    return (
                      <div key={es.soalId} className="qcard">
                        <div className="row spread">
                          <b className="small">{es.pertanyaan}</b>
                          <span className="pill">max {es.skorMax}</span>
                        </div>
                        <div className="card card-p mt" style={{ background: '#f8fafc' }}>
                          <div className="small muted mb">Jawaban siswa:</div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{es.jawaban}</div>
                        </div>
                        <div className="row mt">
                          <span className="small muted">Rubrik: {es.rubrik || '—'}</span>
                        </div>
                        <div className="row mt">
                          <label className="lbl" style={{ margin: 0 }}>Skor:</label>
                          <input className="inp" type="number" min="0" max={es.skorMax} style={{ width: 90 }} value={nilai}
                            onChange={(e) => setSkorDraft((s) => ({ ...s, [k.attemptId]: { ...(s[k.attemptId] || {}), [es.soalId]: e.target.value } }))} />
                          <span className="muted small">/ {es.skorMax}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ============ TAB REKAP ============ */}
      {tab === 'rekap' && (
        <div>
          <div className="stat mb">
            <div className="st"><div className="num">{rekap.ringkas.jumlahPeserta}/{rekap.ringkas.jumlahSiswa}</div><div className="lbl">Peserta</div></div>
            <div className="st"><div className="num">{rekap.ringkas.rata ?? '—'}</div><div className="lbl">Rata-rata</div></div>
            <div className="st"><div className="num">{rekap.ringkas.tuntas}</div><div className="lbl">Tuntas (≥{asesmen.kktp})</div></div>
            <div className="st"><div className="num">{rekap.ringkas.menungguKoreksi}</div><div className="lbl">Menunggu koreksi essay</div></div>
          </div>
          <p className="muted small mb">💡 Klik nama siswa untuk membuka <b>Rapor Mini</b>: nilai lintas asesmen, tren perkembangan, dan penguasaan indikator.</p>
          <div className="card mb">
            <div className="hd"><h3>📊 Nilai per Siswa</h3>
              <div className="row">
                <button className="btn sm no-print" onClick={() => window.print()}>🖨 Cetak</button>
                <a className="btn sm" href={`/api/asesmen/${aid}?export=rekap`}>⬇️ Excel</a>
              </div>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>#</th><th>Nama</th><th>NISN</th><th>Kelas</th><th>Skor</th><th>Status</th></tr></thead>
                <tbody>
                  {rekap.rows.map((r, i) => (
                    <tr key={r.siswaId}>
                      <td>{i + 1}</td><td><Link href={`/guru/rapor/${r.siswaId}`}><b>{r.nama}</b></Link></td><td className="mono">{r.nisn}</td><td>{r.kelas}</td>
                      <td><b style={{ color: r.skor != null && r.skor >= asesmen.kktp ? 'var(--green)' : r.skor != null ? 'var(--red)' : 'inherit' }}>{r.skor ?? '—'}</b></td>
                      <td><StatusBadge status={r.statusLabel} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="hd"><h3>🧭 Penguasaan Kelas per Indikator (→ CP)</h3></div>
            <div className="bd">
              {rekap.mastery.length === 0 && <Empty icon="🧭" text="Belum ada data." />}
              {rekap.mastery.map((m) => (
                <div key={m.itemId} className="mb">
                  <div className="row spread small">
                    <span><b>{m.indikator}</b> <span className="pill">{m.level}</span> <span className="pill">{BENTUK_LABEL[m.bentuk] || m.bentuk}</span></span>
                    <span className={`badge ${m.persen >= 75 ? 'b-green' : m.persen >= 50 ? 'b-amber' : 'b-red'}`}>{m.persen}% · {m.kategori}</span>
                  </div>
                  <div className="bar mt"><i className={m.persen >= 75 ? '' : m.persen >= 50 ? 'kuning' : 'merah'} style={{ width: m.persen + '%' }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="hd">
              <h3>🔬 Analisis Butir Soal</h3>
              <span className="muted small">P = tingkat kesukaran (0–1) · D = daya beda · hijau pada sebaran = kunci</span>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>#</th><th>Soal</th><th>Tipe</th><th>N</th><th>P</th><th>Kesukaran</th><th>D</th><th>Daya Beda</th><th>Sebaran Jawaban</th></tr></thead>
                <tbody>
                  {butir.map((b, i) => (
                    <tr key={b.soalId}>
                      <td>{i + 1}</td>
                      <td style={{ maxWidth: 260 }} className="small"><b>{b.pertanyaan.slice(0, 70)}{b.pertanyaan.length > 70 ? '…' : ''}</b></td>
                      <td className="small">{BENTUK_LABEL[b.tipe] || b.tipe}</td>
                      <td>{b.N}</td>
                      <td>{b.P ?? '—'}</td>
                      <td><span className={`badge ${b.P == null ? 'b-gray' : b.P >= 0.71 ? 'b-green' : b.P >= 0.31 ? 'b-amber' : 'b-red'}`}>{b.kesukaran}</span></td>
                      <td>{b.D ?? '—'}</td>
                      <td><span className={`badge ${b.D == null ? 'b-gray' : b.D >= 0.4 ? 'b-green' : b.D >= 0.2 ? 'b-amber' : 'b-red'}`}>{b.dayaBeda}</span></td>
                      <td className="small">
                        {b.pengecoh ? Object.entries(b.pengecoh.dist).map(([L, n]) => (
                          <span key={L} className={`badge ${L === b.pengecoh.kunci ? 'b-green' : 'b-gray'}`} style={{ marginRight: 4 }}>{L}:{n}</span>
                        )) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bd small muted">
              Interpretasi: <b>P ≥ 0,71</b> mudah · <b>0,30–0,70</b> sedang · <b>≤ 0,29</b> sukar — <b>D ≥ 0,40</b> baik · <b>0,20–0,39</b> cukup · <b>&lt; 0,20</b> kurang (pertimbangkan revisi butir/pengecoh).
            </div>
          </div>
        </div>
      )}

      {/* ============ TAB LEADERBOARD ============ */}
      {tab === 'leaderboard' && (
        <div className="card">
          <div className="hd">
            <h3>🏆 Leaderboard</h3>
            <span className="muted small">{asesmen.anonimLeaderboard ? 'Mode anonim aktif' : 'Nama ditampilkan'}</span>
          </div>
          <div className="bd" style={{ padding: 0 }}>
            {leaderboard.length === 0 ? <div className="empty">Belum ada peserta selesai.</div> : leaderboard.map((r) => (
              <div key={r.attemptId} className={`lb-row ${r.peringkat <= 3 ? 'top3' : ''}`}>
                <div className="lb-rank">{r.medali || r.peringkat}</div>
                <div className="lb-nama">{r.nama} {r.essayPending && <span className="badge b-amber">+ essay</span>}</div>
                <div className="lb-skor">{r.skor}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ TAB REFLEKSI ============ */}
      {tab === 'refleksi' && (
        <div>
          <p className="muted small mb">Jawaban refleksi siswa setelah mengerjakan asesmen — masukan untuk pembelajaran berikutnya.</p>
          {refleksi.every((r) => r.jawaban.length === 0) && <div className="card"><div className="bd"><Empty icon="🪞" text="Belum ada refleksi masuk." /></div></div>}
          {refleksi.map((r, qi) => (
            <div className="card mb" key={qi}>
              <div className="hd"><h3 className="small" style={{ margin: 0 }}>❓ {r.q}</h3><span className="pill">{r.jawaban.length} jawaban</span></div>
              <div className="bd">
                {r.jawaban.length === 0 && <span className="muted small">Belum ada.</span>}
                {r.jawaban.map((j, i) => (
                  <div key={i} className="mb small" style={{ borderBottom: '1px dashed var(--line)', paddingBottom: 8 }}>
                    <b>{j.nama}</b> <span className="muted">· {fmtDate(j.waktu)}</span>
                    <div>{j.jawaban}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast msg={msg} onDone={() => setMsg(null)} />
    </div>
  );
}
