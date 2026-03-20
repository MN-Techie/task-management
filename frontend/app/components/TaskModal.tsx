'use client';
import { useState, useEffect, FormEvent } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Task, TaskStatus } from '../../types';
import { tasksApi } from '../../lib/tasks';

interface Props {
  task?: Task | null;
  onClose: () => void;
  onSaved: (task: Task) => void;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function TaskModal({ task, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: (task?.status || 'PENDING') as TaskStatus,
  });
  const [loading, setLoading] = useState(false);
  const isEditing = !!task;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
      };
      const saved = isEditing
        ? await tasksApi.update(task.id, payload)
        : await tasksApi.create(payload);
      toast.success(isEditing ? 'Task updated!' : 'Task created!');
      onSaved(saved);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit task' : 'New task'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              className="input resize-none"
              placeholder="Add more details..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={1000}
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}