import type {Todo, TimelineItem, User, OnboardingRequest, OnboardingResponse} from './types';

const API_BASE_URL = 'http://localhost:8080/api';

// Helper to include credentials in all requests
const fetchWithCredentials = (url: string, options?: RequestInit) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // Include cookies
  });
};

export const api = {
  async getCurrentUser(): Promise<User> {
    const response = await fetchWithCredentials(`${API_BASE_URL}/user`);
    if (!response.ok) throw new Error('Failed to get user');
    return response.json();
  },

  async completeOnboarding(request: OnboardingRequest): Promise<OnboardingResponse> {
    const response = await fetchWithCredentials(`${API_BASE_URL}/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to complete onboarding');
    return response.json();
  },

  async getTodos(): Promise<Todo[]> {
    const response = await fetchWithCredentials(`${API_BASE_URL}/todos`);
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },

  async createTodo(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo> {
    const response = await fetchWithCredentials(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
  },

  async updateTodo(id: number, todo: Partial<Todo>): Promise<Todo> {
    const response = await fetchWithCredentials(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
  },

  async deleteTodo(id: number): Promise<void> {
    const response = await fetchWithCredentials(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete todo');
  },

  async planDay(todos: Todo[], startTime: string): Promise<TimelineItem[]> {
    const response = await fetchWithCredentials(`${API_BASE_URL}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todos, start_time: startTime }),
    });
    if (!response.ok) throw new Error('Failed to plan day');
    const data = await response.json();
    return data.timeline;
  },
};
