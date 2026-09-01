'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/Forum.css';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/forum/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur d\'inscription.');
      router.push('/forum');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="forum-page">
      <div className="forum-inner forum-inner--narrow">
        <Link href="/forum" className="forum-back">← Forum</Link>
        <h1 className="forum-new-title">Créer un compte</h1>

        <form className="forum-form" onSubmit={handleSubmit}>
          <div className="forum-field">
            <label className="forum-label">Pseudo <span className="forum-required">*</span></label>
            <input className="forum-input" type="text" value={username} onChange={e => setUsername(e.target.value)} required minLength={2} maxLength={32} placeholder="Ton pseudo visible sur le forum" autoComplete="username" />
          </div>
          <div className="forum-field">
            <label className="forum-label">Email <span className="forum-required">*</span></label>
            <input className="forum-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="forum-field">
            <label className="forum-label">Mot de passe <span className="forum-required">*</span></label>
            <input className="forum-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Minimum 8 caractères" autoComplete="new-password" />
          </div>
          {error && <p className="forum-error">{error}</p>}
          <div className="forum-form__actions">
            <Link href="/forum/connexion" className="forum-link" style={{ alignSelf: 'center', fontSize: '0.88rem' }}>Déjà un compte ?</Link>
            <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? 'Création…' : 'Créer mon compte'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
