import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'cybered-secret-key-2024-secure';
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || 'cybered-admin-secret-key-2024-secure';

export interface UserPayload {
  id: string;
  nama: string;
  email: string;
}

export interface AdminPayload {
  id: string;
  username: string;
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function generateAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_ADMIN_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_ADMIN_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getUserFromCookies(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAdminFromCookies(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
