import axios from 'axios';
import { UserSettings, TodoItem, DailyPlan, ProgressStats } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User Settings API
export const userSettingsApi = {
  get: async (): Promise<UserSettings> => {
    const response = await api.get('/settings');
    return response.data;
  },
  update: async (settings: UserSettings): Promise<UserSettings> => {
    const response = await api.put('/settings', settings);
    return response.data;
  },
};

// TODO API
export const todoApi = {
  getAll: async (): Promise<TodoItem[]> => {
    const response = await api.get('/todos');
    return response.data;
  },
  create: async (todo: TodoItem): Promise<TodoItem> => {
    const response = await api.post('/todos', todo);
    return response.data;
  },
  update: async (id: number, todo: TodoItem): Promise<TodoItem> => {
    const response = await api.put(`/todos/${id}`, todo);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
  toggleComplete: async (id: number): Promise<TodoItem> => {
    const response = await api.patch(`/todos/${id}/toggle`);
    return response.data;
  },
};

// AI Planner API
export const plannerApi = {
  generatePlan: async (): Promise<DailyPlan> => {
    const response = await api.post('/planner/generate');
    return response.data;
  },
  getTodayPlan: async (): Promise<DailyPlan | null> => {
    try {
      const response = await api.get('/planner/today');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  updateScheduleItem: async (planId: number, itemId: number, completed: boolean): Promise<void> => {
    await api.patch(`/planner/${planId}/items/${itemId}`, { completed });
  },
};

// Progress API
export const progressApi = {
  getStats: async (): Promise<ProgressStats> => {
    const response = await api.get('/progress/stats');
    return response.data;
  },
};
