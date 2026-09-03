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

export async function createGoal(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || '';
  const category = (formData.get('category') as string) || 'General';
  const priority = (formData.get('priority') as string) || 'Medium';
  const targetDateStr = formData.get('targetDate') as string;

  if (!title?.trim()) return { error: 'Title is required.' };

  try {
    await prisma.goal.create({
      data: {
        userId,
        title: title.trim(),
        description,
        category,
        priority,
        targetDate: targetDateStr ? new Date(targetDateStr) : null,
      },
    });
    revalidatePath('/');
    revalidatePath('/study-journey/goals');
    return { success: true };
  } catch (e) {
    console.error('Create goal error:', e);
    return { error: 'Failed to create goal.' };
  }
}

export async function updateGoal(goalId: number, formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || '';
  const category = (formData.get('category') as string) || 'General';
  const priority = (formData.get('priority') as string) || 'Medium';
  const targetDateStr = formData.get('targetDate') as string;
  const status = (formData.get('status') as string) || 'Active';

  if (!title?.trim()) return { error: 'Title is required.' };

  try {
    await prisma.goal.update({
      where: { id: goalId, userId },
      data: {
        title: title.trim(),
        description,
        category,
        priority,
        targetDate: targetDateStr ? new Date(targetDateStr) : null,
        status,
      },
    });

    if (status === 'Completed') {
      await awardXp(userId, XP_REWARDS.COMPLETE_GOAL);
      await prisma.userStats.upsert({
        where: { userId },
        update: { goalsCompleted: { increment: 1 } },
        create: { userId, goalsCompleted: 1 },
      });
    }

    revalidatePath('/');
    revalidatePath('/study-journey/goals');
    return { success: true };
  } catch (e) {
    console.error('Update goal error:', e);
    return { error: 'Failed to update goal.' };
  }
}

export async function deleteGoal(goalId: number) {
  const userId = await getUserId();
  try {
    await prisma.goal.delete({ where: { id: goalId, userId } });
    revalidatePath('/');
    revalidatePath('/study-journey/goals');
    return { success: true };
  } catch (e) {
    console.error('Delete goal error:', e);
    return { error: 'Failed to delete goal.' };
  }
}

export async function createMilestone(goalId: number, title: string) {
  const userId = await getUserId();
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) return { error: 'Goal not found.' };
  if (!title?.trim()) return { error: 'Title is required.' };

  try {
    const maxOrder = await prisma.goalMilestone.findFirst({
      where: { goalId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    await prisma.goalMilestone.create({
      data: { goalId, title: title.trim(), order: (maxOrder?.order || 0) + 1 },
    });
    await recalculateGoalProgress(goalId);
    revalidatePath('/');
    revalidatePath('/study-journey/goals');
    return { success: true };
  } catch (e) {
    console.error('Create milestone error:', e);
    return { error: 'Failed to create milestone.' };
  }
}

export async function toggleMilestone(milestoneId: number) {
  const userId = await getUserId();

  try {
    const milestone = await prisma.goalMilestone.findUnique({
      where: { id: milestoneId },
      include: { goal: true },
    });
    if (!milestone || milestone.goal.userId !== userId) return { error: 'Not found.' };

    const newCompleted = !milestone.completed;
    await prisma.goalMilestone.update({
      where: { id: milestoneId },
      data: {
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : null,
      },
    });

    if (newCompleted) {
      await awardXp(userId, XP_REWARDS.COMPLETE_MILESTONE);
    }

    await recalculateGoalProgress(milestone.goalId);
    revalidatePath('/');
    revalidatePath('/study-journey/goals');
    return { success: true };
  } catch (e) {
    console.error('Toggle milestone error:', e);
    return { error: 'Failed to update milestone.' };
  }
}

export async function deleteMilestone(milestoneId: number) {
  const userId = await getUserId();

  try {
    const milestone = await prisma.goalMilestone.findUnique({
      where: { id: milestoneId },
      include: { goal: true },
    });
    if (!milestone || milestone.goal.userId !== userId) return { error: 'Not found.' };

    await prisma.goalMilestone.delete({ where: { id: milestoneId } });
    await recalculateGoalProgress(milestone.goalId);
    revalidatePath('/');
    revalidatePath('/study-journey/goals');
    return { success: true };
  } catch (e) {
    console.error('Delete milestone error:', e);
    return { error: 'Failed to delete milestone.' };
  }
}

async function recalculateGoalProgress(goalId: number) {
  const milestones = await prisma.goalMilestone.findMany({ where: { goalId } });
  const total = milestones.length;
  const completed = milestones.filter((m) => m.completed).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      progress,
      status: progress === 100 && total > 0 ? 'Completed' : undefined,
    },
  });
}

export async function getGoals() {
  const userId = await getUserId();
  return prisma.goal.findMany({
    where: { userId },
    include: { milestones: { orderBy: { order: 'asc' } } },
    orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
  });
}
