
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const sessionOptions = {
  cookieName: 'tiktok_bridge_session',
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export async function getSession() {
  const session = await getIronSession(cookies(), sessionOptions);
  return session;
}
