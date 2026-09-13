'use client';

import { useEffect } from 'react';

/** Komponen UI kecil yang dipakai lintas halaman */

export function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return <div className={`toast ${msg.err ? 'err' : ''}`}>{msg.text}</div>;
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={wide ? { maxWidth: 860 } : undefined}>
        <div className="hd">
          <h3>{title}</h3>
          <button className="btn ghost sm" onClick={onClose}>✕ Tutup</button>
        </div>
        <div className="bd">{children}</div>
      </div>
    </div>
  );
}

export function Loading({ text = 'Memuat data…' }) {
  return (
    <div className="empty">
      <div><span className="spin" /></div>
      <p className="muted">{text}</p>
    </div>
  );
}

export function Empty({ icon = '🗂️', text = 'Belum ada data' }) {
  return (
    <div className="empty">
      <div className="big">{icon}</div>
      <p>{text}</p>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    publik: ['b-green', '● Publik'],
    draft: ['b-gray', '○ Draf'],
    ditutup: ['b-red', '■ Ditutup'],
    dinilai: ['b-green', 'Dinilai'],
    selesai: ['b-amber', 'Menunggu koreksi'],
    berlangsung: ['b-blue', 'Sedang ujian'],
    belum: ['b-gray', 'Belum ikut'],
    Tuntas: ['b-green', 'Tuntas'],
    'Belum tuntas': ['b-red', 'Belum tuntas'],
    'Menunggu koreksi essay': ['b-amber', 'Menunggu koreksi essay'],
    'Belum mengikuti': ['b-gray', 'Belum mengikuti'],
  };
  const [cls, label] = map[status] || ['b-gray', status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
