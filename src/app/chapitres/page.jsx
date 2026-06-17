'use client';

import '@/styles/Chapters.css';

const SECTIONS = [
  {
    id: 'prologue',
    label: 'Arc 1',
    title: 'Prologue',
    chapters: [
      { num: '01', title: 'Chapitre 1 : Prologue', url: 'https://www.webtoons.com/fr/canvas/nebulor/chapitre-1-prologue/viewer?title_no=1060039&episode_no=1' },
      { num: '02', title: 'Chapitre 2 : Prologue', url: 'https://www.webtoons.com/fr/canvas/nebulor/chapitre-2-prologue/viewer?title_no=1060039&episode_no=2' },
      { num: '03', title: 'Chapitre 3 : Prologue', url: 'https://www.webtoons.com/fr/canvas/nebulor/chapitre-3-prologue/viewer?title_no=1060039&episode_no=3' },
      { num: '04', title: 'Chapitre 4 : Prologue', url: 'https://www.webtoons.com/fr/canvas/nebulor/chapitre-4-prologue/viewer?title_no=1060039&episode_no=10' },
    ],
  },
];

export default function Chapters() {
  return (
    <main className="chapters-page">
      <div className="chapters-page__hero">
        <h1 className="chapters-page__title">Chapitres</h1>
        <p className="chapters-page__sub">
          Retrouvez tous les chapitres disponibles de Nebulor.
        </p>
      </div>

      <div className="chapters-page__content">
        {SECTIONS.map(section => (
          <div className="arc" key={section.id}>
            <div className="arc__header">
              <span className="arc__label">{section.label}</span>
              <h2 className="arc__title">{section.title}</h2>
              <div className="arc__line" />
            </div>

            <div className="arc__grid">
              {section.chapters.map((ch, i) => (
                <a
                  key={ch.num}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ch-card"
                  style={{ '--delay': `${i * 0.08}s` }}
                >
                  <div className="ch-card__num">#{ch.num}</div>
                  <div className="ch-card__title">{ch.title}</div>
                  <div className="ch-card__arrow">→</div>
                </a>
              ))}
            </div>
          </div>
        ))}

        <p className="chapters-page__coming">
          De nouveaux chapitres arrivent bientôt, reste dans l'orbite.
        </p>
      </div>
    </main>
  );
}
