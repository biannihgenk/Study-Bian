import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getGreeting, formatDate, formatDuration, daysUntil } from '@/lib/utils';
import { getXpProgress, getLevelTitle } from '@/lib/constants';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function HomePage() {
  const user = await requireAuth();

  // Fetch all dashboard data from SQLite
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    todayTasks,
    overdueTasks,
    weeklyTasks,
    todaySchedule,
    weekSessions,
    goals,
    competitions,
    projects,
    stats,
    streak,
    subjects,
    recentNotifications,
    todayFocus,
  ] = await Promise.all([
    // Today's tasks
    prisma.task.findMany({
      where: {
        userId: user.id,
        OR: [
          { deadline: { gte: startOfDay, lte: endOfDay } },
          { status: { not: 'Completed' } },
        ],
      },
      orderBy: [{ priority: 'desc' }, { deadline: 'asc' }],
      take: 10,
    }),
    // Overdue tasks
    prisma.task.findMany({
      where: {
        userId: user.id,
        status: { not: 'Completed' },
        deadline: { lt: startOfDay },
      },
    }),
    // Weekly completed tasks
    prisma.task.findMany({
      where: {
        userId: user.id,
        status: 'Completed',
        completedAt: { gte: startOfWeek },
      },
    }),
    // Today's schedule
    prisma.scheduleEvent.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startTime: 'asc' },
    }),
    // This week's learning sessions
    prisma.learningSession.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfWeek },
      },
      include: { subject: true },
    }),
    // Active goals
    prisma.goal.findMany({
      where: { userId: user.id, status: 'Active' },
      include: { milestones: true },
      orderBy: { priority: 'desc' },
      take: 5,
    }),
    // Active competitions with deadlines
    prisma.competition.findMany({
      where: { userId: user.id, status: { in: ['Planning', 'Ongoing'] } },
      include: { tasks: true },
      orderBy: { deadline: 'asc' },
      take: 5,
    }),
    // Active projects
    prisma.project.findMany({
      where: { userId: user.id, status: { in: ['Idea', 'Planning', 'In Development'] } },
      include: { projectTasks: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // User stats
    prisma.userStats.findFirst({ where: { userId: user.id } }),
    // User streak
    prisma.userStreak.findFirst({ where: { userId: user.id } }),
    // Learning subjects for distribution
    prisma.learningSubject.findMany({
      where: { userId: user.id },
      include: { sessions: { where: { date: { gte: startOfWeek } } } },
    }),
    // Recent notifications
    prisma.notification.findMany({
      where: { userId: user.id, read: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // Today's focus
    prisma.todayFocus.findFirst({ where: { userId: user.id } }),
  ]);

  // Calculate weekly learning time
  const weeklyLearningMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);

  // Calculate total tasks for the week
  const weeklyTotalTasks = await prisma.task.count({
    where: {
      userId: user.id,
      OR: [
        { deadline: { gte: startOfWeek, lte: endOfDay } },
        { completedAt: { gte: startOfWeek } },
      ],
    },
  });

  // Learning distribution
  const learningDistribution = subjects
    .map((s) => ({
      name: s.title,
      color: s.color,
      minutes: s.sessions.reduce((sum, sess) => sum + sess.duration, 0),
    }))
    .filter((s) => s.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);

  const totalLearningMinutes = learningDistribution.reduce((sum, s) => sum + s.minutes, 0);

  // Average goal progress
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  // Upcoming deadlines
  const upcoming = [
    ...competitions
      .filter((c) => c.deadline)
      .map((c) => ({
        id: c.id,
        title: c.name,
        type: 'Competition' as const,
        icon: '🏆',
        deadline: c.deadline!,
        daysLeft: daysUntil(c.deadline!),
        progress: c.progress,
      })),
    ...goals
      .filter((g) => g.targetDate)
      .map((g) => ({
        id: g.id,
        title: g.title,
        type: 'Goal' as const,
        icon: '🎯',
        deadline: g.targetDate!,
        daysLeft: daysUntil(g.targetDate!),
        progress: g.progress,
      })),
    ...projects
      .filter((p) => p.endDate)
      .map((p) => ({
        id: p.id,
        title: p.name,
        type: 'Project' as const,
        icon: '💻',
        deadline: p.endDate!,
        daysLeft: daysUntil(p.endDate!),
        progress: p.progress,
      })),
  ]
    .filter((u) => u.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 6);

  // Smart recommendation
  let recommendation = null;
  if (overdueTasks.length > 0) {
    const task = overdueTasks[0];
    recommendation = {
      title: task.title,
      reason: `This task is overdue by ${Math.abs(daysUntil(task.deadline!))} day(s).`,
      type: 'Overdue Task',
      estimatedTime: task.estimatedTime || 30,
    };
  } else {
    const urgentComp = competitions.find(
      (c) => c.deadline && daysUntil(c.deadline) <= 7 && c.progress < 100
    );
    if (urgentComp) {
      recommendation = {
        title: urgentComp.name,
        reason: `Competition deadline in ${daysUntil(urgentComp.deadline!)} day(s). Progress: ${urgentComp.progress}%.`,
        type: 'Competition',
        estimatedTime: 60,
      };
    } else {
      const highPriorityTask = todayTasks.find(
        (t) => t.status !== 'Completed' && (t.priority === 'High' || t.priority === 'Urgent')
      );
      if (highPriorityTask) {
        recommendation = {
          title: highPriorityTask.title,
          reason: `High priority task that needs attention.`,
          type: 'Task',
          estimatedTime: highPriorityTask.estimatedTime || 30,
        };
      }
    }
  }

  const xpProgress = stats ? getXpProgress(stats.totalXp) : { current: 0, required: 250, percentage: 0 };

  const dashboardData = {
    greeting: getGreeting(),
    userName: user.name,
    dateString: formatDate(new Date()),
    todayTasks: todayTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      category: t.category,
      deadline: t.deadline?.toISOString() || null,
    })),
    todaySchedule: todaySchedule.map((e) => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString(),
      category: e.category,
      color: e.color,
      completed: e.completed,
    })),
    weeklyStats: {
      learningTime: formatDuration(weeklyLearningMinutes),
      tasksCompleted: weeklyTasks.length,
      totalTasks: weeklyTotalTasks || weeklyTasks.length,
      goalProgress: avgGoalProgress,
      currentStreak: streak?.currentStreak || 0,
    },
    learningDistribution: learningDistribution.map((d) => ({
      name: d.name,
      color: d.color,
      percentage: totalLearningMinutes > 0 ? Math.round((d.minutes / totalLearningMinutes) * 100) : 0,
    })),
    upcoming,
    recommendation,
    xp: {
      total: stats?.totalXp || 0,
      level: stats?.level || 1,
      title: getLevelTitle(stats?.level || 1),
      progress: xpProgress,
    },
    todayFocus: todayFocus ? {
      title: todayFocus.title,
      description: todayFocus.description,
      estimatedMinutes: todayFocus.estimatedMinutes,
    } : null,
    overdueTasks: overdueTasks.length,
  };

  return <DashboardClient data={dashboardData} />;
}
