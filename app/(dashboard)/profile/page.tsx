import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import ProfileClient from '@/components/profile/ProfileClient';
import { getLevelTitle, getXpProgress } from '@/lib/constants';

export default async function ProfilePage() {
  const user = await requireAuth();

  const [profile, stats, streak, achievements, userAchievements, projects, competitions] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.userStats.findFirst({ where: { userId: user.id } }),
    prisma.userStreak.findFirst({ where: { userId: user.id } }),
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
    }),
    prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.competition.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ]);

  const xpProgress = stats ? getXpProgress(stats.totalXp) : { current: 0, required: 250, percentage: 0 };

  const profileData = {
    name: user.name,
    email: user.email,
    bio: profile?.bio || '',
    avatar: profile?.avatar || '',
    title: profile?.title || '',
    quote: profile?.quote || '',
    stats: {
      totalXp: stats?.totalXp || 0,
      level: stats?.level || 1,
      levelTitle: getLevelTitle(stats?.level || 1),
      xpProgress,
      totalLearningMinutes: stats?.totalLearningMinutes || 0,
      tasksCompleted: stats?.tasksCompleted || 0,
      goalsCompleted: stats?.goalsCompleted || 0,
      projectsCompleted: stats?.projectsCompleted || 0,
      competitionsCompleted: stats?.competitionsCompleted || 0,
      focusSessions: stats?.focusSessions || 0,
    },
    streak: {
      current: streak?.currentStreak || 0,
      longest: streak?.longestStreak || 0,
    },
    achievements: achievements.map((a) => ({
      ...a,
      unlocked: userAchievements.some((ua) => ua.achievementId === a.id),
      unlockedAt: userAchievements.find((ua) => ua.achievementId === a.id)?.unlockedAt?.toISOString() || null,
    })),
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      category: p.category,
      progress: p.progress,
    })),
    competitions: competitions.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      category: c.category,
      progress: c.progress,
    })),
  };

  return <ProfileClient data={JSON.parse(JSON.stringify(profileData))} />;
}
