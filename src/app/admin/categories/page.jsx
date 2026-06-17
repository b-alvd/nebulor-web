'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/styles/admin/Admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ label: '', slug: '', icon: '◈', description: '', color: '#4ecdc4' });

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories);
  }, []);

  const handleSave = async () => {
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ label: '', slug: '', icon: '◈', description: '', color: '#4ecdc4' });
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie et toutes ses entrées ?')) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    setCategories(c => c.filter(x => x.id !== id));
  };

  const autoSlug = (label) => label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <Link href="/admin" className="admin-back">← Dashboard</Link>
          <h1 className="admin-title">Catégories</h1>
        </div>
      </div>

      <div className="admin-layout">
        <div className="admin-form">
          <h2 className="admin-form__title">Nouvelle catégorie</h2>

          <div className="admin-field">
            <label>Nom *</label>
            <input type="text" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value, slug: autoSlug(e.target.value) }))} placeholder="Ex: Armes légendaires" />
          </div>

          <div className="admin-field">
            <label>Slug (URL)</label>
            <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="armes-legendaires" />
          </div>

          <div className="admin-field">
            <label>Icône</label>
            <input type="text" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="◈" maxLength={2} />
          </div>

          <div className="admin-field">
            <label>Description</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description courte..." />
          </div>

          <div className="admin-field">
            <label>Couleur</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: '40px', height: '36px', border: 'none', background: 'none', cursor: 'pointer' }} />
              <input type="text" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="#4ecdc4" />
            </div>
          </div>

          <div className="admin-form__actions">
            <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={!form.label || !form.slug}>
              Créer la catégorie
            </button>
          </div>
        </div>

        <div className="admin-list">
          <h2 className="admin-form__title">{categories.length} catégorie{categories.length > 1 ? 's' : ''}</h2>
          {categories.map(cat => (
            <div key={cat.id} className="admin-entry">
              <div className="admin-entry__icon" style={{ color: cat.color }}>{cat.icon}</div>
              <div className="admin-entry__info">
                <strong>{cat.label}</strong>
                <span>/{cat.slug}</span>
              </div>
              <div className="admin-entry__actions">
                <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(cat.id)}>Suppr.</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
