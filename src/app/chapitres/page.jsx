'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/styles/Chapters.css';

export default function Chapters() {
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    fetch('/api/admin/chapters').then(r => r.json()).then(setChapters);
  }, []);

  return (
    <main className="chapters-page">
      <div className="chapters-page__hero">
        <h1 className="chapters-page__title">Chapitres</h1>
        <p className="chapters-page__sub">
          Retrouvez tous les chapitres disponibles de Nebulor.
        </p>
      </div>

      <div className="chapters-page__content">
        <div className="arc">
          <div className="arc__header">
            <span className="arc__label">Webtoon</span>
            <h2 className="arc__title">Tous les chapitres</h2>
            <div className="arc__line" />
          </div>

          <div className="arc__grid">
            {chapters.map((ch, i) => (
              <div key={ch.id} className="ch-card" style={{ '--delay': `${i * 0.08}s` }}>
                <div className="ch-card__num">#{String(ch.episode_no || i + 1).padStart(2, '0')}</div>
                <div className="ch-card__title">{ch.title}</div>
                <div className="ch-card__actions">
                  {ch.images?.length > 0 && (
                    <Link href={`/chapitres/${ch.id}`} className="ch-card__btn ch-card__btn--read">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                      Lire ici
                    </Link>
                  )}
                  {ch.webtoon_url && (
                    <a href={ch.webtoon_url} target="_blank" rel="noopener noreferrer" className="ch-card__btn ch-card__btn--webtoon">
                      Webtoons →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="chapters-page__coming">
          De nouveaux chapitres arrivent bientôt, reste dans l'orbite.
        </p>
      </div>
    </main>
  );
}
