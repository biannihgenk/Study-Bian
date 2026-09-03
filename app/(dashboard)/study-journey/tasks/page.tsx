import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import TasksClient from '@/components/tasks/TasksClient';

export default async function TasksPage() {
  const user = await requireAuth();

  const [tasks, goals, competitions, projects] = await Promise.all([
    prisma.task.findMany({
      where: { userId: user.id },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
      include: { goal: true, competition: true, project: true },
    }),
    prisma.goal.findMany({ where: { userId: user.id, status: 'Active' }, select: { id: true, title: true } }),
    prisma.competition.findMany({ where: { userId: user.id, status: { in: ['Planning', 'Ongoing'] } }, select: { id: true, name: true } }),
    prisma.project.findMany({ where: { userId: user.id, status: { in: ['Idea', 'Planning', 'In Development'] } }, select: { id: true, name: true } }),
  ]);

  return (
    <TasksClient
      initialTasks={JSON.parse(JSON.stringify(tasks))}
      goals={goals}
      competitions={competitions.map(c => ({ id: c.id, title: c.name }))}
      projects={projects.map(p => ({ id: p.id, title: p.name }))}
    />
  );
}
