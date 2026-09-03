'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session-utils';
import { revalidatePath } from 'next/cache';

async function getUserId() {
  const session = await getSession();
  if (!session.userId) throw new Error('Unauthorized');
  return session.userId;
}

export async function updateProfile(formData: FormData) {
  const userId = await getUserId();
  const name = formData.get('name') as string;
  const bio = (formData.get('bio') as string) || '';
  const title = (formData.get('title') as string) || '';
  const quote = (formData.get('quote') as string) || '';

  if (!name?.trim()) return { error: 'Name is required.' };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
    });
    await prisma.profile.upsert({
      where: { userId },
      update: { bio, title, quote },
      create: { userId, bio, title, quote },
    });
    revalidatePath('/profile');
    return { success: true };
  } catch (e) {
    console.error('Update profile error:', e);
    return { error: 'Failed to update profile.' };
  }
}

export async function markNotificationRead(notificationId: number) {
  const userId = await getUserId();
  try {
    await prisma.notification.update({
      where: { id: notificationId, userId },
      data: { read: true },
    });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    console.error('Mark notification error:', e);
    return { error: 'Failed to mark notification.' };
  }
}

export async function markAllNotificationsRead() {
  const userId = await getUserId();
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    console.error('Mark all notifications error:', e);
    return { error: 'Failed to mark notifications.' };
  }
}
