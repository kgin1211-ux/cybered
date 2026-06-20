'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [noTelp, setNoTelp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, password, no_telepon: noTelp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registrasi gagal');
        return;
      }
      setOtpMessage(data.message || 'Kode OTP telah dikirim ke email kamu');
      setStep('verify');
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
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verifikasi gagal');
        return;
      }
      router.push('/materi-saya');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setOtpMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal kirim ulang OTP');
      } else {
        setOtpMessage(data.message || 'OTP baru dikirim!');
      }
    } catch {
      setError('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  // ===== VERIFY OTP STEP =====
  if (step === 'verify') {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px' }}>
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <span style={{ fontSize: 56, display: 'block', marginBottom: 8 }}>📧</span>
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Fredoka One', cursive", marginBottom: 8 }}>
              Verifikasi Email
            </h1>
            <p style={{ color: '#666', marginBottom: 8, fontSize: 14 }}>
              Kode OTP telah dikirim ke:
            </p>
            <p style={{ fontWeight: 700, color: '#1565C0', marginBottom: 20, fontSize: 15 }}>
              {email}
            </p>

            {otpMessage && (
              <div style={{
                background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px',
                borderRadius: 12, marginBottom: 16, fontWeight: 600, fontSize: 14
              }}>
                ✅ {otpMessage}
              </div>
            )}

            {error && (
              <div style={{
                background: '#FFEBEE', color: '#C62828', padding: '12px 16px',
                borderRadius: 12, marginBottom: 16, fontWeight: 600, fontSize: 14
              }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Masukkan Kode OTP</label>
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
                {loading ? 'Memverifikasi...' : '✅ Verifikasi OTP'}
              </button>
            </form>

            <p style={{ marginTop: 16, fontSize: 13, color: '#999' }}>
              Tidak terima kode?{' '}
              <button
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  background: 'none', border: 'none', color: '#1565C0',
                  fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontSize: 13
                }}
              >
                Kirim ulang OTP
              </button>
            </p>

            <Link href="/register" onClick={() => setStep('register')} style={{ display: 'block', marginTop: 12, fontSize: 13, color: '#999', textDecoration: 'none' }}>
              ← Ganti email / daftar ulang
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ===== REGISTER STEP =====
  return (
    <>
      <Header />
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px' }}>
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <span style={{ fontSize: 56, display: 'block', marginBottom: 8 }}>✨</span>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Fredoka One', cursive", marginBottom: 8 }}>
            Daftar
          </h1>
          <p style={{ color: '#666', marginBottom: 24 }}>
            Buat akun untuk mulai belajar cybersecurity
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
              <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Nama Lengkap</label>
              <input className="input" type="text" value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama kamu" required />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Email (Gmail / Akun Google)</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@gmail.com" required />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 karakter" required minLength={6} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Nomor Telepon (WA)</label>
              <input className="input" type="tel" value={noTelp} onChange={e => setNoTelp(e.target.value)} placeholder="08xxxxxxxxxx" required />
            </div>
            <button type="submit" className="btn btn-yellow" disabled={loading} style={{ fontSize: 16, padding: '14px', width: '100%' }}>
              {loading ? 'Mengirim OTP...' : '🎉 Daftar & Verifikasi'}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 14, color: '#666' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: '#1565C0', fontWeight: 700, textDecoration: 'none' }}>
              Login di sini
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
