'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/Forum.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/forum/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion.');
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
        <h1 className="forum-new-title">Connexion</h1>

        <form className="forum-form" onSubmit={handleSubmit}>
          <div className="forum-field">
            <label className="forum-label">Email</label>
            <input className="forum-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="forum-field">
            <label className="forum-label">Mot de passe</label>
            <input className="forum-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <p className="forum-error">{error}</p>}
          <div className="forum-form__actions">
            <Link href="/forum/inscription" className="forum-link" style={{ alignSelf: 'center', fontSize: '0.88rem' }}>Pas encore de compte ?</Link>
            <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
