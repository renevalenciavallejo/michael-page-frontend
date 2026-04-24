import { Injectable, signal } from '@angular/core';

export type ToastKind = 'error' | 'success' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly messages = signal<Toast[]>([]);

  show(message: string, kind: ToastKind = 'info', ttlMs = 4000): void {
    const toast: Toast = { id: this.nextId++, kind, message };
    this.messages.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), ttlMs);
  }

  error(message: string): void {
    this.show(message, 'error', 5000);
  }
  success(message: string): void {
    this.show(message, 'success');
  }

  dismiss(id: number): void {
    this.messages.update(list => list.filter(t => t.id !== id));
  }
}
