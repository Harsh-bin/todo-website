
export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export enum TaskPeriod {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}

export interface Note {
  id: string;
  type: 'text' | 'link';
  content: string;
}

export interface TargetDate {
  id: string;
  label: string;
  date: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
}

export interface Stars {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface StarsData {
    stars: Stars;
    dailyResetDate: string;
    weeklyResetWeek: string;
    monthlyResetMonth: string;
    totalEarned: number;
    totalTasks: number;
}

export interface StreakData {
  current: number;
  starsThisWeek: number; // 0-7
  lastUpdate: string; // YYYY-MM-DD
}
