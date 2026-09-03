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
    <div style={{ minHeight: '100vh' }}>
      <Sidebar
        userName={user.name}
        userEmail={user.email}
        unreadNotifications={unreadNotifications}
      />
      <main style={{
        marginLeft: 240,
        minHeight: '100vh',
        padding: '32px 40px',
      }} className="main-content">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding: 72px 16px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
