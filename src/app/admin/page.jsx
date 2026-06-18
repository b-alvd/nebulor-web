import Link from 'next/link';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import '@/styles/admin/Admin.css';

async function getStats() {
  const [e, c, ch] = await Promise.all([
    db.execute({ sql: 'SELECT COUNT(*) as n FROM entries', args: [] }),
    db.execute({ sql: 'SELECT COUNT(*) as n FROM categories', args: [] }),
    db.execute({ sql: 'SELECT COUNT(*) as n FROM chapters', args: [] }),
  ]);
  return { entries: e.rows[0].n, categories: c.rows[0].n, chapters: ch.rows[0].n };
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  const stats = await getStats();

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Panel Nebulor</h1>
          <p className="admin-sub">Bonjour, {session.username} 👋</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/" className="admin-back">← Voir le site</Link>
          <a href="/api/auth/logout" className="admin-back" style={{ color: 'var(--orange-soft)' }}>Déconnexion</a>
        </div>
      </div>

      <div className="admin-panels">
        {[
          { href: '/admin/personnages', icon: '◈', label: 'Entrées',     desc: 'Personnages, bestiaire, bonus...', count: stats.entries },
          { href: '/admin/categories',  icon: '⬡', label: 'Catégories', desc: "Gérer les sections de l'univers",  count: stats.categories },
          { href: '/admin/chapitres',   icon: '◎', label: 'Chapitres',   desc: 'Gérer les chapitres du webtoon',  count: stats.chapters },
        ].map(p => (
          <Link key={p.href} href={p.href} className="admin-panel">
            <div className="admin-panel__icon">{p.icon}</div>
            <div className="admin-panel__body">
              <h2 className="admin-panel__title">{p.label}</h2>
              <p className="admin-panel__desc">{p.desc}</p>
            </div>
            <div className="admin-panel__count">{p.count}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
