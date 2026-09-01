'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import '@/styles/Navbar.css';

const NAV_LINKS = [
  { to: '/',            label: 'Accueil' },
  { to: '/communaute',  label: 'Communauté' },
  { to: '/forum',       label: 'Forum' },
  { to: '/chapitres',   label: 'Chapitres' },
  { to: '/univers',     label: 'Univers' },
  { to: '/boutique',    label: 'Boutique' },
];

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

function NavUser() {
  const [session, setSession]   = useState(undefined);
  const [activity, setActivity] = useState(null);
  const [open, setOpen]         = useState(false);
  const ref                     = useRef(null);

  useEffect(() => {
    fetch('/api/forum/me')
      .then(r => r.ok ? r.json() : null)
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    if (!open || !session) return;
    fetch('/api/forum/my-activity')
      .then(r => r.ok ? r.json() : null)
      .then(setActivity)
      .catch(() => {});
  }, [open, session]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (session === undefined) return null;

  if (!session) {
    return (
      <div className="nav-auth">
        <Link href="/forum/connexion" className="nav-auth__login">Connexion</Link>
        <Link href="/forum/inscription" className="nav-auth__register">Inscription</Link>
      </div>
    );
  }

  const recent = [
    ...(activity?.threads ?? []).map(t => ({ ...t, kind: 'topic' })),
    ...(activity?.replies ?? []).map(r => ({ ...r, kind: 'reply' })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return (
    <div className="nav-user" ref={ref}>
      <button
        className={`nav-user__btn ${open ? 'nav-user__btn--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Mon espace"
      >
        <span className="nav-user__avatar">{session.username[0].toUpperCase()}</span>
        <span className="nav-user__name">{session.username}</span>
        <span className="nav-user__chevron">▾</span>
      </button>

      {open && (
        <div className="nav-user__dropdown">
          <div className="nav-user__dropdown-header">
            <span className="nav-user__dropdown-pseudo">{session.username}</span>
            <a href="/api/forum/auth/logout" className="nav-user__logout">Déconnexion</a>
          </div>

          <div className="nav-user__dropdown-links">
            <Link href="/forum/profil" className="nav-user__dropdown-link" onClick={() => setOpen(false)}>
              Mon profil
            </Link>
            <Link href="/forum/nouveau" className="nav-user__dropdown-link nav-user__dropdown-link--cta" onClick={() => setOpen(false)}>
              + Nouveau topic
            </Link>
          </div>

          {recent.length > 0 && (
            <div className="nav-user__activity">
              <span className="nav-user__activity-label">Activité récente</span>
              <ul className="nav-user__activity-list">
                {recent.map(item => (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={`/forum/${item.category}/${item.kind === 'reply' ? item.thread_id : item.id}`}
                      className="nav-user__activity-item"
                      onClick={() => setOpen(false)}
                    >
                      <span className="nav-user__activity-icon">{item.kind === 'reply' ? '↩' : '◈'}</span>
                      <span className="nav-user__activity-title">
                        {item.kind === 'reply' ? item.thread_title : item.title}
                      </span>
                      <span
                        className="nav-user__activity-tag"
                        style={{ color: TAG_COLORS[item.category] }}
                      >
                        {TAG_LABELS[item.category]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activity && recent.length === 0 && (
            <p className="nav-user__empty">Aucune activité pour l'instant.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const pathname                = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <Link href="/" className="navbar__logo">
        <Image src="/nebulor.webp" alt="Nebulor" className="navbar__logo-img" width={120} height={85} priority />
      </Link>

      <ul className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
        {NAV_LINKS.map(({ to, label }) => (
          <li key={to}>
            <Link
              href={to}
              className={`navbar__link ${pathname === to ? 'navbar__link--active' : ''}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar__right">
        <NavUser />
        <button
          className={`navbar__burger ${open ? 'navbar__burger--open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
