import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TASK_STATUS_LABELS, TaskStatus } from '../enums/task-status.enum';

const STATUS_CLASSES: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'bg-amber-100 text-amber-800',
  [TaskStatus.InProgress]: 'bg-sky-100 text-sky-800',
  [TaskStatus.Done]: 'bg-emerald-100 text-emerald-800',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  readonly status = input.required<TaskStatus>();
  readonly label = computed(() => TASK_STATUS_LABELS[this.status()]);
  readonly classes = computed(() => STATUS_CLASSES[this.status()]);
}
