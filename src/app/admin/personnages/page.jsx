'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/admin/Admin.css';

const DEFAULT_FIELDS = {
  personnages: [
    { key: 'Âge', placeholder: '22 ans' },
    { key: 'Rang', placeholder: 'DICE' },
    { key: 'Capacité', placeholder: 'Contrôle les éléments...' },
    { key: 'Spécificité', placeholder: 'Optionnel...' },
  ],
  bestiaire: [
    { key: 'Type', placeholder: 'Prédateur, Parasite...' },
    { key: 'Habitat', placeholder: 'Forêt, Montagne...' },
    { key: 'Dangerosité', placeholder: 'Faible, Élevée...' },
  ],
};

export default function AdminEntries() {
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [form, setForm] = useState({ name: '', image_url: '', fields: {} });
  const [editing, setEditing] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(data => {
      setCategories(data);
      if (data[0]) setSelectedCat(data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedCat) return;
    fetch(`/api/admin/entries?category=${selectedCat.slug}`)
      .then(r => r.json())
      .then(setEntries);
  }, [selectedCat]);

  const currentFields = DEFAULT_FIELDS[selectedCat?.slug] || [];

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const { url } = await res.json();
    setForm(f => ({ ...f, image_url: url }));
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSave = async () => {
    const payload = {
      category_id: selectedCat.id,
      name: form.name,
      image_url: form.image_url,
      fields: form.fields,
    };

    if (editing) {
      await fetch(`/api/admin/entries/${editing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setForm({ name: '', image_url: '', fields: {} });
    setEditing(null);
    fetch(`/api/admin/entries?category=${selectedCat.slug}`)
      .then(r => r.json()).then(setEntries);
  };

  const handleEdit = (entry) => {
    setEditing(entry.id);
    setForm({ name: entry.name, image_url: entry.image_url || '', fields: entry.fields || {} });
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette entrée ?')) return;
    await fetch(`/api/admin/entries/${id}`, { method: 'DELETE' });
    setEntries(e => e.filter(x => x.id !== id));
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <Link href="/admin" className="admin-back">← Dashboard</Link>
          <h1 className="admin-title">Entrées</h1>
        </div>
      </div>

      {/* Sélection catégorie */}
      <div className="admin-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`admin-tab ${selectedCat?.id === cat.id ? 'admin-tab--active' : ''}`}
            onClick={() => setSelectedCat(cat)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="admin-layout">
        {/* Formulaire */}
        <div className="admin-form">
          <h2 className="admin-form__title">{editing ? 'Modifier' : 'Ajouter'} une entrée</h2>

          <div className="admin-field">
            <label>Nom *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nom du personnage..."
            />
          </div>

          {/* Image upload */}
          <div className="admin-field">
            <label>Image</label>
            <div
              className={`admin-dropzone ${dragging ? 'admin-dropzone--active' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {form.image_url ? (
                <div className="admin-dropzone__preview">
                  <Image src={form.image_url} alt="" width={80} height={80} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                  <span>{form.image_url.split('/').pop()}</span>
                </div>
              ) : (
                <div className="admin-dropzone__placeholder">
                  {uploading ? 'Upload en cours...' : 'Glisser une image ou cliquer'}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
            <input
              type="text"
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="Ou coller une URL d'image..."
              style={{ marginTop: '0.5rem' }}
            />
          </div>

          {/* Champs dynamiques */}
          {currentFields.map(f => (
            <div className="admin-field" key={f.key}>
              <label>{f.key}</label>
              <input
                type="text"
                value={form.fields[f.key] || ''}
                onChange={e => setForm(prev => ({ ...prev, fields: { ...prev.fields, [f.key]: e.target.value } }))}
                placeholder={f.placeholder}
              />
            </div>
          ))}

          {/* Champs custom additionnels */}
          <div className="admin-field">
            <label>Champ personnalisé</label>
            <div className="admin-custom-field">
              <input type="text" placeholder="Clé" id="custom-key" />
              <input type="text" placeholder="Valeur" id="custom-val" />
              <button onClick={() => {
                const key = document.getElementById('custom-key').value;
                const val = document.getElementById('custom-val').value;
                if (key && val) setForm(f => ({ ...f, fields: { ...f.fields, [key]: val } }));
              }}>+</button>
            </div>
          </div>

          <div className="admin-form__actions">
            <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={!form.name}>
              {editing ? 'Enregistrer' : 'Ajouter'}
            </button>
            {editing && (
              <button className="admin-btn admin-btn--ghost" onClick={() => { setEditing(null); setForm({ name: '', image_url: '', fields: {} }); }}>
                Annuler
              </button>
            )}
          </div>
        </div>

        {/* Liste */}
        <div className="admin-list">
          <h2 className="admin-form__title">{entries.length} entrée{entries.length > 1 ? 's' : ''}</h2>
          {entries.length === 0 ? (
            <p className="admin-empty">Aucune entrée dans cette catégorie.</p>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="admin-entry">
                {entry.image_url && (
                  <div className="admin-entry__img">
                    <Image src={entry.image_url} alt={entry.name} width={48} height={48} style={{ objectFit: 'cover', borderRadius: '3px' }} />
                  </div>
                )}
                <div className="admin-entry__info">
                  <strong>{entry.name}</strong>
                  <span>{Object.entries(entry.fields || {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}</span>
                </div>
                <div className="admin-entry__actions">
                  <button className="admin-btn admin-btn--sm" onClick={() => handleEdit(entry)}>Éditer</button>
                  <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(entry.id)}>Suppr.</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
