import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '@env/environment';
import {
  User,
  UserRole,
  UserStatus,
  UserUsage,
  UsageHistoryItem,
  UpdateProfileRequest,
  ChangePasswordRequest
} from '../models/user.model';

export interface UserStats {
  total: number;
  active: number;
  disabled: number;
  pending: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService {
  private readonly usersEndpoint = environment.endpoints.users;

  constructor(http: HttpClient) {
    super(http);
  }

  /* ===================== USERS ===================== */

  getUsers(params?: {
    boardId?: string;
    status?: string;
    role?: string;
    search?: string;
  }): Observable<User[]> {
    if (environment.mockApi) {
      return of(this.getMockUsers());
    }

    return this.get<User[]>(this.usersEndpoint, params).pipe(
      catchError(() => of(this.getMockUsers()))
    );
  }

  getUserById(id: string): Observable<User> {
    if (environment.mockApi) {
      const user = this.getMockUsers().find(u => u.id === id);
      return of(user ?? this.getMockUsers()[0]);
    }

    return this.get<User>(`${this.usersEndpoint}/${id}`).pipe(
      catchError(() => of(this.getMockUsers()[0]))
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    if (environment.mockApi) {
      return of({
        ...user,
        id: crypto.randomUUID(),
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      } as User);
    }

    return this.post<User>(this.usersEndpoint, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    if (environment.mockApi) {
      return of({ ...user, id } as User);
    }

    return this.put<User>(`${this.usersEndpoint}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    if (environment.mockApi) {
      return of(void 0);
    }

    return this.delete<void>(`${this.usersEndpoint}/${id}`);
  }

  enableUser(id: string): Observable<User> {
    return this.updateUser(id, { status: UserStatus.ACTIVE });
  }

  disableUser(id: string): Observable<User> {
    return this.updateUser(id, { status: UserStatus.DISABLED });
  }

  /* ===================== STATS ===================== */

  getUserStats(): Observable<UserStats> {
    return this.getUsers().pipe(
      map(users => ({
        total: users.length,
        active: users.filter(u => u.status === UserStatus.ACTIVE).length,
        disabled: users.filter(u => u.status === UserStatus.DISABLED).length,
        pending: users.filter(u => u.status === UserStatus.PENDING).length
      }))
    );
  }

  /* ===================== USAGE ===================== */

  getUserUsage(_: string): Observable<UserUsage> {
    if (environment.mockApi) {
      return of(this.getMockUsage());
    }

    return this.get<UserUsage>(`${this.usersEndpoint}/usage`).pipe(
      catchError(() => of(this.getMockUsage()))
    );
  }

  getUserUsageHistory(_: string): Observable<UsageHistoryItem[]> {
    if (environment.mockApi) {
      return of(this.getMockUsageHistory());
    }

    return this.get<UsageHistoryItem[]>(`${this.usersEndpoint}/usage/history`).pipe(
      catchError(() => of(this.getMockUsageHistory()))
    );
  }

  /* ===================== PROFILE ===================== */

  updateProfile(request: UpdateProfileRequest): Observable<User> {
    if (environment.mockApi) {
      return of({ ...request } as User);
    }

    return this.put<User>(`${this.usersEndpoint}/profile`, request);
  }

  getUsersByBoard(boardId: string): Observable<User[]> {
  return of(
    this.getMockUsers().filter((u: User) => u.boardId === boardId)
  );
}


  changePassword(_: ChangePasswordRequest): Observable<{ success: boolean; message: string }> {
    return of({
      success: true,
      message: 'Password changed successfully (mock)'
    });
  }

  /* ===================== MOCK DATA ===================== */

  private getMockUsers(): User[] {
    return [
      {
        id: 'user-001',
        email: 'admin@example.com',
        firstName: 'John',
        lastName: 'Admin',
        role: UserRole.TENANT_ADMIN,
        tenantId: 'tenant-001',
        status: UserStatus.ACTIVE,
        usage: this.getMockUsage(),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      {
        id: 'user-002',
        email: 'user@example.com',
        firstName: 'Sarah',
        lastName: 'Manager',
        role: UserRole.TENANT_USER,
        tenantId: 'tenant-001',
        status: UserStatus.PENDING,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      }
    ];
  }

  private getMockUsage(): UserUsage {
    return {
      requests: 750,
      requestsLimit: 1000,
      dataTransferred: 3_750_000,
      dataLimit: 10_000_000,
      storageUsed: 750_000_000,
      storageLimit: 2_000_000_000,
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31'
    };
  }

  private getMockUsageHistory(): UsageHistoryItem[] {
    const history: UsageHistoryItem[] = [];
    const today = new Date();

    for (let i = 14; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      history.push({
        date: d,
        usage: Math.floor(Math.random() * 120),
        unit: 'API calls'
      });
    }

    return history;
  }
}
