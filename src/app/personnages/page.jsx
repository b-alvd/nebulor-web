'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import '@/styles/Characters.css';

const CHARACTERS = [
  { id: 1,  name: 'Kenir',   age: '???',    rang: 'Roi du royaume',                         capacite: null,                                      specificite: null },
  { id: 2,  name: 'Blade',   age: '22 ans', rang: 'DICE',                                   capacite: 'Peut se transformer en plusieurs animaux', specificite: null },
  { id: 3,  name: 'Ace',     age: '23 ans', rang: 'DICE',                                   capacite: 'Contrôle les 4 éléments',                 specificite: null },
  { id: 4,  name: 'Daisy',   age: '19 ans', rang: 'Protectrice du Royaume',                 capacite: 'Alter démoniaque influencé par la lune',  specificite: null },
  { id: 5,  name: 'Tess',    age: '21 ans', rang: 'Protectrice du Royaume',                 capacite: 'Liens avec les reptiles',                 specificite: null },
  { id: 6,  name: 'Iyou',    age: '28 ans', rang: 'Ancienne protectrice du Royaume',        capacite: 'Maîtrise des ombres',                     specificite: null },
  { id: 7,  name: 'Nepheri', age: '???',    rang: 'Nouvelle protectrice du Royaume',        capacite: 'Inconnu',                                 specificite: null },
  { id: 8,  name: 'Diana',   age: '27 ans', rang: 'DICE',                                   capacite: 'Contrôle la fumée, la brume…',            specificite: null },
  { id: 9,  name: 'Kana',    age: '25 ans', rang: 'DICE',                                   capacite: "Maîtrise de l'air et de l'oxygène",      specificite: null },
  { id: 10, name: 'Milio',   age: '22 ans', rang: 'Protectrice du Royaume',                 capacite: 'Maîtrise des émotions',                   specificite: 'Jumelle de Milia' },
  { id: 11, name: 'Milia',   age: '22 ans', rang: 'Protectrice du Royaume',                 capacite: 'Maîtrise des émotions',                   specificite: 'Jumelle de Milio' },
  { id: 12, name: 'Amikana', age: '43 ans', rang: 'Garde royale en charge des protecteurs', capacite: 'Forte au combat avec dagues',              specificite: null },
];

const RANG_COLORS = {
  'DICE':                                    { color: '#4ecdc4', bg: 'rgba(78,205,196,0.08)',   border: 'rgba(78,205,196,0.25)'   },
  'Roi du royaume':                          { color: '#e8622a', bg: 'rgba(232,98,42,0.08)',    border: 'rgba(232,98,42,0.25)'    },
  'Protectrice du Royaume':                  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',   border: 'rgba(139,92,246,0.25)'   },
  'Ancienne protectrice du Royaume':         { color: '#7a748a', bg: 'rgba(122,116,138,0.08)', border: 'rgba(122,116,138,0.25)'  },
  'Nouvelle protectrice du Royaume':         { color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.25)'  },
  'Garde royale en charge des protecteurs':  { color: '#d4874a', bg: 'rgba(212,135,74,0.08)',  border: 'rgba(212,135,74,0.25)'   },
};

function getRangStyle(rang) {
  return RANG_COLORS[rang] || { color: '#7a748a', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' };
}

export default function Characters() {
  const [active, setActive] = useState(0);
  const slidesRef = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
    setActive(0);
  }, []);

  useEffect(() => {
    const observers = [];
    const timer = setTimeout(() => {
      slidesRef.current.forEach((el, i) => {
        if (!el) return;
        const io = new IntersectionObserver(
          ([entry]) => { if (entry.isIntersecting) setActive(i); },
          { root: containerRef.current, threshold: 0.5 }
        );
        io.observe(el);
        observers.push(io);
      });
    }, 600);
    return () => {
      clearTimeout(timer);
      observers.forEach(io => io.disconnect());
    };
  }, []);

  const scrollTo = (i) => {
    setActive(i);
    slidesRef.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.div
      className="characters-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="char-nav">
        {CHARACTERS.map((c, i) => {
          const s = getRangStyle(c.rang);
          return (
            <button
              key={c.id}
              className={`char-nav__item ${active === i ? 'char-nav__item--active' : ''}`}
              onClick={() => scrollTo(i)}
              style={{ '--accent': s.color }}
            >
              <span className="char-nav__name">{c.name}</span>
              <span className="char-nav__dot" style={{ background: active === i ? s.color : undefined }} />
            </button>
          );
        })}
      </nav>

      <div className="char-slides" ref={containerRef}>
        {CHARACTERS.map((char, i) => {
          const s = getRangStyle(char.rang);
          const isEven = i % 2 === 0;
          return (
            <section key={char.id} className="char-slide" ref={el => { slidesRef.current[i] = el; }}>
              <div className={`char-slide__visual ${!isEven ? 'char-slide__visual--right' : ''}`}>
                <div className="char-slide__placeholder">{char.name[0]}</div>
                <div className="char-slide__glow" style={{ background: s.color }} />
              </div>
              <div className={`char-slide__content ${!isEven ? 'char-slide__content--left' : ''}`}>
                <span className="char-slide__rang" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                  {char.rang}
                </span>
                <h2 className="char-slide__name">{char.name}</h2>
                <div className="char-slide__stats">
                  <div className="char-stat">
                    <span className="char-stat__label">Âge</span>
                    <span className="char-stat__value">{char.age}</span>
                  </div>
                  {char.capacite && (
                    <div className="char-stat">
                      <span className="char-stat__label">Capacité</span>
                      <span className="char-stat__value">{char.capacite}</span>
                    </div>
                  )}
                  {char.specificite && (
                    <div className="char-stat char-stat--spec">
                      <span className="char-stat__label">Spécificité</span>
                      <span className="char-stat__value">{char.specificite}</span>
                    </div>
                  )}
                </div>
                <div className="char-slide__index" style={{ color: s.color }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </motion.div>
  );
}
