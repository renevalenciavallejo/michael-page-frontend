import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  StatusFilter,
  TASK_STATUS_LABELS,
  TaskStatus,
} from '../../../shared/enums/task-status.enum';
import { TasksService } from '../../../shared/services/tasks.service';
import { TaskItemComponent } from './task-item.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, TaskItemComponent],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent {
  private tasksService = inject(TasksService);

  readonly filter = signal<StatusFilter>('all');
  readonly resource = this.tasksService.getTasks(this.filter);
  readonly tasks = () => this.resource.value() ?? [];

  readonly statuses: TaskStatus[] = [
    TaskStatus.Pending,
    TaskStatus.InProgress,
    TaskStatus.Done,
  ];
  readonly labels = TASK_STATUS_LABELS;
}
