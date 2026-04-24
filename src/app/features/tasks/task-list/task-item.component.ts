import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TASK_STATUS_LABELS,
  TaskStatus,
} from '../../../shared/enums/task-status.enum';
import { Task } from '../../../shared/models/task/task.dto';
import { TasksService } from '../../../shared/services/tasks.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';

@Component({
  selector: 'app-task-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe, StatusBadgeComponent],
  templateUrl: './task-item.component.html',
})
export class TaskItemComponent {
  private tasks = inject(TasksService);

  readonly task = input.required<Task>();
  readonly statusChanged = output<void>();

  readonly statuses: TaskStatus[] = [
    TaskStatus.Pending,
    TaskStatus.InProgress,
    TaskStatus.Done,
  ];
  readonly labels = TASK_STATUS_LABELS;
  readonly saving = signal(false);

  onChange(next: TaskStatus) {
    if (next === this.task().status) return;
    this.saving.set(true);
    this.tasks.updateTaskStatus(this.task().id, next).subscribe({
      next: () => {
        this.saving.set(false);
        this.statusChanged.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
