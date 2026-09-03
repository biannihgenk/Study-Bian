import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import CalendarClient from '@/components/calendar/CalendarClient';

export default async function CalendarPage() {
  const user = await requireAuth();

  const events = await prisma.scheduleEvent.findMany({
    where: { userId: user.id },
    orderBy: { startTime: 'asc' },
  });

  return <CalendarClient initialEvents={JSON.parse(JSON.stringify(events))} />;
}
