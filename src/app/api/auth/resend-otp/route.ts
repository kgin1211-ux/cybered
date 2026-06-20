import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendOtpEmail, generateOtp } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    const db = getDb();

    const user = db.prepare('SELECT id, nama, is_verified, otp_expires FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      return NextResponse.json({ error: 'Email tidak ditemukan' }, { status: 404 });
    }

    if (user.is_verified) {
      return NextResponse.json({ error: 'Akun sudah diverifikasi. Silakan login.' }, { status: 400 });
    }

    // Cooldown: minimal 60 detik antar kirim ulang
    if (user.otp_expires) {
      const expiry = new Date(user.otp_expires.replace(' ', 'T')).getTime();
      const remainingMs = expiry - Date.now();
      // OTP expires in 5 min = 300000ms. If > 4 min remaining, reject (still in cooldown)
      if (remainingMs > 4 * 60 * 1000) {
        const waitSeconds = Math.ceil((remainingMs - 4 * 60 * 1000) / 1000);
        return NextResponse.json({
          error: `Silakan tunggu ${waitSeconds} detik sebelum kirim ulang OTP.`,
        }, { status: 429 });
      }
    }

    const otp = generateOtp();
    const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    // Reset attempts on new OTP
    db.prepare('UPDATE users SET otp_code = ?, otp_expires = ?, otp_attempts = 0 WHERE id = ?').run(otp, expires, user.id);

    const emailResult = await sendOtpEmail(email, otp, user.nama);
    console.log('[OTP Resent]', email, otp, emailResult.mode || 'email');

    return NextResponse.json({
      success: true,
      message: 'Kode OTP baru telah dikirim ke email kamu',
    });
  } catch (err) {
    console.error('[Resend OTP Error]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
