import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { CreateTask } from '../../../shared/models/task/create-task.dto';
import { TasksService } from '../../../shared/services/tasks.service';
import { UsersService } from '../../../shared/services/users.service';

@Component({
  selector: 'app-task-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './task-create.component.html',
})
export class TaskCreateComponent {
  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly usersResource = this.usersService.getUsers();
  readonly users = () => this.usersResource.value() ?? [];

  submitting = false;

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    userId: [null as number | null, [Validators.required]],
    additionalInfo: this.fb.group({
      priority: [''],
      estimatedEndDate: [''],
      tags: [''],
    }),
  });

  showError(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, userId, additionalInfo } = this.form.getRawValue() as {
      title: string;
      userId: number;
      additionalInfo: {
        priority: string;
        estimatedEndDate: string;
        tags: string;
      };
    };

    const dto: CreateTask = {
      title: title.trim(),
      userId,
      additionalInfo: buildAdditionalInfo(additionalInfo),
    };

    this.submitting = true;
    this.tasksService.createTask(dto).subscribe({
      next: () => {
        this.toast.success('Tarea creada.');
        this.router.navigate(['/tasks']);
      },
      error: () => (this.submitting = false),
    });
  }
}

function buildAdditionalInfo(v: {
  priority: string;
  estimatedEndDate: string;
  tags: string;
}) {
  const priority = v.priority?.trim() || null;
  const estimatedEndDate = v.estimatedEndDate
    ? new Date(v.estimatedEndDate).toISOString()
    : null;
  const tags = v.tags
    ? v.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (!priority && !estimatedEndDate && tags.length === 0) return null;
  return { priority, estimatedEndDate, tags, metadata: {} };
}
