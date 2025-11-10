export interface UserSettings {
  id?: number;
  wakeUpTime: string;
  sleepTime: string;
  workStartTime: string;
  workEndTime: string;
  goals: string[];
  todayFocus: string;
}

export interface TodoItem {
  id?: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  createdAt?: string;
}

export interface ScheduleItem {
  id?: number;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  completed: boolean;
  date: string;
}

export interface DailyPlan {
  id?: number;
  date: string;
  scheduleItems: ScheduleItem[];
  createdAt?: string;
}

export interface ProgressStats {
  totalTodos: number;
  completedTodos: number;
  completionRate: number;
  scheduledItemsCompleted: number;
  totalScheduledItems: number;
}
