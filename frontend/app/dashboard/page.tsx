'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Plus, Search, LogOut, CheckSquare, ChevronLeft, ChevronRight, X, User,
} from 'lucide-react';
import { Task, TaskStatus, TaskFilters, Pagination } from '../../types';
import { tasksApi } from '../../lib/tasks';
import { authApi, clearAuthData, getStoredUser, isAuthenticated } from '../../lib/auth';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const STATUS_OPTIONS: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function DashboardPage() {
  const router = useRouter();
  const user = getStoredUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, limit: 9, status: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const searchTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/login');
  }, [router]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tasksApi.getAll(filters);
      setTasks(res.data);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value, page: 1 }));
    }, 400);
  };

  const handleStatusChange = (status: TaskStatus | '') => {
    setFilters((f) => ({ ...f, status, page: 1 }));
  };

  const handleSaved = (task: Task) => {
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    } else {
      fetchTasks();
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggle = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const openEdit = (task: Task) => { setEditingTask(task); setModalOpen(true); };
  const openCreate = () => { setEditingTask(null); setModalOpen(true); };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {}
    clearAuthData();
    toast.success('Signed out');
    router.push('/login');
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ page: 1, limit: 9, status: '', search: '' });
  };

  const hasActiveFilters = !!filters.search || !!filters.status;
  const totalCount = pagination?.total ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">TaskFlow</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-3">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {totalCount} task{totalCount !== 1 ? 's' : ''} total
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary shrink-0">
            <Plus className="w-4 h-4" />
            New task
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <select
            className="input sm:w-44"
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus | '')}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-secondary shrink-0 text-sm gap-1.5">
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <CheckSquare className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              {hasActiveFilters ? 'No matching tasks' : 'No tasks yet'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first task to get started'}
            </p>
            {!hasActiveFilters && (
              <button onClick={openCreate} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: f.page! - 1 }))}
              disabled={!pagination.hasPrev}
              className="btn-secondary py-2 px-3 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: f.page! + 1 }))}
              disabled={!pagination.hasNext}
              className="btn-secondary py-2 px-3 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}