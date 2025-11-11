export interface Todo {
  id?: number;
  title: string;
  description: string;
  duration: number; // in minutes
  priority: number; // 1-5
  created_at?: string;
  updated_at?: string;
}

export interface TimelineItem {
  todo_id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
}
