import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import FocusClient from '@/components/focus/FocusClient';

export default async function FocusPage() {
  const user = await requireAuth();

  const subjects = await prisma.learningSubject.findMany({
    where: { userId: user.id },
    select: { id: true, title: true },
    orderBy: { order: 'asc' },
  });

  return <FocusClient subjects={subjects} />;
}
