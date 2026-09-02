// XP rewards for different actions
export const XP_REWARDS = {
  COMPLETE_TASK: 10,
  FOCUS_SESSION: 20, // base, +1 per minute
  COMPLETE_GOAL: 100,
  COMPLETE_COMPETITION: 150,
  COMPLETE_PROJECT: 200,
  COMPLETE_MILESTONE: 15,
  LOG_SESSION: 5,
} as const;

// Level calculation: Level N requires N * 250 XP total
export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / 250) + 1;
}

export function getXpForLevel(level: number): number {
  return (level - 1) * 250;
}

export function getXpProgress(xp: number): { current: number; required: number; percentage: number } {
  const level = getLevelFromXp(xp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const current = xp - currentLevelXp;
  const required = nextLevelXp - currentLevelXp;
  return {
    current,
    required,
    percentage: Math.round((current / required) * 100),
  };
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Beginner',
  2: 'Explorer',
  3: 'Learner',
  4: 'Student',
  5: 'Practitioner',
  6: 'Builder',
  7: 'Achiever',
  8: 'Specialist',
  9: 'Expert',
  10: 'Master',
  11: 'Grandmaster',
  12: 'Legend',
};

export function getLevelTitle(level: number): string {
  if (level >= 12) return LEVEL_TITLES[12];
  return LEVEL_TITLES[level] || 'Beginner';
}

// Task categories
export const TASK_CATEGORIES = [
  'Learning', 'School', 'Competition', 'Project', 'Personal', 'Other',
] as const;

// Task statuses
export const TASK_STATUSES = ['Todo', 'In Progress', 'Completed'] as const;

// Task priorities
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;

// Goal statuses
export const GOAL_STATUSES = ['Active', 'Completed', 'Paused', 'Archived'] as const;

// Competition statuses
export const COMPETITION_STATUSES = ['Planning', 'Ongoing', 'Completed', 'Cancelled'] as const;

// Project statuses
export const PROJECT_STATUSES = [
  'Idea', 'Planning', 'In Development', 'Completed', 'Paused', 'Archived',
] as const;

// Learning resource statuses
export const RESOURCE_STATUSES = ['Not Started', 'In Progress', 'Completed'] as const;

// Timer presets in minutes
export const TIMER_PRESETS = [15, 25, 45, 60] as const;

// Schedule event categories
export const EVENT_CATEGORIES = [
  'Learning', 'School', 'Competition', 'Project', 'Personal', 'Other',
] as const;

// Category colors
export const CATEGORY_COLORS: Record<string, string> = {
  Learning: '#6366f1',
  School: '#f59e0b',
  Competition: '#ef4444',
  Project: '#10b981',
  Personal: '#8b5cf6',
  Other: '#64748b',
  General: '#6366f1',
};

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = [
  { key: 'first_task', title: 'First Step', description: 'Complete your first task', icon: '✅', xpReward: 10, condition: '{"type":"tasks_completed","value":1}' },
  { key: 'first_goal', title: 'Dream Big', description: 'Create your first goal', icon: '🎯', xpReward: 10, condition: '{"type":"goals_created","value":1}' },
  { key: 'first_competition', title: 'Challenger', description: 'Join your first competition', icon: '🏆', xpReward: 10, condition: '{"type":"competitions_created","value":1}' },
  { key: 'first_project', title: 'Creator', description: 'Start your first project', icon: '💻', xpReward: 10, condition: '{"type":"projects_created","value":1}' },
  { key: 'first_focus', title: 'Focused', description: 'Complete your first focus session', icon: '⏱️', xpReward: 10, condition: '{"type":"focus_sessions","value":1}' },
  { key: 'streak_7', title: 'On Fire', description: 'Maintain a 7-day streak', icon: '🔥', xpReward: 50, condition: '{"type":"streak","value":7}' },
  { key: 'streak_30', title: 'Unstoppable', description: 'Maintain a 30-day streak', icon: '💪', xpReward: 200, condition: '{"type":"streak","value":30}' },
  { key: 'learning_10h', title: 'Dedicated Learner', description: 'Log 10 hours of learning', icon: '📚', xpReward: 100, condition: '{"type":"learning_minutes","value":600}' },
  { key: 'learning_50h', title: 'Knowledge Seeker', description: 'Log 50 hours of learning', icon: '🧠', xpReward: 300, condition: '{"type":"learning_minutes","value":3000}' },
  { key: 'tasks_10', title: 'Productive', description: 'Complete 10 tasks', icon: '📝', xpReward: 50, condition: '{"type":"tasks_completed","value":10}' },
  { key: 'tasks_100', title: 'Task Master', description: 'Complete 100 tasks', icon: '🏅', xpReward: 300, condition: '{"type":"tasks_completed","value":100}' },
  { key: 'goal_complete', title: 'Goal Getter', description: 'Complete your first goal', icon: '🌟', xpReward: 100, condition: '{"type":"goals_completed","value":1}' },
  { key: 'comp_complete', title: 'Champion', description: 'Complete your first competition', icon: '🥇', xpReward: 150, condition: '{"type":"competitions_completed","value":1}' },
  { key: 'project_complete', title: 'Shipbuilder', description: 'Complete your first project', icon: '🚀', xpReward: 200, condition: '{"type":"projects_completed","value":1}' },
] as const;

// Notification types
export const NOTIFICATION_TYPES = ['Info', 'Warning', 'Success', 'Achievement', 'Deadline', 'Streak'] as const;
