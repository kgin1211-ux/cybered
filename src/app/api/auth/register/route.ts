import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendOtpEmail, generateOtp } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { nama, email, password, no_telepon } = await request.json();

    if (!nama || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const db = getDb();

    // Cek email sudah terdaftar
    const existing = db.prepare('SELECT id, is_verified FROM users WHERE email = ?').get(email) as any;
    if (existing) {
      if (existing.is_verified) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
      }
      // User exists but unverified — resend OTP instead of recreating
      const otp = generateOtp();
      const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
      db.prepare('UPDATE users SET otp_code = ?, otp_expires = ?, otp_attempts = 0, nama = ?, password = ?, no_telepon = ? WHERE id = ?')
        .run(otp, expires, nama, bcrypt.hashSync(password, 10), no_telepon || '', existing.id);

      const emailResult = await sendOtpEmail(email, otp, nama);
      console.log('[OTP Resent]', email, otp, emailResult.mode || 'email');

      return NextResponse.json({
        success: true,
        message: 'OTP dikirim ulang ke email kamu',
        email,
        step: 'verify_otp',
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    // Generate OTP
    const otp = generateOtp();
    const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(
      'INSERT INTO users (id, nama, email, password, no_telepon, is_verified, otp_code, otp_expires) VALUES (?, ?, ?, ?, ?, 0, ?, ?)'
    ).run(id, nama, email, hashedPassword, no_telepon || '', otp, expires);

    // Send OTP email
    const emailResult = await sendOtpEmail(email, otp, nama);
    console.log('[OTP Sent]', email, otp, emailResult.mode || 'email');

    return NextResponse.json({
      success: true,
      message: 'Kode OTP telah dikirim ke email kamu',
      email,
      step: 'verify_otp',
    });
  } catch (err) {
    console.error('[Register Error]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
