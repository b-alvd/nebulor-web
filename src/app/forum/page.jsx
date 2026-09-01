'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/styles/Forum.css';

const TAGS = [
  { id: 'all',       label: 'Tout' },
  { id: 'general',   label: 'Discussion' },
  { id: 'theories',  label: 'Théories' },
  { id: 'lore',      label: 'Lore' },
  { id: 'questions', label: 'Questions' },
];

const TAG_COLORS = {
  general:   'var(--cyan)',
  theories:  'var(--violet)',
  lore:      'var(--orange)',
  questions: 'var(--cyan)',
};

const TAG_LABELS = {
  general:   'Discussion',
  theories:  'Théories',
  lore:      'Lore',
  questions: 'Questions',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

export default function ForumPage() {
  const [threads, setThreads] = useState([]);
  const [session, setSession] = useState(undefined);
  const [activeTag, setActiveTag] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/forum/threads').then(r => r.json()).catch(() => []),
      fetch('/api/forum/me').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([t, s]) => {
      setThreads(Array.isArray(t) ? t : []);
      setSession(s);
      setLoading(false);
    });
  }, []);

  const filtered = activeTag === 'all' ? threads : threads.filter(t => t.category === activeTag);

  return (
    <main className="forum-page">
      <div className="forum-hero">
        <span className="section-label">Communauté</span>
        <h1 className="forum-hero__title">Forum Nebulor</h1>
        <p className="forum-hero__sub">Échange, théorise, partage.</p>

      </div>

      <div className="forum-inner">
        {/* Barre de filtres */}
        <div className="forum-filters">
          <div className="forum-filters__tags">
            {TAGS.map(tag => (
              <button
                key={tag.id}
                className={`forum-tag-btn ${activeTag === tag.id ? 'forum-tag-btn--active' : ''}`}
                style={{ '--tag-color': TAG_COLORS[tag.id] ?? 'var(--cyan)' }}
                onClick={() => setActiveTag(tag.id)}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {session && (
            <Link href="/forum/nouveau" className="btn btn--primary">+ Nouveau topic</Link>
          )}
        </div>

        {/* Liste des topics */}
        {loading ? (
          <div className="forum-loading" />
        ) : filtered.length === 0 ? (
          <div className="forum-empty">
            <p>Aucun topic pour l&apos;instant. Sois le premier !</p>
          </div>
        ) : (
          <div className="forum-threads">
            {filtered.map(t => (
              <Link
                key={t.id}
                href={`/forum/${t.category}/${t.id}`}
                className={`forum-thread-card ${t.pinned ? 'forum-thread-card--pinned' : ''}`}
                style={{ '--cat-color': TAG_COLORS[t.category] ?? 'var(--cyan)' }}
              >
                {t.image_url && (
                  <div className="forum-thread-card__thumb">
                    <img src={t.image_url} alt="" />
                  </div>
                )}
                <div className="forum-thread-card__body">
                  {t.pinned ? <span className="forum-pin">📌 Épinglé</span> : null}
                  <h2 className="forum-thread-card__title">{t.title}</h2>
                  {t.content && (
                    <p className="forum-thread-card__excerpt">
                      {t.content.slice(0, 120)}{t.content.length > 120 ? '…' : ''}
                    </p>
                  )}
                  <div className="forum-thread-card__meta">
                    <span
                      className="forum-thread-card__tag"
                      style={{ color: TAG_COLORS[t.category] }}
                    >
                      {TAG_LABELS[t.category] ?? t.category}
                    </span>
                    <span className="forum-thread-card__dot">·</span>
                    <span className="forum-thread-card__avatar-placeholder">{t.author_username[0]}</span>
                    <span className="forum-thread-card__author">{t.author_username}</span>
                    <span className="forum-thread-card__dot">·</span>
                    <span className="forum-thread-card__date">{timeAgo(t.created_at)}</span>
                    <span className="forum-thread-card__dot">·</span>
                    <span className="forum-thread-card__replies">{t.reply_count} réponse{t.reply_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <span className="forum-thread-card__arrow">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
