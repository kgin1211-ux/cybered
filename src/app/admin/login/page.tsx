'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login gagal');
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#FFFEF7', padding: 24
    }}>
      <div className="card" style={{ padding: 32, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 8 }}>⚙️</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Fredoka One', cursive", marginBottom: 8 }}>
          Admin Login
        </h1>
        <p style={{ color: '#666', marginBottom: 24 }}>Dashboard CyberEd</p>

        {error && (
          <div style={{ background: '#FFEBEE', color: '#C62828', padding: '10px 14px', borderRadius: 12, marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Username</label>
            <input className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-blue" disabled={loading} style={{ fontSize: 16, padding: '14px', width: '100%' }}>
            {loading ? 'Memproses...' : '🔑 Login Admin'}
          </button>
        </form>
      </div>
    </main>
  );
}
