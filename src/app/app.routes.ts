import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent),
  },
  {
    path: 'tasks/new',
    loadComponent: () =>
      import('./features/tasks/task-create/task-create.component').then(m => m.TaskCreateComponent),
  },
  {
    path: 'users/new',
    loadComponent: () =>
      import('./features/users/user-create/user-create.component').then(m => m.UserCreateComponent),
  },
  { path: '**', redirectTo: 'tasks' },
];
