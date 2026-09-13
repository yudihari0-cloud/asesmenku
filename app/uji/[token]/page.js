'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, fmtDate, copyText } from '@/lib/client';
import { Loading, Toast } from '@/components/ui';
import QuestionRenderer from '@/components/QuestionRenderer';

/**
 * Halaman publik ujian siswa: /uji/TOKEN
 * Alur: info asesmen → login siswa (bila belum) → mulai → kerjakan (autosave) → submit → hasil → refleksi → leaderboard
 */
export default function UjiPage() {
  const { token } = useParams();
  const router = useRouter();
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [tokenInput, setTokenInput] = useState(token);
  const [runner, setRunner] = useState(null);
  const [idx, setIdx] = useState(0);
  const [jawaban, setJawaban] = useState({});
  const [sisa, setSisa] = useState(null);
  const [hasil, setHasil] = useState(null);
  const [refleksi, setRefleksi] = useState(null);
  const [reflDone, setReflDone] = useState(false);
  const [lb, setLb] = useState(null);
  const saveRef = useRef({});
  const submittedRef = useRef(false);

  const muat = useCallback(async () => {
    try {
      const j = await api('/api/uji/' + token);
      setInfo(j);
      if (j.runner) {
        setRunner(j.runner);
        setJawaban(j.runner.jawaban || {});
        setSisa(j.runner.sisaDetik);
      }
      if (j.hasil) setHasil(j.hasil);
      return j;
    } catch (e) {
      setErr(e.message);
      return null;
    }
  }, [token]);

  useEffect(() => { muat(); }, [muat]);

  // ----- Timer -----
  useEffect(() => {
    if (sisa == null) return;
    const t = setInterval(() => {
      setSisa((s) => {
        if (s == null) return s;
        if (s <= 1) { clearInterval(t); if (!submittedRef.current) submit(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sisa == null]);

  // ----- Autosave -----
  useEffect(() => {
    if (!runner) return;
    const t = setTimeout(() => {
      api('/api/uji/' + token, { method: 'POST', body: { action: 'save', jawaban } }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [jawaban, runner, token]);

  async function doLogin(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/auth', { method: 'POST', body: login });
      const j = await muat();
      if (j?.blokir) setErr(j.blokir);
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  async function mulai() {
    setBusy(true);
    try {
      await api('/api/uji/' + token, { method: 'POST', body: { action: 'start', tokenInput: tokenInput.toUpperCase() } });
      submittedRef.current = false;
      setHasil(null);
      const j = await muat();
      if (!j?.runner && !j?.blokir) setErr('Gagal memulai — muat ulang halaman.');
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  async function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setBusy(true);
    try {
      const r = await api('/api/uji/' + token, { method: 'POST', body: { action: 'submit', attemptId: runner?.attemptId } });
      setHasil(r);
      setRunner(null);
      if (r.tampilkanHasil === false) setHasil({ ...r, tersembunyi: true });
      await muat();
    } catch (e2) { setErr(e2.message); submittedRef.current = false; }
    setBusy(false);
  }

  async function kirimRefleksi() {
    setBusy(true);
    try {
      await api('/api/uji/' + token, { method: 'POST', body: { action: 'refleksi', jawaban: refleksi || {} } });
      setReflDone(true);
      setMsg({ text: 'Refleksi terkirim — terima kasih! 🙏' });
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  const [msg, setMsg] = useState(null);

  async function lihatLeaderboard() {
    try {
      const j = await api('/api/uji/' + token + '?lb=1');
      setLb(j);
    } catch (e2) { setErr(e2.message); }
  }

  if (err && !info) {
    return (
      <div className="content" style={{ maxWidth: 560, margin: '60px auto' }}>
        <div className="card card-p center">
          <div style={{ fontSize: 44 }}>😕</div>
          <h2>Ups</h2>
          <p className="muted">{err}</p>
          <button className="btn" onClick={() => router.push('/')}>← Kembali</button>
        </div>
      </div>
    );
  }
  if (!info) return <div className="content"><Loading text="Memuat asesmen…" /></div>;

  const a = info.asesmen;
  const sisaFmt = sisa != null ? `${String(Math.floor(sisa / 60)).padStart(2, '0')}:${String(sisa % 60).padStart(2, '0')}` : '';

  // ================== HASIL ==================
  if (hasil && !runner) {
    return (
      <div className="content" style={{ maxWidth: 680, margin: '30px auto' }}>
        <div className="card card-p center">
          <div style={{ fontSize: 52 }}>{hasil.tersembunyi ? '📨' : skorEmoji(hasil.skorAkhir ?? hasil.skorObjektif)}</div>
          <h1>{hasil.tersembunyi ? 'Jawaban terkumpul!' : hasil.adaEssay ? 'Selesai! Skor sementara:' : 'Selesai! Skor akhirmu:'}</h1>
          {!hasil.tersembunyi && (
            <div style={{ fontSize: 46, fontWeight: 800, color: (hasil.skorAkhir ?? hasil.skorObjektif ?? 0) >= 75 ? 'var(--green)' : 'var(--amber)' }}>
              {hasil.skorAkhir ?? hasil.skorObjektif ?? '—'}
            </div>
          )}
          {hasil.adaEssay && !hasil.tersembunyi && (
            <p className="muted small">Skor di atas baru mencakup soal objektif + essay yang sudah dikoreksi. Skor akhir bisa berubah setelah guru mengoreksi seluruh essay.</p>
          )}
          {hasil.tersembunyi && <p className="muted small">Guru memilih untuk tidak menampilkan skor langsung. Skor akan muncul di halaman ini setelah dinilai.</p>}
          <div className="row mt" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={lihatLeaderboard}>🏆 Lihat Leaderboard</button>
            <button className="btn" onClick={() => router.push('/siswa')}>🏠 Beranda</button>
          </div>
        </div>

        {/* Refleksi */}
        {info.asesmen.refleksiQs?.length > 0 && !reflDone && !hasRefleksi(info) && (
          <div className="card mt">
            <div className="hd"><h3>🪞 Refleksi Diri</h3></div>
            <div className="bd">
              <p className="muted small">Ceritakan pengalamanmu — jawaban ini hanya dibaca gurumu untuk membantumu belajar.</p>
              {info.asesmen.refleksiQs.map((q, qi) => (
                <div className="field" key={qi}>
                  <label className="lbl">{qi + 1}. {q}</label>
                  <textarea className="ta" value={(refleksi || {})['q' + qi] || ''} onChange={(e) => setRefleksi({ ...(refleksi || {}), ['q' + qi]: e.target.value })} />
                </div>
              ))}
              <button className="btn primary" disabled={busy} onClick={kirimRefleksi}>Kirim Refleksi</button>
            </div>
          </div>
        )}
        {reflDone && <div className="card card-p mt center muted small">✅ Refleksi sudah terkirim.</div>}

        {/* Leaderboard */}
        {lb && (
          <div className="card mt">
            <div className="hd"><h3>🏆 Leaderboard</h3>{lb.anonim && <span className="badge b-gray">mode anonim</span>}</div>
            <div className="bd" style={{ padding: 0 }}>
              {lb.leaderboard.map((r) => (
                <div key={r.siswaId + r.peringkat} className={`lb-row ${r.peringkat <= 3 ? 'top3' : ''} ${r.kamu ? 'kamu' : ''}`}>
                  <div className="lb-rank">{['🥇', '🥈', '🥉'][r.peringkat - 1] || r.peringkat}</div>
                  <div className="lb-nama">{r.kamu ? <><b>{r.nama}</b> <span className="badge b-violet">kamu</span></> : r.nama}</div>
                  <div className="lb-skor">{r.skor}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================== PENGERJAAN ==================
  if (runner) {
    const soal = runner.soal;
    const s = soal[idx];
    const terisi = soal.filter((so) => terjawab((jawaban || {})[so.id], so)).length;
    return (
      <div className="content" style={{ maxWidth: 820, margin: '0 auto' }}>
        <div className="row spread mb" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg)', padding: '10px 0' }}>
          <div>
            <b>{a.judul}</b>
            <div className="muted small">Terjawab {terisi}/{soal.length}</div>
          </div>
          <div className="row">
            <div className={`timer ${sisa != null && sisa < 300 ? 'warn' : ''}`}>⏱ {sisaFmt}</div>
            <button className="btn green" disabled={busy} onClick={() => { if (confirm(`Kumpulkan jawaban sekarang? (${terisi}/${soal.length} terjawab)`)) submit(); }}>🚀 Kumpulkan</button>
          </div>
        </div>

        <div className="card card-p mb">
          <div className="qnav">
            {soal.map((so, i) => (
              <button key={so.id} className={`${terjawab((jawaban || {})[so.id], so) ? 'isi' : ''} ${i === idx ? 'kini' : ''}`} onClick={() => setIdx(i)}>{i + 1}</button>
            ))}
          </div>
        </div>

        {s && (
          <div className="qcard">
            <div className="row spread">
              <b><span className="no">{idx + 1}</span>{labelTipe(s.tipe)}</b>
              <span className="pill">skor {s.skor}</span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{s.pertanyaan}</p>
            <QuestionRenderer
              soal={s}
              nilai={(jawaban || {})[s.id]}
              onChange={(v) => setJawaban((j) => ({ ...j, [s.id]: v }))}
              kanan={s.kanan}
              kananIds={s.kananIds}
            />
          </div>
        )}

        <div className="row spread mt">
          <button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Sebelumnya</button>
          {idx < soal.length - 1
            ? <button className="btn primary" onClick={() => setIdx(idx + 1)}>Berikutnya →</button>
            : <button className="btn green" onClick={() => { if (confirm('Ini soal terakhir. Kumpulkan sekarang?')) submit(); }}>🚀 Kumpulkan</button>}
        </div>
      </div>
    );
  }

  // ================== INFO / MASUK ==================
  return (
    <div className="content" style={{ maxWidth: 640, margin: '30px auto' }}>
      <div className="card">
        <div className="bd">
          <div className="row spread">
            <span className="badge b-violet mono">TOKEN {a.judul && token}</span>
            <button className="btn ghost sm" onClick={() => router.push(info.viewer ? '/siswa' : '/')}>← {info.viewer ? 'Beranda' : 'Beranda'}</button>
          </div>
          <h1 className="mt">{a.judul}</h1>
          <div className="kv mt">
            <b>Mata pelajaran</b><span>{a.mapel}</span>
            <b>Guru</b><span>{a.guru}</span>
            <b>Jumlah soal</b><span>{a.jumlahSoal}</span>
            <b>Durasi</b><span>{a.durasiMenit} menit</span>
            <b>Ada essay</b><span>{a.adaEssay ? 'Ya (dikoreksi guru setelah dikumpulkan)' : 'Tidak — nilai otomatis'}</span>
            <b>Berakhir</b><span>{a.tutup ? fmtDate(a.tutup) : 'tanpa batas jadwal'}</span>
          </div>

          {info.blokir ? (
            <div className="card card-p mt" style={{ background: 'var(--amber-soft)' }}>⚠️ {info.blokir}</div>
          ) : !info.viewer ? (
            <form onSubmit={doLogin} className="mt">
              <hr className="hr" />
              <h3>🔐 Login Siswa</h3>
              <p className="muted small">Masuk dengan NISN & password (bawaan: <b>123456</b> atau minta ke gurumu).</p>
              <div className="grid2">
                <div className="field"><label className="lbl">NISN</label><input className="inp mono" required value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} /></div>
                <div className="field"><label className="lbl">Password</label><input className="inp" type="password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /></div>
              </div>
              <button className="btn primary" disabled={busy}>{busy ? 'Memproses…' : 'Masuk'}</button>
            </form>
          ) : (
            <div className="mt">
              <hr className="hr" />
              <p> Halo, <b>{info.viewer.nama}</b>! Siap mengerjakan? Timer mulai berjalan saat kamu menekan tombol mulai.</p>
              {a.adaEssay && <p className="small muted">⚠️ Asesmen ini memuat essay — jawab dengan kalimatmu sendiri, guru akan mengoreksinya.</p>}
              <div className="field"><label className="lbl">Konfirmasi token ujian</label>
                <input className="inp mono" style={{ textTransform: 'uppercase', maxWidth: 220 }} value={tokenInput} onChange={(e) => setTokenInput(e.target.value.toUpperCase())} />
              </div>
              <button className="btn green" style={{ fontSize: 16, padding: '12px 26px' }} disabled={busy} onClick={mulai}>{busy ? 'Menyiapkan soal…' : '▶️ Mulai Mengerjakan'}</button>
            </div>
          )}
        </div>
      </div>
      {info.hasil && (
        <div className="card card-p mt center">
          <b>Kamu sudah menyelesaikan asesmen ini.</b>
          <div className="muted small mt">Skor: <b>{info.hasil.skorAkhir ?? info.hasil.skorObjektif ?? '—'}</b> {info.hasil.status === 'selesai' && '(menunggu koreksi essay)'}</div>
          <button className="btn sm mt" onClick={lihatLeaderboard}>🏆 Leaderboard</button>
          {lb && (
            <div className="card mt" style={{ textAlign: 'left' }}>
              <div className="bd" style={{ padding: 0 }}>
                {lb.leaderboard.map((r) => (
                  <div key={r.siswaId + r.peringkat} className={`lb-row ${r.kamu ? 'kamu' : ''}`}>
                    <div className="lb-rank">{['🥇', '🥈', '🥉'][r.peringkat - 1] || r.peringkat}</div>
                    <div className="lb-nama">{r.kamu ? <><b>{r.nama}</b> <span className="badge b-violet">kamu</span></> : r.nama}</div>
                    <div className="lb-skor">{r.skor}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <Toast msg={err ? { text: err, err: true } : msg} onDone={() => { setErr(null); setMsg(null); }} />
    </div>
  );
}

function labelTipe(t) {
  return { PG: 'Pilihan Ganda', BS: 'Benar / Salah', MENJODOKAN: 'Menjodohkan', ESSAY: 'Essay (jawaban uraian)' }[t] || t;
}
function terjawab(v, soal) {
  if (soal.tipe === 'MENJODOKAN') return v && Object.keys(v).length > 0;
  return v !== undefined && v !== null && v !== '';
}
function skorEmoji(s) {
  if (s == null) return '📨';
  if (s >= 90) return '🏆';
  if (s >= 75) return '🎉';
  if (s >= 60) return '🙂';
  return '💪';
}
