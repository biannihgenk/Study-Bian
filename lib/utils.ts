import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function daysUntil(date: Date | string): number {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return 'var(--color-success)';
  if (progress >= 50) return 'var(--color-primary)';
  if (progress >= 25) return 'var(--color-warning)';
  return 'var(--color-muted)';
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Urgent': return 'var(--color-destructive)';
    case 'High': return 'var(--color-warning)';
    case 'Medium': return 'var(--color-primary)';
    case 'Low': return 'var(--color-muted-foreground)';
    default: return 'var(--color-muted-foreground)';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Completed': return 'var(--color-success)';
    case 'In Progress':
    case 'Ongoing':
    case 'In Development': return 'var(--color-primary)';
    case 'Todo':
    case 'Planning':
    case 'Idea': return 'var(--color-muted-foreground)';
    case 'Paused':
    case 'Archived':
    case 'Cancelled': return 'var(--color-warning)';
    default: return 'var(--color-muted-foreground)';
  }
}
