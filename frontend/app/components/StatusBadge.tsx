import { TaskStatus } from '../../types';
import clsx from 'clsx';

const config: Record<TaskStatus, { label: string; classes: string }> = {
  PENDING: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  COMPLETED: {
    label: 'Completed',
    classes: 'bg-green-50 text-green-700 border-green-200',
  },
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, classes } = config[status];
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', classes)}>
      {label}
    </span>
  );
}