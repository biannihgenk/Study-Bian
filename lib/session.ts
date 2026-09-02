import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId?: number;
  email?: string;
  name?: string;
  isLoggedIn?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'bian-os-fallback-secret-key-must-be-at-least-32-chars',
  cookieName: 'bian-os-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
