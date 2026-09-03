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

export async function createProject(formData: FormData) {
  const userId = await getUserId();
  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || '';
  const category = (formData.get('category') as string) || 'General';
  const status = (formData.get('status') as string) || 'Idea';
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;

  if (!name?.trim()) return { error: 'Name is required.' };

  try {
    await prisma.project.create({
      data: {
        userId,
        name: name.trim(),
        description,
        category,
        status,
        startDate: startDateStr ? new Date(startDateStr) : null,
        endDate: endDateStr ? new Date(endDateStr) : null,
      },
    });
    revalidatePath('/');
    revalidatePath('/study-journey/projects');
    return { success: true };
  } catch (e) {
    console.error('Create project error:', e);
    return { error: 'Failed to create project.' };
  }
}

export async function updateProject(projectId: number, formData: FormData) {
  const userId = await getUserId();
  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || '';
  const category = (formData.get('category') as string) || 'General';
  const status = (formData.get('status') as string) || 'Idea';
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;

  if (!name?.trim()) return { error: 'Name is required.' };

  try {
    await prisma.project.update({
      where: { id: projectId, userId },
      data: {
        name: name.trim(),
        description,
        category,
        status,
        startDate: startDateStr ? new Date(startDateStr) : null,
        endDate: endDateStr ? new Date(endDateStr) : null,
      },
    });

    if (status === 'Completed') {
      await awardXp(userId, XP_REWARDS.COMPLETE_PROJECT);
      await prisma.userStats.upsert({
        where: { userId },
        update: { projectsCompleted: { increment: 1 } },
        create: { userId, projectsCompleted: 1 },
      });
    }

    revalidatePath('/');
    revalidatePath('/study-journey/projects');
    return { success: true };
  } catch (e) {
    console.error('Update project error:', e);
    return { error: 'Failed to update project.' };
  }
}

export async function deleteProject(projectId: number) {
  const userId = await getUserId();
  try {
    await prisma.project.delete({ where: { id: projectId, userId } });
    revalidatePath('/');
    revalidatePath('/study-journey/projects');
    return { success: true };
  } catch (e) {
    console.error('Delete project error:', e);
    return { error: 'Failed to delete project.' };
  }
}

export async function createProjectTask(projectId: number, title: string) {
  const userId = await getUserId();
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) return { error: 'Project not found.' };
  if (!title?.trim()) return { error: 'Title is required.' };

  try {
    const maxOrder = await prisma.projectTask.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    await prisma.projectTask.create({
      data: { projectId, title: title.trim(), order: (maxOrder?.order || 0) + 1 },
    });
    await recalculateProjectProgress(projectId);
    revalidatePath('/study-journey/projects');
    return { success: true };
  } catch (e) {
    console.error('Create project task error:', e);
    return { error: 'Failed to create task.' };
  }
}

export async function toggleProjectTask(taskId: number) {
  const userId = await getUserId();
  try {
    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task || task.project.userId !== userId) return { error: 'Not found.' };

    await prisma.projectTask.update({
      where: { id: taskId },
      data: { completed: !task.completed, completedAt: !task.completed ? new Date() : null },
    });
    await recalculateProjectProgress(task.projectId);
    revalidatePath('/study-journey/projects');
    return { success: true };
  } catch (e) {
    console.error('Toggle project task error:', e);
    return { error: 'Failed to update task.' };
  }
}

export async function deleteProjectTask(taskId: number) {
  const userId = await getUserId();
  try {
    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task || task.project.userId !== userId) return { error: 'Not found.' };
    await prisma.projectTask.delete({ where: { id: taskId } });
    await recalculateProjectProgress(task.projectId);
    revalidatePath('/study-journey/projects');
    return { success: true };
  } catch (e) {
    console.error('Delete project task error:', e);
    return { error: 'Failed to delete task.' };
  }
}

async function recalculateProjectProgress(projectId: number) {
  const tasks = await prisma.projectTask.findMany({ where: { projectId } });
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  await prisma.project.update({
    where: { id: projectId },
    data: { progress },
  });
}

export async function getProjects() {
  const userId = await getUserId();
  return prisma.project.findMany({
    where: { userId },
    include: {
      projectTasks: { orderBy: { order: 'asc' } },
      images: { orderBy: { order: 'asc' } },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });
}
