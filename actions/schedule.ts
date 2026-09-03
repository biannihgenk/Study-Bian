'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session-utils';
import { revalidatePath } from 'next/cache';

async function getUserId() {
  const session = await getSession();
  if (!session.userId) throw new Error('Unauthorized');
  return session.userId;
}

export async function createScheduleEvent(formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || '';
  const dateStr = formData.get('date') as string;
  const startTimeStr = formData.get('startTime') as string;
  const endTimeStr = formData.get('endTime') as string;
  const category = (formData.get('category') as string) || 'Personal';
  const color = (formData.get('color') as string) || '#6366f1';

  if (!title?.trim()) return { error: 'Title is required.' };
  if (!dateStr) return { error: 'Date is required.' };
  if (!startTimeStr || !endTimeStr) return { error: 'Start and end time are required.' };

  try {
    const date = new Date(dateStr);
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    
    const startTime = new Date(date);
    startTime.setHours(startH, startM, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endH, endM, 0, 0);

    await prisma.scheduleEvent.create({
      data: {
        userId,
        title: title.trim(),
        description,
        date,
        startTime,
        endTime,
        category,
        color,
      },
    });
    revalidatePath('/');
    revalidatePath('/study-journey/calendar');
    return { success: true };
  } catch (e) {
    console.error('Create event error:', e);
    return { error: 'Failed to create event.' };
  }
}

export async function updateScheduleEvent(eventId: number, formData: FormData) {
  const userId = await getUserId();
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || '';
  const dateStr = formData.get('date') as string;
  const startTimeStr = formData.get('startTime') as string;
  const endTimeStr = formData.get('endTime') as string;
  const category = (formData.get('category') as string) || 'Personal';
  const color = (formData.get('color') as string) || '#6366f1';

  if (!title?.trim()) return { error: 'Title is required.' };

  try {
    const date = new Date(dateStr);
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    
    const startTime = new Date(date);
    startTime.setHours(startH, startM, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endH, endM, 0, 0);

    await prisma.scheduleEvent.update({
      where: { id: eventId, userId },
      data: { title: title.trim(), description, date, startTime, endTime, category, color },
    });
    revalidatePath('/');
    revalidatePath('/study-journey/calendar');
    return { success: true };
  } catch (e) {
    console.error('Update event error:', e);
    return { error: 'Failed to update event.' };
  }
}

export async function completeScheduleEvent(eventId: number) {
  const userId = await getUserId();
  try {
    const event = await prisma.scheduleEvent.findFirst({ where: { id: eventId, userId } });
    if (!event) return { error: 'Event not found.' };
    await prisma.scheduleEvent.update({
      where: { id: eventId },
      data: { completed: !event.completed },
    });
    revalidatePath('/');
    revalidatePath('/study-journey/calendar');
    return { success: true };
  } catch (e) {
    console.error('Complete event error:', e);
    return { error: 'Failed to update event.' };
  }
}

export async function deleteScheduleEvent(eventId: number) {
  const userId = await getUserId();
  try {
    await prisma.scheduleEvent.delete({ where: { id: eventId, userId } });
    revalidatePath('/');
    revalidatePath('/study-journey/calendar');
    return { success: true };
  } catch (e) {
    console.error('Delete event error:', e);
    return { error: 'Failed to delete event.' };
  }
}

export async function getScheduleEvents(date?: string) {
  const userId = await getUserId();
  const where: Record<string, unknown> = { userId };
  
  if (date) {
    const d = new Date(date);
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }

  return prisma.scheduleEvent.findMany({
    where,
    orderBy: { startTime: 'asc' },
  });
}
