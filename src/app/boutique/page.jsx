'use client';

import { useState } from 'react';
import '@/styles/Shop.css';

const SECTIONS = [
  {
    id: 'affiches',
    label: 'Impression',
    title: 'Affiches & Prints',
    icon: '✦',
    products: [
      { id: 1, name: 'Cover - Édition Standard', format: '30×40 cm · Papier mat 200g', price: '18,00 €', badge: null },
      { id: 2, name: 'Cover - Édition Premium', format: '50×70 cm · Papier brillant 250g', price: '28,00 €', badge: 'Populaire' },
      { id: 3, name: 'Affiche Personnage', format: '30×40 cm · Papier mat 200g', price: '18,00 €', badge: 'Limité' },
    ],
  },
  {
    id: 'stickers',
    label: 'Papeterie',
    title: 'Stickers & Cartes',
    icon: '◈',
    products: [
      { id: 4, name: 'Pack Stickers', format: '6 stickers vinyle holographique', price: '8,00 €', badge: null },
      { id: 5, name: 'Sticker XL Personnage', format: '15×15 cm · Vinyle waterproof', price: '5,00 €', badge: null },
      { id: 6, name: 'Marque-pages - Set de 3', format: '5×21 cm · Plastifié brillant', price: '6,00 €', badge: 'Nouveau' },
    ],
  },
  {
    id: 'merch',
    label: 'Vêtements',
    title: 'Merch',
    icon: '◇',
    products: [
      { id: 9,  name: 'T-Shirt', format: 'Unisexe · S au XXL · Coton', price: '26,00 €', badge: null },
      { id: 10, name: 'Hoodie', format: 'Unisexe · S au XXL · Molleton épais', price: '48,00 €', badge: 'Populaire' },
      { id: 12, name: 'Casquette', format: 'Taille unique · Broderie', price: '22,00 €', badge: null },
    ],
  },
  {
    id: 'goodies',
    label: 'Collectibles',
    title: 'Goodies',
    icon: '⬡',
    products: [
      { id: 15, name: 'Carnet A5', format: 'A5 · 120 pages · Couverture rigide', price: '14,00 €', badge: null },
      { id: 16, name: 'Mug', format: '33 cl · Céramique · Lave-vaisselle OK', price: '16,00 €', badge: null },
    ],
  },
];

const COMING = [
  { name: 'Figurines Personnages', hint: 'Résine · Édition numérotée' },
  { name: 'Art Book Vol.1', hint: 'Coulisses, croquis, lore · Couverture rigide' },
  { name: 'Pack Collector', hint: "Affiche + Pin's + Cartes · Boîte exclusive" },
];

const FILTERS = [
  { id: 'all',       label: 'Tout' },
  { id: 'affiches',  label: 'Affiches & Prints' },
  { id: 'stickers',  label: 'Stickers & Cartes' },
  { id: 'merch',     label: 'Merch' },
  { id: 'goodies',   label: 'Goodies' },
  { id: 'limité',    label: 'Limité' },
  { id: 'nouveau',   label: 'Nouveau' },
  { id: 'populaire', label: 'Populaire' },
];

export default function Shop() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredSections = SECTIONS.map(section => {
    if (activeFilter === 'all') return section;
    if (activeFilter === section.id) return section;
    const filtered = section.products.filter(p =>
      p.badge && p.badge.toLowerCase() === activeFilter
    );
    if (filtered.length === 0) return null;
    return { ...section, products: filtered };
  }).filter(Boolean);

  return (
    <main className="shop-page">

      <div className="shop-page__hero">
        <span className="section-label">Boutique</span>
        <h1 className="shop-page__title">L&apos;Univers Nebulor</h1>
        <p className="shop-page__sub">
          Chaque pièce est un fragment de l&apos;histoire. Éditions limitées, créées avec soin.
        </p>
        <div className="shop-page__notice">
          <span className="shop-notice__dot" />
          Boutique en cours de développement, les produits ne sont pas encore disponibles à l&apos;achat.
        </div>
      </div>

      <div className="shop-filters">
        <div className="shop-filters__inner">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`shop-filter ${activeFilter === f.id ? 'shop-filter--active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="shop-page__content">
        {filteredSections.length === 0 ? (
          <p className="shop-empty">Aucun produit dans cette catégorie pour le moment.</p>
        ) : (
          filteredSections.map(section => (
            <div className="shop-section" key={section.id}>
              <div className="shop-section__header">
                <span className="shop-section__icon">{section.icon}</span>
                <span className="arc__label">{section.label}</span>
                <h2 className="shop-section__title">{section.title}</h2>
                <div className="arc__line" />
              </div>
              <div className="shop-section__grid">
                {section.products.map(product => (
                  <div className="product-card" key={product.id}>
                    {product.badge && (
                      <span className={`product-card__badge product-card__badge--${product.badge.toLowerCase()}`}>
                        {product.badge}
                      </span>
                    )}
                    <div className="product-card__visual">
                      <div className="product-card__placeholder"><span>{section.icon}</span></div>
                    </div>
                    <div className="product-card__info">
                      <h3 className="product-card__name">{product.name}</h3>
                      <p className="product-card__format">{product.format}</p>
                      <div className="product-card__footer">
                        <span className="product-card__price">{product.price}</span>
                        <button className="product-card__btn" disabled>Bientôt</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {activeFilter === 'all' && (
          <div className="shop-coming">
            <div className="shop-section__header">
              <span className="shop-section__icon">◌</span>
              <span className="arc__label">Prochainement</span>
              <h2 className="shop-section__title">À venir</h2>
              <div className="arc__line" />
            </div>
            <div className="shop-coming__grid">
              {COMING.map((item, i) => (
                <div className="coming-card" key={i}>
                  <div className="coming-card__icon">?</div>
                  <div>
                    <p className="coming-card__name">{item.name}</p>
                    <p className="coming-card__hint">{item.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
