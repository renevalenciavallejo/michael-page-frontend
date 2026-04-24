export enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Done = 'Done',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'Pendiente',
  [TaskStatus.InProgress]: 'En progreso',
  [TaskStatus.Done]: 'Completado',
};

export type StatusFilter = TaskStatus | 'all';
