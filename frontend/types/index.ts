export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
  pagination: Pagination;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus | '';
  search?: string;
}