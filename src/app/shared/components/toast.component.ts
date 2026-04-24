import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  readonly toast = inject(ToastService);
}
