'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutAction } from '@/actions/auth';
import {
  Home,
  BookOpen,
  User,
  Plus,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
  userName: string;
  userEmail: string;
  unreadNotifications: number;
}

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/study-journey', label: 'Study Journey', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ userName, userEmail, unreadNotifications }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Check if user previously closed sidebar
    const storedState = localStorage.getItem('bian-os-sidebar');
    if (storedState === 'closed') {
      setDesktopOpen(false);
    }
  }, []);

  // Sync main content margin when desktop sidebar toggles
  useEffect(() => {
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) {
      if (desktopOpen) {
        mainContent.classList.remove('sidebar-closed');
      } else {
        mainContent.classList.add('sidebar-closed');
      }
    }
  }, [desktopOpen]);

  function toggleDesktopSidebar() {
    const newState = !desktopOpen;
    setDesktopOpen(newState);
    localStorage.setItem('bian-os-sidebar', newState ? 'open' : 'closed');
  }

  function toggleTheme() {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bian-os-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bian-os-theme', 'light');
    }
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border/60 flex items-center justify-between px-4 z-40 shadow-sm">
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">BIAN OS</span>
        <div className="flex gap-1 items-center">
          <Link href="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            )}
          </Link>
        </div>
      </header>

      {/* Floating Toggle Button for Desktop (when closed) */}
      {!desktopOpen && (
        <button 
          onClick={toggleDesktopSidebar}
          className="hidden md:flex fixed top-6 left-6 z-40 p-2.5 bg-card/80 backdrop-blur-xl border border-border/60 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm hover:shadow-md transition-all group"
          aria-label="Open sidebar"
        >
          <PanelLeftOpen size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
            onClick={() => setMobileOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 w-[260px] bg-card/60 backdrop-blur-2xl border-r border-border/60 
        flex flex-col z-50 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl md:shadow-none
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${!desktopOpen && !mobileOpen ? 'md:-translate-x-full' : ''}
      `}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              B
            </div>
            <span className="font-extrabold text-lg tracking-tight text-foreground">
              BIAN OS
            </span>
          </Link>
          
          {/* Mobile Close Button */}
          <button className="md:hidden p-2 text-muted-foreground hover:text-foreground bg-muted/50 rounded-full" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={16} />
          </button>

          {/* Desktop Close Button */}
          <button 
            className="hidden md:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" 
            onClick={toggleDesktopSidebar} 
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Quick Add */}
        <div className="px-5 mb-4">
          <div className="relative">
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
            >
              <Plus size={16} />
              Quick Add
            </button>
            <AnimatePresence>
              {showQuickAdd && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowQuickAdd(false)} />
                  <motion.div 
                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                    className="absolute top-full left-0 right-0 mt-2 bg-card/90 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl p-1.5 z-20 overflow-hidden"
                  >
                    {['Task', 'Goal', 'Learning', 'Competition', 'Project', 'Schedule'].map((item) => (
                      <Link
                        key={item}
                        href={`/study-journey/${item === 'Schedule' ? 'calendar' : item === 'Learning' ? 'learning' : item.toLowerCase() + 's'}?add=true`}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
                        onClick={() => { setShowQuickAdd(false); setMobileOpen(false); }}
                      >
                        <Plus size={14} className="text-primary" />
                        Add {item}
                      </Link>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group
                  ${active ? 'text-primary font-bold bg-primary/10' : 'text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50'}
                `}
              >
                {active && (
                  <motion.div 
                    layoutId="sidebarActiveIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full"
                  />
                )}
                <Icon size={18} className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground transition-colors'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Notification Badge */}
        <div className="px-3 mb-2 hidden md:block">
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Bell size={18} />
            Notifications
            {unreadNotifications > 0 && (
              <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {unreadNotifications}
              </span>
            )}
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border/50 flex flex-col gap-2 bg-muted/10">
          {/* Theme Toggle */}
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>

          {/* User */}
          <div className="relative">
            <button
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors group"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm group-hover:shadow-md transition-all">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate text-foreground font-semibold">
                {userName}
              </span>
              <ChevronDown size={14} className="ml-auto text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <motion.div 
                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                    className="absolute bottom-full left-0 right-0 mb-2 bg-card/90 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl p-1.5 z-20"
                  >
                    <div className="px-3 py-3 border-b border-border/50 mb-1">
                      <div className="text-sm font-bold text-foreground truncate">{userName}</div>
                      <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
                    </div>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </form>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </>
  );
}
