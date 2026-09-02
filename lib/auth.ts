import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from './session';
import { redirect } from 'next/navigation';
import prisma from './prisma';

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true, stats: true, streak: true },
  });
  
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireGuest() {
  const session = await getSession();
  if (session.isLoggedIn) {
    redirect('/');
  }
}
