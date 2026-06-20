import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getUserFromCookies();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: { id: user.id, nama: user.nama, email: user.email }
  });
}
