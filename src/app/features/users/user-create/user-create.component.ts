import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../../../shared/services/users.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-create.component.html',
})
export class UserCreateComponent {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private toast = inject(ToastService);

  submitting = false;

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
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
    this.submitting = true;
    this.usersService.createUser(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Usuario creado.');
        this.router.navigate(['/tasks/new']);
      },
      error: () => (this.submitting = false),
    });
  }
}
