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

// ==========================================
// COMPETITIONS
// ==========================================

export async function createCompetition(formData: FormData) {
  const userId = await getUserId();
  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || '';
  const category = (formData.get('category') as string) || 'General';
  const priority = (formData.get('priority') as string) || 'Medium';
  const startDateStr = formData.get('startDate') as string;
  const deadlineStr = formData.get('deadline') as string;

  if (!name?.trim()) return { error: 'Name is required.' };

  try {
    await prisma.competition.create({
      data: {
        userId,
        name: name.trim(),
        description,
        category,
        priority,
        startDate: startDateStr ? new Date(startDateStr) : null,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
      },
    });
    revalidatePath('/');
    revalidatePath('/study-journey/competitions');
    return { success: true };
  } catch (e) {
    console.error('Create competition error:', e);
    return { error: 'Failed to create competition.' };
  }
}

export async function updateCompetition(compId: number, formData: FormData) {
  const userId = await getUserId();
  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || '';
  const category = (formData.get('category') as string) || 'General';
  const priority = (formData.get('priority') as string) || 'Medium';
  const status = (formData.get('status') as string) || 'Planning';
  const startDateStr = formData.get('startDate') as string;
  const deadlineStr = formData.get('deadline') as string;

  if (!name?.trim()) return { error: 'Name is required.' };

  try {
    await prisma.competition.update({
      where: { id: compId, userId },
      data: {
        name: name.trim(),
        description,
        category,
        priority,
        status,
        startDate: startDateStr ? new Date(startDateStr) : null,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
      },
    });

    if (status === 'Completed') {
      await awardXp(userId, XP_REWARDS.COMPLETE_COMPETITION);
      await prisma.userStats.upsert({
        where: { userId },
        update: { competitionsCompleted: { increment: 1 } },
        create: { userId, competitionsCompleted: 1 },
      });
    }

    revalidatePath('/');
    revalidatePath('/study-journey/competitions');
    return { success: true };
  } catch (e) {
    console.error('Update competition error:', e);
    return { error: 'Failed to update competition.' };
  }
}

export async function deleteCompetition(compId: number) {
  const userId = await getUserId();
  try {
    await prisma.competition.delete({ where: { id: compId, userId } });
    revalidatePath('/');
    revalidatePath('/study-journey/competitions');
    return { success: true };
  } catch (e) {
    console.error('Delete competition error:', e);
    return { error: 'Failed to delete competition.' };
  }
}

export async function createCompetitionTask(competitionId: number, title: string) {
  const userId = await getUserId();
  const comp = await prisma.competition.findFirst({ where: { id: competitionId, userId } });
  if (!comp) return { error: 'Competition not found.' };
  if (!title?.trim()) return { error: 'Title is required.' };

  try {
    const maxOrder = await prisma.competitionTask.findFirst({
      where: { competitionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    await prisma.competitionTask.create({
      data: { competitionId, title: title.trim(), order: (maxOrder?.order || 0) + 1 },
    });
    await recalculateCompProgress(competitionId);
    revalidatePath('/study-journey/competitions');
    return { success: true };
  } catch (e) {
    console.error('Create comp task error:', e);
    return { error: 'Failed to create task.' };
  }
}

export async function toggleCompetitionTask(taskId: number) {
  const userId = await getUserId();
  try {
    const task = await prisma.competitionTask.findUnique({
      where: { id: taskId },
      include: { competition: true },
    });
    if (!task || task.competition.userId !== userId) return { error: 'Not found.' };

    await prisma.competitionTask.update({
      where: { id: taskId },
      data: { completed: !task.completed, completedAt: !task.completed ? new Date() : null },
    });
    await recalculateCompProgress(task.competitionId);
    revalidatePath('/study-journey/competitions');
    return { success: true };
  } catch (e) {
    console.error('Toggle comp task error:', e);
    return { error: 'Failed to update task.' };
  }
}

export async function deleteCompetitionTask(taskId: number) {
  const userId = await getUserId();
  try {
    const task = await prisma.competitionTask.findUnique({
      where: { id: taskId },
      include: { competition: true },
    });
    if (!task || task.competition.userId !== userId) return { error: 'Not found.' };
    await prisma.competitionTask.delete({ where: { id: taskId } });
    await recalculateCompProgress(task.competitionId);
    revalidatePath('/study-journey/competitions');
    return { success: true };
  } catch (e) {
    console.error('Delete comp task error:', e);
    return { error: 'Failed to delete task.' };
  }
}

export async function addCompetitionLearning(competitionId: number, content: string) {
  const userId = await getUserId();
  const comp = await prisma.competition.findFirst({ where: { id: competitionId, userId } });
  if (!comp) return { error: 'Competition not found.' };
  if (!content?.trim()) return { error: 'Content is required.' };

  try {
    await prisma.competitionLearning.create({
      data: { competitionId, content: content.trim() },
    });
    revalidatePath('/study-journey/competitions');
    return { success: true };
  } catch (e) {
    console.error('Add learning error:', e);
    return { error: 'Failed to add learning.' };
  }
}

async function recalculateCompProgress(competitionId: number) {
  const tasks = await prisma.competitionTask.findMany({ where: { competitionId } });
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  await prisma.competition.update({
    where: { id: competitionId },
    data: { progress },
  });
}

export async function getCompetitions() {
  const userId = await getUserId();
  return prisma.competition.findMany({
    where: { userId },
    include: {
      tasks: { orderBy: { order: 'asc' } },
      learnings: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: [{ status: 'asc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
  });
}
