'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/Forum.css';
import '@/styles/Profil.css';

const TAG_LABELS = {
  general:   'Discussion',
  theories:  'Théories',
  lore:      'Lore',
  questions: 'Questions',
};

const TAG_COLORS = {
  general:   'var(--cyan)',
  theories:  'var(--violet)',
  lore:      'var(--orange)',
  questions: 'var(--cyan)',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d}j`;
  return `il y a ${Math.floor(d / 30)} mois`;
}

export default function ProfilPage() {
  const router = useRouter();
  const [session, setSession]   = useState(undefined);
  const [activity, setActivity] = useState(null);
  const [tab, setTab]           = useState('topics');

  useEffect(() => {
    fetch('/api/forum/me')
      .then(r => r.ok ? r.json() : null)
      .then(s => {
        setSession(s);
        if (!s) router.replace('/forum/connexion');
      })
      .catch(() => router.replace('/forum/connexion'));
  }, [router]);

  useEffect(() => {
    if (!session) return;
    fetch('/api/forum/my-activity')
      .then(r => r.ok ? r.json() : null)
      .then(setActivity)
      .catch(() => {});
  }, [session]);

  if (session === undefined) return null;

  const threads = activity?.threads ?? [];
  const replies = activity?.replies ?? [];

  return (
    <main className="forum-page">
      <div className="forum-inner">
        <Link href="/forum" className="forum-back">← Forum</Link>

        {/* En-tête profil */}
        <div className="profil-header">
          <div className="profil-avatar">{session?.username?.[0]?.toUpperCase()}</div>
          <div className="profil-header__info">
            <h1 className="profil-header__name">{session?.username}</h1>
            <span className="profil-header__role">Membre</span>
          </div>
          <a href="/api/forum/auth/logout" className="profil-logout">Déconnexion</a>
        </div>

        {/* Stats */}
        <div className="profil-stats">
          <div className="profil-stat">
            <span className="profil-stat__value">{threads.length}</span>
            <span className="profil-stat__label">Topics</span>
          </div>
          <div className="profil-stat">
            <span className="profil-stat__value">{replies.length}</span>
            <span className="profil-stat__label">Réponses</span>
          </div>
          <div className="profil-stat">
            <span className="profil-stat__value">{threads.length + replies.length}</span>
            <span className="profil-stat__label">Contributions</span>
          </div>
        </div>

        {/* Onglets */}
        <div className="profil-tabs">
          <button
            className={`profil-tab ${tab === 'topics' ? 'profil-tab--active' : ''}`}
            onClick={() => setTab('topics')}
          >
            Topics ({threads.length})
          </button>
          <button
            className={`profil-tab ${tab === 'replies' ? 'profil-tab--active' : ''}`}
            onClick={() => setTab('replies')}
          >
            Réponses ({replies.length})
          </button>
        </div>

        {/* Contenu onglet */}
        {tab === 'topics' && (
          <div className="profil-list">
            {threads.length === 0 ? (
              <p className="profil-empty">Aucun topic posté pour l'instant.</p>
            ) : threads.map(t => (
              <Link
                key={t.id}
                href={`/forum/${t.category}/${t.id}`}
                className="profil-item"
                style={{ '--item-color': TAG_COLORS[t.category] }}
              >
                <span className="profil-item__icon">◈</span>
                <span className="profil-item__title">{t.title}</span>
                <span className="profil-item__tag" style={{ color: TAG_COLORS[t.category] }}>
                  {TAG_LABELS[t.category]}
                </span>
                <span className="profil-item__date">{timeAgo(t.created_at)}</span>
              </Link>
            ))}
          </div>
        )}

        {tab === 'replies' && (
          <div className="profil-list">
            {replies.length === 0 ? (
              <p className="profil-empty">Aucune réponse postée pour l'instant.</p>
            ) : replies.map(r => (
              <Link
                key={r.id}
                href={`/forum/${r.category}/${r.thread_id}`}
                className="profil-item"
                style={{ '--item-color': TAG_COLORS[r.category] }}
              >
                <span className="profil-item__icon">↩</span>
                <div className="profil-item__reply-body">
                  <span className="profil-item__reply-thread">{r.thread_title}</span>
                  <span className="profil-item__reply-excerpt">
                    {r.content.slice(0, 100)}{r.content.length > 100 ? '…' : ''}
                  </span>
                </div>
                <span className="profil-item__tag" style={{ color: TAG_COLORS[r.category] }}>
                  {TAG_LABELS[r.category]}
                </span>
                <span className="profil-item__date">{timeAgo(r.created_at)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
