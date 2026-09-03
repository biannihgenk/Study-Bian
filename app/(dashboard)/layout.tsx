import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  const unreadNotifications = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar
        userName={user.name}
        userEmail={user.email}
        unreadNotifications={unreadNotifications}
      />
      <main className="main-content min-h-screen md:ml-[240px]">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding-top: 64px;
          }
        }
      `}</style>
    </div>
  );
}
