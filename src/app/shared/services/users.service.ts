import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../../core/services/api-config';
import { User } from '../models/user/user.dto';
import { ApiResult } from '../models/api-result.dto';
import { CreateUser } from '../models/user/create-user.dto';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  createUser(data: CreateUser) {
    return this.http.post<void>(`${this.baseUrl}/users`, data);
  }

  getUser(userId: number): HttpResourceRef<User | undefined> {
    return httpResource<User>(
      () => ({
        url: `${this.baseUrl}/users/${userId}`,
      }),
      {
        parse: (raw: unknown) => (raw as ApiResult)?.data as User,
      },
    );
  }

  getUsers(): HttpResourceRef<User[] | undefined> {
    return httpResource<User[]>(
      () => ({
        url: `${this.baseUrl}/users`,
      }),
      {
        parse: (raw: unknown) => (raw as ApiResult)?.data as User[],
      },
    );
  }
}
