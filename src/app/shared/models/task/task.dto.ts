import { TaskStatus } from '../../enums/task-status.enum';
import { AssignedUser } from './assigned-user.dto';
import { TaskAdditionalInfo } from './task-additional-info.dto';

export interface Task {
  id: number;
  title: string;
  userId: number;
  status: TaskStatus;
  createdAt?: string;
  additionalInfo?: TaskAdditionalInfo | null;
  assignedUser?: AssignedUser | null;
}

// export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
//   [TaskStatus.Pending]: 'Pending',
//   [TaskStatus.InProgress]: 'InProgress',
//   [TaskStatus.Done]: 'Done',
// };
