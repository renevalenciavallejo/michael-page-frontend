import {
  HttpClient,
  HttpParams,
  httpResource,
  HttpResourceRef,
} from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/services/api-config';
import { ApiResult } from '../models/api-result.dto';
import { CreateTask } from '../models/task/create-task.dto';
import { Task } from '../models/task/task.dto';
import { StatusFilter, TaskStatus } from '../enums/task-status.enum';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  getTasks(filter?: Signal<StatusFilter>): HttpResourceRef<Task[] | undefined> {
    return httpResource<Task[]>(
      () => {
        const value = filter?.();
        const query = value && value !== 'all' ? `?status=${value}` : '';
        return { url: `${this.baseUrl}/tasks${query}` };
      },
      { parse: (raw: unknown) => ((raw as ApiResult)?.data as Task[]) ?? [] },
    );
  }

  createTask(data: CreateTask) {
    return this.http.post<ApiResult>(`${this.baseUrl}/tasks`, data);
  }

  updateTaskStatus(id: number, status: TaskStatus) {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ApiResult>(
      `${this.baseUrl}/tasks/${id}/status`,
      null,
      { params },
    );
  }
}
