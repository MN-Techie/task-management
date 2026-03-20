import { api } from './api';
import { Task, TasksResponse, TaskFilters, TaskStatus } from '../types';

export const tasksApi = {
  getAll: async (filters: TaskFilters = {}): Promise<TasksResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    const { data } = await api.get<TasksResponse>(`/tasks?${params.toString()}`);
    return data;
  },

  getOne: async (id: string): Promise<Task> => {
    const { data } = await api.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
    return data.data;
  },

  create: async (payload: { title: string; description?: string; status?: TaskStatus }): Promise<Task> => {
    const { data } = await api.post<{ success: boolean; data: Task }>('/tasks', payload);
    return data.data;
  },

  update: async (id: string, payload: { title?: string; description?: string | null; status?: TaskStatus }): Promise<Task> => {
    const { data } = await api.patch<{ success: boolean; data: Task }>(`/tasks/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  toggle: async (id: string): Promise<Task> => {
    const { data } = await api.post<{ success: boolean; data: Task }>(`/tasks/${id}/toggle`);
    return data.data;
  },
};