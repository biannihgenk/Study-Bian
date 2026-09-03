import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import NotificationsClient from '@/components/notifications/NotificationsClient';

export default async function NotificationsPage() {
  const user = await requireAuth();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return <NotificationsClient initialNotifications={JSON.parse(JSON.stringify(notifications))} />;
}
