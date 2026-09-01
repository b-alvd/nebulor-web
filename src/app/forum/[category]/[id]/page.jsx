'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import '@/styles/Forum.css';

const LABELS = { general: 'Discussion', theories: 'Théories', lore: 'Lore', questions: 'Questions' };
const COLORS  = { general: 'var(--cyan)', theories: 'var(--violet)', lore: 'var(--orange)', questions: 'var(--cyan)' };

const REPORT_REASONS = [
  'Contenu inapproprié',
  'Spam ou publicité',
  'Harcèlement',
  'Spoiler non signalé',
  'Autre',
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

function InitialAvatar({ username, size = 36 }) {
  return (
    <span className="forum-avatar forum-avatar--placeholder" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {username?.[0]?.toUpperCase()}
    </span>
  );
}

function ActionBar({ isOwner, isLoggedIn, onEdit, onDelete, onReport }) {
  if (!isLoggedIn) return null;
  return (
    <div className="post-action-bar">
      {isOwner && (
        <>
          <button className="post-action-btn" onClick={onEdit}>✎ Modifier</button>
          <button className="post-action-btn post-action-btn--danger" onClick={onDelete}>✕ Supprimer</button>
        </>
      )}
      {!isOwner && (
        <button className="post-action-btn post-action-btn--warn" onClick={onReport}>⚑ Signaler</button>
      )}
    </div>
  );
}

/* ── Modal de signalement ── */
function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setSending(true);
    await fetch('/api/forum/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_type: targetType, target_id: targetId, reason }),
    });
    setDone(true);
    setSending(false);
    setTimeout(onClose, 1500);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {done ? (
          <p className="modal__done">✓ Signalement envoyé</p>
        ) : (
          <>
            <h2 className="modal__title">Signaler ce contenu</h2>
            <div className="modal__reasons">
              {REPORT_REASONS.map(r => (
                <label key={r} className={`modal__reason ${reason === r ? 'modal__reason--active' : ''}`}>
                  <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
                  {r}
                </label>
              ))}
            </div>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
              <button className="btn btn--primary" onClick={submit} disabled={sending}>
                {sending ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Modal de confirmation suppression ── */
function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <p className="modal__confirm-text">{message}</p>
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn--danger" onClick={onConfirm}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

export default function ThreadPage() {
  const { category, id } = useParams();
  const router = useRouter();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply]           = useState('');
  const [replyImageUrl, setReplyImageUrl] = useState('');
  const [replyImagePreview, setReplyImagePreview] = useState('');
  const [replyUploading, setReplyUploading] = useState(false);
  const [sending, setSending]       = useState(false);
  const [replyError, setReplyError] = useState('');
  const [session, setSession]       = useState(undefined);

  const [lightbox, setLightbox] = useState(null); // url string

  // Edit state
  const [editingThread, setEditingThread] = useState(false);
  const [editTitle, setEditTitle]         = useState('');
  const [editContent, setEditContent]     = useState('');
  const [editImageUrl, setEditImageUrl]   = useState('');
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editUploading, setEditUploading] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [editReplyImageUrl, setEditReplyImageUrl] = useState('');
  const [editReplyImagePreview, setEditReplyImagePreview] = useState('');
  const [editReplyUploading, setEditReplyUploading] = useState(false);

  // Modal state
  const [report, setReport]   = useState(null); // { type, id }
  const [confirm, setConfirm] = useState(null); // { message, action }

  useEffect(() => {
    loadThread();
    fetch('/api/forum/me').then(r => r.ok ? r.json() : null).then(setSession).catch(() => setSession(null));
  }, [id]);

  async function loadThread() {
    const d = await fetch(`/api/forum/threads/${id}`).then(r => r.ok ? r.json() : null).catch(() => null);
    setData(d);
    setLoading(false);
  }

  async function handleReplyFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplyUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/forum/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok) { setReplyImageUrl(json.url); setReplyImagePreview(URL.createObjectURL(file)); }
    } finally {
      setReplyUploading(false);
    }
  }

  async function handleEditReplyFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditReplyUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/forum/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok) { setEditReplyImageUrl(json.url); setEditReplyImagePreview(URL.createObjectURL(file)); }
    } finally {
      setEditReplyUploading(false);
    }
  }

  async function submitReply(e) {
    e.preventDefault();
    if (!reply.trim() && !replyImageUrl) return;
    setSending(true);
    setReplyError('');
    try {
      const res = await fetch('/api/forum/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: Number(id), content: reply.trim(), image_url: replyImageUrl || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setReply('');
      setReplyImageUrl('');
      setReplyImagePreview('');
      await loadThread();
    } catch (err) {
      setReplyError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleEditFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/forum/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok) { setEditImageUrl(json.url); setEditImagePreview(URL.createObjectURL(file)); }
    } finally {
      setEditUploading(false);
    }
  }

  async function saveEditThread() {
    const res = await fetch(`/api/forum/threads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, content: editContent, image_url: editImageUrl || null }),
    });
    if (res.ok) { setEditingThread(false); await loadThread(); }
  }

  async function deleteThread() {
    const res = await fetch(`/api/forum/threads/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/forum');
  }

  async function saveEditReply(replyId) {
    const res = await fetch(`/api/forum/replies/${replyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editReplyContent, image_url: editReplyImageUrl || null }),
    });
    if (res.ok) { setEditingReplyId(null); await loadThread(); }
  }

  async function deleteReply(replyId) {
    const res = await fetch(`/api/forum/replies/${replyId}`, { method: 'DELETE' });
    if (res.ok) { setConfirm(null); await loadThread(); }
  }

  if (loading) return <main className="forum-page"><div className="forum-loading" /></main>;
  if (!data?.thread) return <main className="forum-page"><div className="forum-inner"><p>Topic introuvable.</p></div></main>;

  const { thread, replies } = data;
  const color = COLORS[category] ?? 'var(--cyan)';
  const isOwner = session && Number(thread.author_id) === session.userId;

  return (
    <main className="forum-page">
      {report && <ReportModal targetType={report.type} targetId={report.id} onClose={() => setReport(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.action} onClose={() => setConfirm(null)} />}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="lightbox-img" />
        </div>
      )}

      <div className="forum-inner">
        <Link href="/forum" className="forum-back">← Forum</Link>

        <article className="forum-thread" style={{ '--cat-color': color }}>
          <div className="forum-thread__header">
            <InitialAvatar username={thread.author_username} size={40} />
            <div className="forum-thread__author-info">
              <span className="forum-thread__author">{thread.author_username}</span>
              <span className="forum-thread__date">{timeAgo(thread.created_at)}</span>
            </div>
          </div>

          {editingThread ? (
            <div className="post-edit">
              <input className="forum-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} maxLength={200} placeholder="Titre" />
              <textarea className="forum-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} rows={5} placeholder="Description…" />

              {/* Image */}
              <div className="post-edit__image-zone">
                {(editImagePreview || editImageUrl) ? (
                  <div className="post-edit__image-preview">
                    <img src={editImagePreview || editImageUrl} alt="Aperçu" />
                    <button
                      type="button"
                      className="post-edit__image-remove"
                      onClick={() => { setEditImageUrl(''); setEditImagePreview(''); }}
                    >
                      ✕ Supprimer l'image
                    </button>
                  </div>
                ) : (
                  <label className="post-edit__image-add" style={{ cursor: editUploading ? 'wait' : 'pointer' }}>
                    {editUploading ? 'Upload…' : '↑ Ajouter une image'}
                    <input type="file" accept="image/*" className="forum-file-hidden" onChange={handleEditFile} disabled={editUploading} />
                  </label>
                )}
              </div>

              <div className="post-edit__actions">
                <button className="btn btn--ghost" onClick={() => setEditingThread(false)}>Annuler</button>
                <button className="btn btn--primary" onClick={saveEditThread} disabled={editUploading}>Sauvegarder</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="forum-thread__title">{thread.title}</h1>
              {thread.image_url && (
                <div className="forum-thread__image">
                  <img src={thread.image_url} alt={thread.title} className="forum-img-clickable" onClick={() => setLightbox(thread.image_url)} />
                </div>
              )}
              {thread.content && (
                <div className="forum-thread__content">
                  {thread.content.split('\n').map((line, i) => <p key={i}>{line || <br />}</p>)}
                </div>
              )}
              <ActionBar
                isOwner={isOwner}
                isLoggedIn={!!session}
                onEdit={() => { setEditTitle(thread.title); setEditContent(thread.content ?? ''); setEditImageUrl(thread.image_url ?? ''); setEditImagePreview(''); setEditingThread(true); }}
                onDelete={() => setConfirm({ message: 'Supprimer ce topic ? Cette action est irréversible.', action: deleteThread })}
                onReport={() => setReport({ type: 'thread', id: thread.id })}
              />
            </>
          )}
        </article>

        {replies.length > 0 && (
          <div className="forum-replies">
            <span className="forum-replies__count">{replies.length} réponse{replies.length > 1 ? 's' : ''}</span>
            {replies.map(r => {
              const isReplyOwner = session && Number(r.author_id) === session.userId;
              return (
                <div key={r.id} className="forum-reply">
                  <div className="forum-reply__body">
                    <div className="forum-reply__meta">
                      <InitialAvatar username={r.author_username} size={32} />
                      <span className="forum-reply__author">{r.author_username}</span>
                      <span className="forum-reply__date">{timeAgo(r.created_at)}</span>
                    </div>
                    {editingReplyId === r.id ? (
                      <div className="post-edit">
                        <textarea className="forum-textarea" value={editReplyContent} onChange={e => setEditReplyContent(e.target.value)} rows={3} />
                        <div className="post-edit__image-zone">
                          {(editReplyImagePreview || editReplyImageUrl) ? (
                            <div className="post-edit__image-preview">
                              <img src={editReplyImagePreview || editReplyImageUrl} alt="" />
                              <button type="button" className="post-edit__image-remove" onClick={() => { setEditReplyImageUrl(''); setEditReplyImagePreview(''); }}>✕ Supprimer l'image</button>
                            </div>
                          ) : (
                            <label className="post-edit__image-add" style={{ cursor: editReplyUploading ? 'wait' : 'pointer' }}>
                              {editReplyUploading ? 'Upload…' : '↑ Ajouter une image'}
                              <input type="file" accept="image/*" className="forum-file-hidden" onChange={handleEditReplyFile} disabled={editReplyUploading} />
                            </label>
                          )}
                        </div>
                        <div className="post-edit__actions">
                          <button className="btn btn--ghost" onClick={() => setEditingReplyId(null)}>Annuler</button>
                          <button className="btn btn--primary" onClick={() => saveEditReply(r.id)} disabled={editReplyUploading}>Sauvegarder</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {r.content && (
                          <div className="forum-reply__content">
                            {r.content.split('\n').map((line, i) => <p key={i}>{line || <br />}</p>)}
                          </div>
                        )}
                        {r.image_url && (
                          <div className="forum-reply__image">
                            <img src={r.image_url} alt="" className="forum-img-clickable" onClick={() => setLightbox(r.image_url)} />
                          </div>
                        )}
                        <ActionBar
                          isOwner={isReplyOwner}
                          isLoggedIn={!!session}
                          onEdit={() => { setEditingReplyId(r.id); setEditReplyContent(r.content ?? ''); setEditReplyImageUrl(r.image_url ?? ''); setEditReplyImagePreview(''); }}
                          onDelete={() => setConfirm({ message: 'Supprimer cette réponse ?', action: () => deleteReply(r.id) })}
                          onReport={() => setReport({ type: 'reply', id: r.id })}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="forum-reply-form">
          {session === undefined ? null : session ? (
            <form onSubmit={submitReply}>
              <div className="forum-reply-form__inner">
                <InitialAvatar username={session.username} size={36} />
                <div className="forum-reply-form__field">
                  <textarea
                    className="forum-textarea"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Ta réponse…"
                    rows={3}
                    maxLength={4000}
                  />
                  {replyImagePreview && (
                    <div className="reply-image-preview">
                      <img src={replyImagePreview} alt="" />
                      <button type="button" className="post-edit__image-remove" onClick={() => { setReplyImageUrl(''); setReplyImagePreview(''); }}>✕</button>
                    </div>
                  )}
                  {replyError && <p className="forum-error">{replyError}</p>}
                  <div className="forum-reply-form__actions">
                    <label className="reply-img-btn" style={{ cursor: replyUploading ? 'wait' : 'pointer' }}>
                      {replyUploading ? 'Upload…' : '↑ Image'}
                      <input type="file" accept="image/*" className="forum-file-hidden" onChange={handleReplyFile} disabled={replyUploading} />
                    </label>
                    <button type="submit" className="btn btn--primary" disabled={sending || replyUploading || (!reply.trim() && !replyImageUrl)}>
                      {sending ? 'Envoi…' : 'Répondre'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <p className="forum-login-hint">
              <Link href="/forum/connexion" className="forum-link">Connecte-toi</Link> pour répondre.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
