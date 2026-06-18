'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import '@/styles/admin/Admin.css';

export default function AdminChapters() {
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState({ title: '', episode_no: '', webtoon_url: '' });
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadChapters = () => fetch('/api/admin/chapters').then(r => r.json()).then(data => {
    setChapters(data);
    if (selectedChapter) {
      const updated = data.find(c => c.id === selectedChapter.id);
      if (updated) setSelectedChapter(updated);
    }
  });

  useEffect(() => { loadChapters(); }, []);

  const handleCreate = async () => {
    const r = await fetch('/api/admin/chapters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const newCh = await r.json();
    setForm({ title: '', episode_no: '', webtoon_url: '' });
    await loadChapters();
    setSelectedChapter(newCh);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce chapitre ?')) return;
    await fetch(`/api/admin/chapters?id=${id}`, { method: 'DELETE' });
    setSelectedChapter(null);
    loadChapters();
  };

  const handleUploadImage = async (file) => {
    if (!file || !selectedChapter) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const { url } = await res.json();
    await fetch(`/api/admin/chapters/${selectedChapter.id}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, sort_order: selectedChapter.images?.length || 0 }),
    });
    setUploading(false);
    loadChapters();
  };

  const handleAddImageUrl = async (url) => {
    if (!url || !selectedChapter) return;
    await fetch(`/api/admin/chapters/${selectedChapter.id}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, sort_order: selectedChapter.images?.length || 0 }),
    });
    loadChapters();
  };

  const handleDeleteImage = async (imageId) => {
    await fetch(`/api/admin/chapters/${selectedChapter.id}/images?image_id=${imageId}`, { method: 'DELETE' });
    loadChapters();
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div><Link href="/admin" className="admin-back">← Dashboard</Link><h1 className="admin-title">Chapitres</h1></div>
      </div>

      <div className="admin-layout">
        {/* Formulaire création */}
        <div className="admin-form">
          <h2 className="admin-form__title">Nouveau chapitre</h2>
          <div className="admin-field"><label>Titre *</label><input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Chapitre 5 : Le réveil" /></div>
          <div className="admin-field"><label>Numéro</label><input type="number" value={form.episode_no} onChange={e => setForm(f => ({ ...f, episode_no: e.target.value }))} /></div>
          <div className="admin-field"><label>Lien Webtoon</label><input type="text" value={form.webtoon_url} onChange={e => setForm(f => ({ ...f, webtoon_url: e.target.value }))} placeholder="https://webtoons.com/..." /></div>
          <div className="admin-form__actions"><button className="admin-btn admin-btn--primary" onClick={handleCreate} disabled={!form.title}>Créer</button></div>

          {/* Gestion images du chapitre sélectionné */}
          {selectedChapter && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(78,205,196,0.1)', paddingTop: '1.5rem' }}>
              <h2 className="admin-form__title">Images — {selectedChapter.title}</h2>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {selectedChapter.images?.length || 0} image{selectedChapter.images?.length > 1 ? 's' : ''} · glisser pour réordonner
              </p>

              {/* Upload multiple */}
              <div
                className="admin-dropzone"
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); Array.from(e.dataTransfer.files).forEach(f => handleUploadImage(f)); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="admin-dropzone__placeholder">
                  {uploading ? 'Upload...' : 'Glisser plusieurs images ou cliquer'}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => Array.from(e.target.files).forEach(f => handleUploadImage(f))} />
              </div>

              {/* URL directe */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="text" placeholder="Ou coller une URL..." id="img-url-input"
                  style={{ flex: 1, background: 'rgba(5,8,16,0.6)', border: '1px solid rgba(78,205,196,0.15)', borderRadius: '2px', padding: '0.65rem 0.9rem', color: 'var(--text-main)', fontSize: '0.8rem', fontFamily: 'var(--font-ui)', outline: 'none' }} />
                <button className="admin-btn admin-btn--ghost" onClick={() => {
                  const input = document.getElementById('img-url-input');
                  if (input.value) { handleAddImageUrl(input.value); input.value = ''; }
                }}>+</button>
              </div>

              {/* Liste images */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                {(selectedChapter.images || []).map((img, i) => (
                  <div key={img.id} className="admin-entry" style={{ gap: '0.75rem' }}>
                    <img src={img.image_url} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i + 1}. {img.image_url.split('/').pop()}
                    </span>
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDeleteImage(img.id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Liste chapitres */}
        <div className="admin-list">
          <h2 className="admin-form__title">{chapters.length} chapitre{chapters.length > 1 ? 's' : ''}</h2>
          {chapters.map(ch => (
            <div key={ch.id} className={`admin-entry ${selectedChapter?.id === ch.id ? 'admin-entry--selected' : ''}`}
              style={{ cursor: 'pointer', borderColor: selectedChapter?.id === ch.id ? 'var(--cyan)' : undefined }}
              onClick={() => setSelectedChapter(ch)}>
              <div className="admin-entry__icon">◎</div>
              <div className="admin-entry__info">
                <strong>{ch.title}</strong>
                <span>Ép. {ch.episode_no || '?'} · {ch.images?.length || 0} image{ch.images?.length > 1 ? 's' : ''} {ch.webtoon_url ? '· Webtoon ✓' : ''}</span>
              </div>
              <div className="admin-entry__actions">
                <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={e => { e.stopPropagation(); handleDelete(ch.id); }}>Suppr.</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
