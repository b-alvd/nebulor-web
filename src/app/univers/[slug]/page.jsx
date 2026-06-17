'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '@/styles/CategorySlider.css';

import { use } from 'react';

export default function CategoryPage({ params }) {
  const { slug } = use(params);
  const [entries, setEntries] = useState([]);
  const [category, setCategory] = useState(null);
  const [active, setActive] = useState(0);
  const slidesRef = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    fetch(`/api/admin/entries?category=${slug}`)
      .then(r => r.json())
      .then(data => {
        setEntries(data);
        if (data[0]) setCategory({ slug: data[0].category_slug, label: data[0].category_label });
      });
  }, [slug]);

  useEffect(() => {
    if (!entries.length) return;
    if (containerRef.current) containerRef.current.scrollTop = 0;
    setActive(0);
  }, [entries]);

  useEffect(() => {
    if (!entries.length) return;
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
  }, [entries]);

  const scrollTo = (i) => {
    setActive(i);
    slidesRef.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!entries.length) return (
    <div className="category-loading">
      <div className="category-loading__spinner" />
    </div>
  );

  return (
    <div className="characters-page">
      <Link href="/univers" className="category-back">← Univers</Link>

      <nav className="char-nav">
        {entries.map((entry, i) => (
          <button
            key={entry.id}
            className={`char-nav__item ${active === i ? 'char-nav__item--active' : ''}`}
            onClick={() => scrollTo(i)}
          >
            <span className="char-nav__name">{entry.name}</span>
            <span className="char-nav__dot" style={{ background: active === i ? '#4ecdc4' : undefined }} />
          </button>
        ))}
      </nav>

      <div className="char-slides" ref={containerRef}>
        {entries.map((entry, i) => {
          const isEven = i % 2 === 0;
          return (
            <section
              key={entry.id}
              className="char-slide"
              ref={el => { slidesRef.current[i] = el; }}
            >
              <div className={`char-slide__visual ${!isEven ? 'char-slide__visual--right' : ''}`}>
                {entry.image_url ? (
                  <Image
                    src={entry.image_url}
                    alt={entry.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="char-slide__placeholder">{entry.name[0]}</div>
                )}
                <div className="char-slide__glow" style={{ background: '#4ecdc4' }} />
              </div>

              <div className={`char-slide__content ${!isEven ? 'char-slide__content--left' : ''}`}>
                <span className="char-slide__rang" style={{ color: '#4ecdc4', background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.25)' }}>
                  {category?.label}
                </span>

                <h2 className="char-slide__name">{entry.name}</h2>

                <div className="char-slide__stats">
                  {Object.entries(entry.fields || {}).map(([key, value]) => (
                    <div className="char-stat" key={key}>
                      <span className="char-stat__label">{key}</span>
                      <span className="char-stat__value">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="char-slide__index" style={{ color: '#4ecdc4' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
