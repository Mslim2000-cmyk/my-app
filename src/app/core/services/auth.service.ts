import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of} from 'rxjs';
import { tap, catchError, map,delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import {
  User,
   UserRole,UserStatus,
  UserUsage,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = environment.tokenKey;
  private readonly userKey = environment.userKey;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuthState(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Login user with email and password
   */
login(data: any): Observable<AuthResponse> {
  const mockUser: User = {
    id: 'user-001',
    email: data.email,
    firstName: 'Demo',
    lastName: 'User',
    role: UserRole.TENANT_ADMIN,
    tenantId: 'tenant-001',
    status: UserStatus.ACTIVE,
    usage: {
      requests: 120,
      requestsLimit: 1000,
      dataTransferred: 3_200_000,
      dataLimit: 10_000_000,
      storageUsed: 500_000_000,
      storageLimit: 2_000_000_000,
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    companyName: 'Demo Company'
  };

  const response: AuthResponse = {
    success: true,
    message: 'Login successful (mock)',
    accessToken: 'mock-access-token',
    user: mockUser
  };

  return of(response).pipe(
    tap(res => {
      this.setSession(res);
      this.currentUserSubject.next(res.user);
      this.isAuthenticatedSubject.next(true);
    })
  );
}


  /**
   * Register a new user
   */
register(data: RegisterRequest): Observable<AuthResponse> {
  if (environment.mockApi) {

    const mockUser: User = {
      id: 'u-001',
      email: data.email,
      firstName: data.firstName ?? 'Demo',
      lastName: data.lastName ?? 'User',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-001',
      status: UserStatus.ACTIVE,
      usage: {
        requests: 0,
        requestsLimit: 1000,
        dataTransferred: 0,
        dataLimit: 10_000_000,
        storageUsed: 0,
        storageLimit: 2_000_000_000,
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString()
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      companyName: data.companyName ?? 'Demo Company'
    };

    return of({
      accessToken: 'mock-access-token',
      success: true,
      message: 'Registration successful (mock)',
      user: mockUser
    }).pipe(delay(800));
  }

  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data);
}



  /**
   * Request password reset email
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}${environment.endpoints.forgotPassword}`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Reset password with token
   */
  resetPassword(request: ResetPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}${environment.endpoints.resetPassword}`,
      request
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Logout user and clear session
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  setSession(auth: AuthResponse) {
  localStorage.setItem(this.tokenKey, auth.accessToken);
  localStorage.setItem(this.userKey, JSON.stringify(auth.user));
}


  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Store JWT token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Store user in localStorage
   */
  private setStoredUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get current user synchronously
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if current user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Update current user data
   */
  updateCurrentUser(user: User): void {
    this.setStoredUser(user);
    this.currentUserSubject.next(user);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
    }
    
    console.error('Auth Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}