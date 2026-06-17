'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '@/styles/Home.css';

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.15 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function Home() {
  useReveal();
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.12}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__visual" ref={heroRef}>
          <div className="hero__orb hero__orb--cyan" />
          <div className="hero__orb hero__orb--orange" />
          <div className="hero__orb hero__orb--violet" />
          <Image src="/cover.png" alt="Nebulor cover art" className="hero__cover" width={520} height={520} priority />
        </div>

        <div className="hero__content">
          <p className="hero__eyebrow">LeZorin présente,</p>
          <Image src="/nebulor.webp" alt="Nebulor" className="hero__title-img" width={400} height={283} priority />
          <p className="hero__tagline">
            La prophétie s&apos;éveille.<br />
            Et avec elle, tout ce qui dormait.
          </p>
          <div className="hero__actions">
            <Link href="/chapitres" className="btn btn--primary">Lire le premier chapitre</Link>
            <Link href="/boutique" className="btn btn--ghost">Boutique</Link>
          </div>
        </div>
      </section>

      {/* ── SYNOPSIS ── */}
      <section className="synopsis" data-reveal>
        <div className="synopsis__inner">
          <div className="synopsis__label">Synopsis</div>
          <Image src="/nebulor.webp" alt="Nebulor" className="synopsis__title-img" width={220} height={156} />
          <p className="synopsis__text">
            Depuis des siècles, une prophétie sommeillait au cœur de la forêt.
            Le jour où le dernier enfant apparaîtrait, les créatures se réveilleraient.
          </p>
          <Link href="/chapitres" className="synopsis__link">
            Commencer l&apos;aventure
            <span className="synopsis__link-arrow">→</span>
          </Link>
        </div>
        <div className="synopsis__deco" aria-hidden="true">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="180" stroke="rgba(78,205,196,0.20)" strokeWidth="1" />
            <circle cx="200" cy="200" r="120" stroke="rgba(139,92,246,0.25)" strokeWidth="1" strokeDasharray="4 8" />
            <circle cx="200" cy="200" r="60"  stroke="rgba(232,98,42,0.1)"  strokeWidth="1" />
          </svg>
        </div>
      </section>

      {/* ── DERNIERS CHAPITRES ── */}
      <section className="chapters-preview" data-reveal>
        <div className="section-header">
          <span className="section-label">Chapitres</span>
          <h2 className="section-title">Dernières parutions</h2>
        </div>

        <div className="chapters-preview__grid">
          {[
            { num: '04', title: 'Chapitre 4 : Prologue', desc: 'Chapitre en ligne.', url: 'https://www.webtoons.com/fr/canvas/nebulor/chapitre-4-prologue/viewer?title_no=1060039&episode_no=10' },
            { num: '03', title: 'Chapitre 3 : Prologue', desc: 'Chapitre en ligne.', url: 'https://www.webtoons.com/fr/canvas/nebulor/chapitre-3-prologue/viewer?title_no=1060039&episode_no=3' },
            { num: '02', title: 'Chapitre 2 : Prologue', desc: 'Chapitre en ligne.', url: 'https://www.webtoons.com/fr/canvas/nebulor/chapitre-2-prologue/viewer?title_no=1060039&episode_no=2' },
            { num: '01', title: 'Chapitre 1 : Prologue', desc: 'Chapitre en ligne.', url: 'https://www.webtoons.com/fr/canvas/nebulor/chapitre-1-prologue/viewer?title_no=1060039&episode_no=1' },
          ].map((ch, i) => (
            <a
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="chapter-card"
              key={ch.num}
              style={{ '--delay': `${i * 0.1}s` }}
            >
              <div className="chapter-card__num">{ch.num}</div>
              <div className="chapter-card__body">
                <h3 className="chapter-card__title">{ch.title}</h3>
                <p className="chapter-card__desc">{ch.desc}</p>
              </div>
              <span className="chapter-card__link">→</span>
            </a>
          ))}
        </div>

        <div className="chapters-preview__more">
          <Link href="/chapitres" className="btn btn--ghost">Voir tous les chapitres disponibles</Link>
        </div>
      </section>

      {/* ── BOUTIQUE TEASER ── */}
      <section className="shop-teaser" data-reveal>
        <div className="shop-teaser__bg" aria-hidden="true" />
        <div className="shop-teaser__content">
          <span className="section-label">Boutique</span>
          <h2 className="shop-teaser__title">Ramène un peu de Nebulor chez toi</h2>
          <p className="shop-teaser__text">
            Prints, merch, goodies limités. Chaque pièce est un fragment de l&apos;univers Nebulor.
          </p>
          <Link href="/boutique" className="btn btn--primary">Voir la boutique</Link>
        </div>
      </section>

    </main>
  );
}
