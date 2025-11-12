export interface User {
  id: number;
  username: string;
  session_token?: string;
  onboarding_completed: boolean;
  initial_goal?: string;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id?: number;
  user_id?: number;
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

export interface OnboardingRequest {
  username?: string;
  goal: string;
}

export interface OnboardingResponse {
  user: User;
  todos: Todo[];
}
