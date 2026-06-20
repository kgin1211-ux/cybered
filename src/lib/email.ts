import nodemailer from 'nodemailer';

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const transporter = process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'Zaennrdev@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null;

export async function sendOtpEmail(to: string, otp: string, nama: string) {
  if (!transporter) {
    console.log(`[OTP DEV] ${to}: ${otp}`);
    return { success: true, mode: 'log' };
  }

  try {
    await transporter.sendMail({
      from: '"CyberEd" <Zaennrdev@gmail.com>',
      to,
      subject: '🔐 Kode Verifikasi OTP — CyberEd',
      html: `
        <div style="max-width: 480px; margin: 0 auto; font-family: Arial, sans-serif; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 48px;">🛡️</span>
            <h1 style="font-size: 24px; color: #333; margin: 8px 0;">CyberEd</h1>
          </div>
          <div style="background: #E3F2FD; border-radius: 16px; padding: 24px; text-align: center;">
            <p style="font-size: 16px; color: #555; margin: 0 0 8px;">Halo <strong>${nama}</strong>,</p>
            <p style="font-size: 14px; color: #666; margin: 0 0 20px;">
              Gunakan kode OTP di bawah untuk verifikasi akun kamu:
            </p>
            <div style="background: #1565C0; color: #fff; font-size: 32px; font-weight: 800;
              letter-spacing: 8px; padding: 16px 24px; border-radius: 12px; display: inline-block;
              font-family: 'Courier New', monospace;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #999; margin: 16px 0 0;">
              Kode berlaku 5 menit. Jangan bagikan kode ini ke siapapun.
            </p>
          </div>
          <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">
            © ${new Date().getFullYear()} CyberEd — Platform Edukasi Cybersecurity
          </p>
        </div>
      `,
    });
    return { success: true, mode: 'email' };
  } catch (err: any) {
    console.error('[Nodemailer Error]', err.message || err);
    return { success: false, error: err.message };
  }
}
