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
  // Update level
  const newLevel = Math.floor(stats.totalXp / 250) + 1;
  if (newLevel !== stats.level) {
    await prisma.userStats.update({
      where: { userId },
      data: { level: newLevel },
    });
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

    if (diffDays === 0) return; // already active today
    if (diffDays === 1) {
      // consecutive day
      const newStreak = streak.currentStreak + 1;
      await prisma.userStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, streak.longestStreak),
          lastActiveDate: today,
        },
      });
    } else {
      // streak broken
      await prisma.userStreak.update({
        where: { userId },
        data: { currentStreak: 1, lastActiveDate: today },
      });
    }
  } else {
    // first activity
    await prisma.userStreak.update({
      where: { userId },
      data: { currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    });
  }
}

export async function createTask(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || '';
  const priority = (formData.get('priority') as string) || 'Medium';
  const deadlineStr = formData.get('deadline') as string;
  const category = (formData.get('category') as string) || 'Personal';
  const estimatedTime = parseInt(formData.get('estimatedTime') as string) || 0;
  const goalId = formData.get('goalId') ? parseInt(formData.get('goalId') as string) : null;
  const competitionId = formData.get('competitionId') ? parseInt(formData.get('competitionId') as string) : null;
  const projectId = formData.get('projectId') ? parseInt(formData.get('projectId') as string) : null;

  if (!title || title.trim().length === 0) {
    return { error: 'Title is required.' };
  }

  try {
    await prisma.task.create({
      data: {
        userId,
        title: title.trim(),
        description,
        priority,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
        category,
        estimatedTime,
        goalId,
        competitionId,
        projectId,
      },
    });
    revalidatePath('/');
    revalidatePath('/study-journey/tasks');
    return { success: true };
  } catch (e) {
    console.error('Create task error:', e);
    return { error: 'Failed to create task.' };
  }
}

export async function updateTask(taskId: number, formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || '';
  const priority = (formData.get('priority') as string) || 'Medium';
  const deadlineStr = formData.get('deadline') as string;
  const category = (formData.get('category') as string) || 'Personal';
  const estimatedTime = parseInt(formData.get('estimatedTime') as string) || 0;
  const status = (formData.get('status') as string) || 'Todo';

  if (!title || title.trim().length === 0) {
    return { error: 'Title is required.' };
  }

  try {
    await prisma.task.update({
      where: { id: taskId, userId },
      data: {
        title: title.trim(),
        description,
        priority,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
        category,
        estimatedTime,
        status,
        completedAt: status === 'Completed' ? new Date() : null,
      },
    });
    revalidatePath('/');
    revalidatePath('/study-journey/tasks');
    return { success: true };
  } catch (e) {
    console.error('Update task error:', e);
    return { error: 'Failed to update task.' };
  }
}

export async function completeTask(taskId: number) {
  const userId = await getUserId();

  try {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return { error: 'Task not found.' };

    const newStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
    
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        completedAt: newStatus === 'Completed' ? new Date() : null,
      },
    });

    if (newStatus === 'Completed') {
      await awardXp(userId, XP_REWARDS.COMPLETE_TASK);
      await updateStreak(userId);
      await prisma.userStats.upsert({
        where: { userId },
        update: { tasksCompleted: { increment: 1 } },
        create: { userId, tasksCompleted: 1 },
      });
    }

    revalidatePath('/');
    revalidatePath('/study-journey/tasks');
    return { success: true };
  } catch (e) {
    console.error('Complete task error:', e);
    return { error: 'Failed to update task.' };
  }
}

export async function deleteTask(taskId: number) {
  const userId = await getUserId();

  try {
    await prisma.task.delete({ where: { id: taskId, userId } });
    revalidatePath('/');
    revalidatePath('/study-journey/tasks');
    return { success: true };
  } catch (e) {
    console.error('Delete task error:', e);
    return { error: 'Failed to delete task.' };
  }
}

export async function getTasks(filters?: {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}) {
  const userId = await getUserId();

  const where: Record<string, unknown> = { userId };
  if (filters?.status && filters.status !== 'All') where.status = filters.status;
  if (filters?.priority && filters.priority !== 'All') where.priority = filters.priority;
  if (filters?.category && filters.category !== 'All') where.category = filters.category;
  if (filters?.search) where.title = { contains: filters.search };

  return prisma.task.findMany({
    where,
    orderBy: [{ status: 'asc' }, { priority: 'desc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
    include: { goal: true, competition: true, project: true },
  });
}
