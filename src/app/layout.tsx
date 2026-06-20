import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CyberEd - Kuasai Cyber Security dari Dasar',
  description: 'Platform edukasi cybersecurity terlengkap. Pelajari serangan dan pertahanan cyber dari dasar hingga teknik paling dalam.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
