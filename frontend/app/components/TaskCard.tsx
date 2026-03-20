'use client';
import { useState } from 'react';
import { Pencil, Trash2, RefreshCw, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Task } from '../../types';
import { tasksApi } from '../../lib/tasks';
import StatusBadge from './StatusBadge';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }: Props) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const updated = await tasksApi.toggle(task.id);
      onToggle(updated);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    setDeleting(true);
    try {
      await tasksApi.delete(task.id);
      onDelete(task.id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="card p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className={`font-medium text-slate-900 truncate ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </h3>
            <StatusBadge status={task.status} />
          </div>

          {task.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={handleToggle}
            disabled={toggling}
            title="Cycle status"
            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${toggling ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete task"
            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}