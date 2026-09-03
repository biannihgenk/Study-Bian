'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session-utils';
import { revalidatePath } from 'next/cache';
import { XP_REWARDS } from '@/lib/constants';

async function getUserId() {
  const session = await getSession();
  if (!session.userId) throw new Error('Unauthorized');
  return session.userId;
}

async function awardXp(userId: number, amount: number) {
  const stats = await prisma.userStats.upsert({
    where: { userId },
    update: { totalXp: { increment: amount } },
    create: { userId, totalXp: amount },
  });
  const newLevel = Math.floor(stats.totalXp / 250) + 1;
  if (newLevel !== stats.level) {
    await prisma.userStats.update({ where: { userId }, data: { level: newLevel } });
  }
}

async function updateStreak(userId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const streak = await prisma.userStreak.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  if (streak.lastActiveDate) {
    const lastActive = new Date(streak.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return;
    if (diffDays === 1) {
      const newStreak = streak.currentStreak + 1;
      await prisma.userStreak.update({
        where: { userId },
        data: { currentStreak: newStreak, longestStreak: Math.max(newStreak, streak.longestStreak), lastActiveDate: today },
      });
    } else {
      await prisma.userStreak.update({ where: { userId }, data: { currentStreak: 1, lastActiveDate: today } });
    }
  } else {
    await prisma.userStreak.update({ where: { userId }, data: { currentStreak: 1, longestStreak: 1, lastActiveDate: today } });
  }
}

// ==========================================
// LEARNING SUBJECTS
// ==========================================

export async function createSubject(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || '';
  const icon = (formData.get('icon') as string) || '📚';
  const color = (formData.get('color') as string) || '#6366f1';

  if (!title?.trim()) return { error: 'Title is required.' };

  try {
    const maxOrder = await prisma.learningSubject.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    await prisma.learningSubject.create({
      data: { userId, title: title.trim(), description, icon, color, order: (maxOrder?.order || 0) + 1 },
    });
    revalidatePath('/');
    revalidatePath('/study-journey/learning');
    return { success: true };
  } catch (e) {
    console.error('Create subject error:', e);
    return { error: 'Failed to create subject.' };
  }
}

export async function updateSubject(subjectId: number, formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || '';
  const icon = (formData.get('icon') as string) || '📚';
  const color = (formData.get('color') as string) || '#6366f1';

  if (!title?.trim()) return { error: 'Title is required.' };

  try {
    await prisma.learningSubject.update({
      where: { id: subjectId, userId },
      data: { title: title.trim(), description, icon, color },
    });
    revalidatePath('/');
    revalidatePath('/study-journey/learning');
    return { success: true };
  } catch (e) {
    console.error('Update subject error:', e);
    return { error: 'Failed to update subject.' };
  }
}

export async function deleteSubject(subjectId: number) {
  const userId = await getUserId();
  try {
    await prisma.learningSubject.delete({ where: { id: subjectId, userId } });
    revalidatePath('/');
    revalidatePath('/study-journey/learning');
    return { success: true };
  } catch (e) {
    console.error('Delete subject error:', e);
    return { error: 'Failed to delete subject.' };
  }
}

// ==========================================
// LEARNING TOPICS
// ==========================================

export async function createTopic(subjectId: number, title: string) {
  const userId = await getUserId();
  const subject = await prisma.learningSubject.findFirst({ where: { id: subjectId, userId } });
  if (!subject) return { error: 'Subject not found.' };
  if (!title?.trim()) return { error: 'Title is required.' };

  try {
    const maxOrder = await prisma.learningTopic.findFirst({
      where: { subjectId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    await prisma.learningTopic.create({
      data: { subjectId, title: title.trim(), order: (maxOrder?.order || 0) + 1 },
    });
    revalidatePath('/study-journey/learning');
    return { success: true };
  } catch (e) {
    console.error('Create topic error:', e);
    return { error: 'Failed to create topic.' };
  }
}

export async function toggleTopic(topicId: number) {
  const userId = await getUserId();
  try {
    const topic = await prisma.learningTopic.findUnique({
      where: { id: topicId },
      include: { subject: true },
    });
    if (!topic || topic.subject.userId !== userId) return { error: 'Not found.' };

    await prisma.learningTopic.update({
      where: { id: topicId },
      data: { completed: !topic.completed, completedAt: !topic.completed ? new Date() : null },
    });
    revalidatePath('/study-journey/learning');
    return { success: true };
  } catch (e) {
    console.error('Toggle topic error:', e);
    return { error: 'Failed to update topic.' };
  }
}

export async function deleteTopic(topicId: number) {
  const userId = await getUserId();
  try {
    const topic = await prisma.learningTopic.findUnique({
      where: { id: topicId },
      include: { subject: true },
    });
    if (!topic || topic.subject.userId !== userId) return { error: 'Not found.' };
    await prisma.learningTopic.delete({ where: { id: topicId } });
    revalidatePath('/study-journey/learning');
    return { success: true };
  } catch (e) {
    console.error('Delete topic error:', e);
    return { error: 'Failed to delete topic.' };
  }
}

// ==========================================
// LEARNING SESSIONS
// ==========================================

export async function createSession(formData: FormData) {
  const userId = await getUserId();
  const activity = formData.get('activity') as string;
  const duration = parseInt(formData.get('duration') as string) || 0;
  const description = (formData.get('description') as string) || '';
  const subjectId = formData.get('subjectId') ? parseInt(formData.get('subjectId') as string) : null;
  const dateStr = formData.get('date') as string;

  if (!activity?.trim()) return { error: 'Activity is required.' };
  if (duration <= 0) return { error: 'Duration must be greater than 0.' };

  try {
    await prisma.learningSession.create({
      data: {
        userId,
        activity: activity.trim(),
        duration,
        description,
        subjectId,
        date: dateStr ? new Date(dateStr) : new Date(),
      },
    });

    // Update stats
    await prisma.userStats.upsert({
      where: { userId },
      update: {
        totalLearningMinutes: { increment: duration },
        focusSessions: { increment: 1 },
      },
      create: { userId, totalLearningMinutes: duration, focusSessions: 1 },
    });

    await awardXp(userId, XP_REWARDS.FOCUS_SESSION + Math.floor(duration / 5));
    await updateStreak(userId);

    revalidatePath('/');
    revalidatePath('/study-journey/learning');
    return { success: true };
  } catch (e) {
    console.error('Create session error:', e);
    return { error: 'Failed to save session.' };
  }
}

export async function getSubjects() {
  const userId = await getUserId();
  return prisma.learningSubject.findMany({
    where: { userId },
    include: {
      topics: { orderBy: { order: 'asc' }, include: { resources: true } },
      sessions: { orderBy: { date: 'desc' }, take: 5 },
    },
    orderBy: { order: 'asc' },
  });
}
