import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email dan kode OTP wajib diisi' }, { status: 400 });
    }

    const db = getDb();

    const user = db.prepare(
      'SELECT id, nama, email, no_telepon, otp_code, otp_expires, otp_attempts, is_verified FROM users WHERE email = ?'
    ).get(email) as any;

    if (!user) {
      return NextResponse.json({ error: 'Email tidak ditemukan' }, { status: 404 });
    }

    if (user.is_verified) {
      return NextResponse.json({ error: 'Akun sudah diverifikasi. Silakan login.' }, { status: 400 });
    }

    // Rate limiting: lock after 5 failed attempts
    if (user.otp_attempts >= 5) {
      return NextResponse.json({
        error: 'Terlalu banyak percobaan. Kirim ulang OTP dan coba lagi.',
      }, { status: 429 });
    }

    // Check OTP
    if (user.otp_code !== otp) {
      db.prepare('UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = ?').run(user.id);
      const remaining = 5 - (user.otp_attempts + 1);
      return NextResponse.json({
        error: `Kode OTP salah. ${remaining > 0 ? `Sisa ${remaining}x percobaan.` : 'Akun terkunci. Kirim ulang OTP.'}`,
      }, { status: 400 });
    }

    // Check expiry
    if (user.otp_expires) {
      const expiry = new Date(user.otp_expires.replace(' ', 'T')).getTime();
      if (Date.now() > expiry) {
        return NextResponse.json({ error: 'Kode OTP sudah kadaluarsa. Kirim ulang OTP.' }, { status: 400 });
      }
    }

    // Verify user — reset OTP fields
    db.prepare('UPDATE users SET is_verified = 1, otp_code = NULL, otp_expires = NULL, otp_attempts = 0 WHERE id = ?').run(user.id);

    // Auto-login
    const token = generateToken({ id: user.id, nama: user.nama, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, nama: user.nama, email: user.email, no_telepon: user.no_telepon || '' },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[Verify OTP Error]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
