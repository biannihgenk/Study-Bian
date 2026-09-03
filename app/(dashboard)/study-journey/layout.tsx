'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, BookOpen, CheckSquare,
  Target, Trophy, FolderKanban,
} from 'lucide-react';

const tabs = [
  { href: '/study-journey', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/study-journey/calendar', label: 'Calendar', icon: Calendar },
  { href: '/study-journey/learning', label: 'Learning', icon: BookOpen },
  { href: '/study-journey/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/study-journey/goals', label: 'Goals', icon: Target },
  { href: '/study-journey/competitions', label: 'Competitions', icon: Trophy },
  { href: '/study-journey/projects', label: 'Projects', icon: FolderKanban },
];

export default function StudyJourneyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div>
      {/* Secondary Navigation */}
      <nav style={{
        display: 'flex',
        gap: 2,
        marginBottom: 28,
        borderBottom: '1px solid var(--color-border)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {tabs.map((tab) => {
          const active = isActive(tab.href, tab.exact);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                borderBottom: `2px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
