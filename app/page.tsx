import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatDate, formatTime } from '@/lib/utils';
import { getLevelFromXp } from '@/lib/constants';
import HomeClient from '@/components/home/HomeClient';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [tasks, schedule, goals, competitions, projects, sessions, stats, streak, totalTasks, completedTasks, gallery] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.id, status: { not: 'Completed' }, OR: [{ deadline: { gte: startOfDay, lte: endOfDay } }, { deadline: null }] }, orderBy: [{ priority: 'desc' }, { deadline: 'asc' }], take: 6 }),
    prisma.scheduleEvent.findMany({ where: { userId: user.id, date: { gte: startOfDay, lte: endOfDay } }, orderBy: { startTime: 'asc' }, take: 6 }),
    prisma.goal.findMany({ where: { userId: user.id, status: 'Active' }, orderBy: { priority: 'desc' }, take: 4 }),
    prisma.competition.findMany({ where: { userId: user.id, status: { in: ['Planning', 'Ongoing'] } }, orderBy: { deadline: 'asc' }, take: 4 }),
    prisma.project.findMany({ where: { userId: user.id, status: { in: ['Idea', 'Planning', 'In Development'] } }, orderBy: { updatedAt: 'desc' }, take: 4 }),
    prisma.learningSession.findMany({ where: { userId: user.id, date: { gte: startOfWeek } }, select: { duration: true } }),
    prisma.userStats.findFirst({ where: { userId: user.id } }),
    prisma.userStreak.findFirst({ where: { userId: user.id } }),
    prisma.task.count({ where: { userId: user.id, OR: [{ deadline: { gte: startOfWeek, lte: endOfDay } }, { completedAt: { gte: startOfWeek } }] } }),
    prisma.task.count({ where: { userId: user.id, status: 'Completed', completedAt: { gte: startOfWeek } } }),
    prisma.galleryImage.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);

  return <HomeClient data={{
    userName: user.name.split(' ')[0],
    dateString: formatDate(today),
    stats: {
      tasksDone: completedTasks,
      tasksTotal: totalTasks,
      learningMinutes: sessions.reduce((total, session) => total + session.duration, 0),
      streak: streak?.currentStreak || 0,
      xp: stats?.totalXp || 0,
      level: getLevelFromXp(stats?.totalXp || 0),
    },
    tasks: tasks.map((task) => ({ id: task.id, title: task.title, priority: task.priority, status: task.status })),
    schedule: schedule.map((event) => ({ id: event.id, title: event.title, time: `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`, color: event.color, completed: event.completed })),
    goals: goals.map((goal) => ({ id: goal.id, title: goal.title, progress: goal.progress })),
    competitions: competitions.map((competition) => ({ id: competition.id, title: competition.name, progress: competition.progress })),
    projects: projects.map((project) => ({ id: project.id, title: project.name, progress: project.progress })),
    gallery: gallery.map((image) => ({ id: image.id, path: image.path, caption: image.caption })),
  }} />;
}
