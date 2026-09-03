import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import LearningClient from '@/components/learning/LearningClient';

export default async function LearningPage() {
  const user = await requireAuth();

  const subjects = await prisma.learningSubject.findMany({
    where: { userId: user.id },
    include: {
      topics: { orderBy: { order: 'asc' }, include: { resources: true } },
      sessions: { orderBy: { date: 'desc' }, take: 10 },
    },
    orderBy: { order: 'asc' },
  });

  const recentSessions = await prisma.learningSession.findMany({
    where: { userId: user.id },
    include: { subject: true },
    orderBy: { date: 'desc' },
    take: 10,
  });

  return (
    <LearningClient
      initialSubjects={JSON.parse(JSON.stringify(subjects))}
      recentSessions={JSON.parse(JSON.stringify(recentSessions))}
    />
  );
}
