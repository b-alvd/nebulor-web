'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import '@/styles/Navbar.css';

const NAV_LINKS = [
  { to: '/',            label: 'Accueil' },
  { to: '/communaute',  label: 'Communauté' },
  { to: '/chapitres',   label: 'Chapitres' },
  { to: '/univers',     label: 'Univers' },
  { to: '/boutique',    label: 'Boutique' },
];

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

      <button
        className={`navbar__burger ${open ? 'navbar__burger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  );
}
