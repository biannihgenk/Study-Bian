import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import GoalsClient from '@/components/goals/GoalsClient';

export default async function GoalsPage() {
  const user = await requireAuth();

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: { milestones: { orderBy: { order: 'asc' } } },
    orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
  });

  return <GoalsClient initialGoals={JSON.parse(JSON.stringify(goals))} />;
}
