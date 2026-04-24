import { TaskAdditionalInfo } from './task-additional-info.dto';

export interface CreateTask {
  title: string;
  userId: number;
  additionalInfo?: TaskAdditionalInfo | null;
}
