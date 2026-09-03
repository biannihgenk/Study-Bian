import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import CompetitionsClient from '@/components/competitions/CompetitionsClient';

export default async function CompetitionsPage() {
  const user = await requireAuth();
  const competitions = await prisma.competition.findMany({
    where: { userId: user.id },
    include: { tasks: { orderBy: { order: 'asc' } }, learnings: { orderBy: { createdAt: 'desc' } } },
    orderBy: [{ status: 'asc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
  });
  return <CompetitionsClient initialCompetitions={JSON.parse(JSON.stringify(competitions))} />;
}
