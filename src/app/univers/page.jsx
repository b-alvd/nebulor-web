import Link from 'next/link';
import { db } from '@/lib/db';
import '@/styles/Univers.css';

export const revalidate = 60;

async function getCategories() {
  const result = await db.execute({
    sql: 'SELECT *, (SELECT COUNT(*) FROM entries WHERE category_id = categories.id) as count FROM categories ORDER BY sort_order',
    args: [],
  });
  return result.rows;
}

export default async function UniversPage() {
  const categories = await getCategories();

  return (
    <main className="univers-page">
      <div className="univers-page__hero">
        <span className="section-label">Découvrir</span>
        <h1 className="univers-page__title">L&apos;Univers Nebulor</h1>
        <p className="univers-page__sub">
          Plonge dans le monde de Nebulor, ses habitants, ses créatures, ses mystères.
        </p>
      </div>

      <div className="univers-page__grid">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/univers/${cat.slug}`}
            className="univers-card"
            style={{ '--card-color': cat.color }}
          >
            <div className="univers-card__icon">{cat.icon}</div>
            <div className="univers-card__body">
              <h2 className="univers-card__title">{cat.label}</h2>
              {cat.description && (
                <p className="univers-card__desc">{cat.description}</p>
              )}
              <span className="univers-card__count">
                {cat.count} {cat.count > 1 ? 'entrées' : 'entrée'}
              </span>
            </div>
            <div className="univers-card__arrow">→</div>
            <div className="univers-card__glow" />
          </Link>
        ))}
      </div>
    </main>
  );
}
