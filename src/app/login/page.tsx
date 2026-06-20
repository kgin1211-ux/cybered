'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get('redirect');
  const redirectTo = (raw && raw.startsWith('/')) ? raw : '/materi-saya';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needVerify, setNeedVerify] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpMsg, setOtpMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.need_verify) {
          setNeedVerify(data.email);
          return;
        }
        setError(data.error || 'Login gagal');
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: needVerify, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verifikasi gagal');
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: needVerify }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Gagal');
      else setOtpMsg('OTP baru dikirim!');
    } catch { setError('Terjadi kesalahan.'); }
    finally { setLoading(false); }
  };

  // ===== VERIFY OTP STEP (when user hasn't verified email) =====
  if (needVerify) {
    return (
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <span style={{ fontSize: 56, display: 'block', marginBottom: 8 }}>📧</span>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Fredoka One', cursive", marginBottom: 8 }}>
          Verifikasi Email
        </h1>
        <p style={{ color: '#666', marginBottom: 20, fontSize: 14 }}>
          Akun <strong>{needVerify}</strong> belum diverifikasi. Masukkan kode OTP dari email kamu.
        </p>

        {otpMsg && (
          <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
            ✅ {otpMsg}
          </div>
        )}

        {error && (
          <div style={{ background: '#FFEBEE', color: '#C62828', padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Kode OTP</label>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              required
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 800 }}
            />
          </div>
          <button type="submit" className="btn btn-blue" disabled={loading || otp.length < 6} style={{ fontSize: 16, padding: '14px', width: '100%' }}>
            {loading ? 'Memverifikasi...' : '✅ Verifikasi & Login'}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 13, color: '#999' }}>
          Tidak terima kode?{' '}
          <button onClick={handleResendOtp} disabled={loading} style={{ background: 'none', border: 'none', color: '#1565C0', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>
            Kirim ulang OTP
          </button>
        </p>

        <button onClick={() => setNeedVerify(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 13, marginTop: 12, textDecoration: 'underline' }}>
          ← Kembali ke login
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 32, textAlign: 'center' }}>
      <span style={{ fontSize: 56, display: 'block', marginBottom: 8 }}>🔐</span>
      <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Fredoka One', cursive", marginBottom: 8 }}>
        Login
      </h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Masuk untuk mengakses materi kamu
      </p>

      {error && (
        <div style={{
          background: '#FFEBEE', color: '#C62828', padding: '12px 16px',
          borderRadius: 12, marginBottom: 16, fontWeight: 600, fontSize: 14
        }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ textAlign: 'left' }}>
          <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" required />
        </div>
        <div style={{ textAlign: 'left' }}>
          <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <button type="submit" className="btn btn-blue" disabled={loading} style={{ fontSize: 16, padding: '14px', width: '100%' }}>
          {loading ? 'Memproses...' : '🚀 Masuk'}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 14, color: '#666' }}>
        Belum punya akun?{' '}
        <Link href="/register" style={{ color: '#1565C0', fontWeight: 700, textDecoration: 'none' }}>
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px' }}>
        <Suspense fallback={<div className="card" style={{ padding: 32, textAlign: 'center' }}><span className="animate-bounce-soft" style={{ fontSize: 48 }}>⏳</span><p>Memuat...</p></div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
