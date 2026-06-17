'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import '@/styles/admin/Admin.css';

export default function AdminChapters() {
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState({ title: '', episode_no: '', webtoon_url: '', image_url: '' });
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('/api/admin/chapters').then(r => r.json()).then(setChapters);
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const { url } = await res.json();
    setForm(f => ({ ...f, image_url: url }));
    setUploading(false);
  };

  const handleSave = async () => {
    await fetch('/api/admin/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', episode_no: '', webtoon_url: '', image_url: '' });
    fetch('/api/admin/chapters').then(r => r.json()).then(setChapters);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <Link href="/admin" className="admin-back">← Dashboard</Link>
          <h1 className="admin-title">Chapitres</h1>
        </div>
      </div>

      <div className="admin-layout">
        <div className="admin-form">
          <h2 className="admin-form__title">Ajouter un chapitre</h2>

          <div className="admin-field">
            <label>Titre *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Chapitre 5 : Le réveil" />
          </div>

          <div className="admin-field">
            <label>Numéro d&apos;épisode</label>
            <input type="number" value={form.episode_no} onChange={e => setForm(f => ({ ...f, episode_no: e.target.value }))} placeholder="5" />
          </div>

          <div className="admin-field">
            <label>Lien Webtoon</label>
            <input type="text" value={form.webtoon_url} onChange={e => setForm(f => ({ ...f, webtoon_url: e.target.value }))} placeholder="https://webtoons.com/..." />
          </div>

          <div className="admin-field">
            <label>Image longue (lecture in-site)</label>
            <div
              className={`admin-dropzone ${dragging ? 'admin-dropzone--active' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="admin-dropzone__placeholder">
                {uploading ? 'Upload en cours...' : form.image_url ? '✓ Image prête' : 'Glisser l\'image longue ou cliquer'}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
            <input type="text" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Ou URL de l'image..." style={{ marginTop: '0.5rem' }} />
          </div>

          <div className="admin-form__actions">
            <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={!form.title}>
              Ajouter
            </button>
          </div>
        </div>

        <div className="admin-list">
          <h2 className="admin-form__title">{chapters.length} chapitre{chapters.length > 1 ? 's' : ''}</h2>
          {chapters.map(ch => (
            <div key={ch.id} className="admin-entry">
              <div className="admin-entry__icon">◎</div>
              <div className="admin-entry__info">
                <strong>{ch.title}</strong>
                <span>Épisode {ch.episode_no || '?'} {ch.webtoon_url ? '· Webtoon ✓' : ''} {ch.image_url ? '· Image ✓' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
