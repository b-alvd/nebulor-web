'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/Forum.css';

const TAGS = [
  { id: 'general',   label: 'Discussion', color: 'var(--cyan)'   },
  { id: 'theories',  label: 'Théories',   color: 'var(--violet)' },
  { id: 'lore',      label: 'Lore',       color: 'var(--orange)' },
  { id: 'questions', label: 'Questions',  color: 'var(--cyan)'   },
];

export default function NouveauTopicPage() {
  const router = useRouter();
  const [session, setSession] = useState(undefined);
  const [tag, setTag]         = useState('general');
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [image, setImage]     = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    fetch('/api/forum/me')
      .then(r => r.ok ? r.json() : null)
      .then(s => {
        setSession(s);
        if (!s) router.replace('/forum/connexion');
      })
      .catch(() => router.replace('/forum/connexion'));
  }, [router]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/forum/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload échoué');
      setImageUrl(json.url);
      setImage(URL.createObjectURL(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Titre requis.');
    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: tag, title: title.trim(), content: content.trim(), image_url: imageUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      router.push(`/forum/${tag}/${json.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (session === undefined) return null;

  return (
    <main className="forum-page">
      <div className="forum-inner">
        <Link href="/forum" className="forum-back">← Forum</Link>

        <div className="forum-form-card">
          <h1 className="forum-form-card__title">Nouveau topic</h1>

          <form onSubmit={handleSubmit} className="forum-form">
            {/* Sélecteur de tag */}
            <div className="forum-form__field">
              <label className="forum-form__label">Tag</label>
              <div className="forum-tag-picker">
                {TAGS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`forum-tag-btn ${tag === t.id ? 'forum-tag-btn--active' : ''}`}
                    style={{ '--tag-color': t.color }}
                    onClick={() => setTag(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Titre */}
            <div className="forum-form__field">
              <label className="forum-form__label" htmlFor="title">Titre</label>
              <input
                id="title"
                className="forum-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="De quoi tu veux parler ?"
                maxLength={200}
                required
              />
            </div>

            {/* Image */}
            <div className="forum-form__field">
              <label className="forum-form__label">
                Image {tag === 'fanart' ? <span className="forum-required">*</span> : <span className="forum-optional">(optionnel)</span>}
              </label>
              <div
                className={`forum-upload-zone ${image ? 'forum-upload-zone--has-image' : ''}`}
                onClick={() => fileRef.current?.click()}
              >
                {image ? (
                  <img src={image} alt="Aperçu" className="forum-upload-zone__preview" />
                ) : (
                  <div className="forum-upload-zone__placeholder">
                    <span className="forum-upload-zone__icon">↑</span>
                    <span>{uploading ? 'Upload en cours…' : 'Clique pour ajouter une image'}</span>
                    <span className="forum-upload-zone__hint">PNG, JPG, GIF · max 8 Mo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="forum-file-hidden"
                onChange={handleFile}
              />
              {image && (
                <button
                  type="button"
                  className="forum-remove-img"
                  onClick={() => { setImage(null); setImageUrl(''); }}
                >
                  Retirer l'image
                </button>
              )}
            </div>

            {/* Contenu */}
            <div className="forum-form__field">
              <label className="forum-form__label" htmlFor="content">Description <span className="forum-optional">(optionnel)</span></label>
              <textarea
                id="content"
                className="forum-textarea"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Développe ta pensée…"
                rows={6}
                maxLength={8000}
              />
            </div>

            {error && <p className="forum-error">{error}</p>}

            <div className="forum-form__actions">
              <Link href="/forum" className="btn btn--ghost">Annuler</Link>
              <button type="submit" className="btn btn--primary" disabled={submitting || uploading}>
                {submitting ? 'Publication…' : 'Publier le topic'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
