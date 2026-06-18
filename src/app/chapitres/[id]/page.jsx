'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import '@/styles/ChapterReader.css';

export default function ChapterReaderPage({ params }) {
  const { id } = use(params);
  const [chapter, setChapter] = useState(null);

  useEffect(() => {
    fetch('/api/admin/chapters')
      .then(r => r.json())
      .then(data => {
        const ch = data.find(c => String(c.id) === String(id));
        setChapter(ch);
      });
  }, [id]);

  if (!chapter) return (
    <div className="reader-loading">
      <div className="reader-loading__spinner" />
    </div>
  );

  const hasImages = chapter.images && chapter.images.length > 0;

  return (
    <div className="reader-page">
      <div className="reader-header">
        <Link href="/chapitres" className="reader-back">← Chapitres</Link>
        <span className="reader-title">
          {chapter.episode_no ? `Ép. ${chapter.episode_no} · ` : ''}{chapter.title}
        </span>
      </div>

      <div className="reader-content">
        {hasImages ? (
          chapter.images.map((img, i) => (
            <img
              key={img.id}
              src={img.image_url}
              alt={`${chapter.title} - page ${i + 1}`}
              className="reader-image"
            />
          ))
        ) : (
          <div className="reader-no-image">
            <p>Aucune image disponible.</p>
            {chapter.webtoon_url && (
              <a href={chapter.webtoon_url} target="_blank" rel="noopener noreferrer" className="reader-webtoon">
                Lire sur Webtoons →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
