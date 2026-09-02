'use server';

import { getSession } from '@/lib/session-utils';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/constants';

interface AuthResult {
  error?: string;
  success?: boolean;
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validation
  if (!name || !email || !password) {
    return { error: 'All fields are required.' };
  }

  if (name.length < 2) {
    return { error: 'Name must be at least 2 characters.' };
  }

  if (!email.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  try {
    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: 'An account with this email already exists.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile, stats, and streak
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: { create: { title: 'Student', quote: 'Building myself, one skill at a time.' } },
        stats: { create: {} },
        streak: { create: {} },
      },
    });

    // Seed achievements if none exist
    const achievementCount = await prisma.achievement.count();
    if (achievementCount === 0) {
      await prisma.achievement.createMany({
        data: ACHIEVEMENT_DEFINITIONS.map((a) => ({
          key: a.key,
          title: a.title,
          description: a.description,
          icon: a.icon,
          xpReward: a.xpReward,
          condition: a.condition,
        })),
      });
    }

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.name = user.name;
    session.isLoggedIn = true;
    await session.save();
  } catch (e) {
    console.error('Registration error:', e);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/');
}

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: 'Invalid email or password.' };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return { error: 'Invalid email or password.' };
    }

    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.name = user.name;
    session.isLoggedIn = true;
    await session.save();
  } catch (e) {
    console.error('Login error:', e);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/');
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect('/login');
}
