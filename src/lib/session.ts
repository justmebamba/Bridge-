
'use server';

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { AdminUser } from './types';

const sessionOptions = {
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// Define the session data structure, omitting sensitive fields like passwordHash
type SessionData = {
  user?: Omit<AdminUser, 'passwordHash'>;
  isLoggedIn?: boolean;
}

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}

export async function login(user: Omit<AdminUser, 'passwordHash'>) {
  const session = await getSession();
  session.user = user;
  session.isLoggedIn = true;
  await session.save();
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}
