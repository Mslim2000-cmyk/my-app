import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Get required roles from route data
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      // No roles specified, allow access
      return true;
    }

    // Check if user is authenticated first
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Check if user has required role
    if (this.authService.hasAnyRole(requiredRoles)) {
      return true;
    }

    // User doesn't have required role, redirect to dashboard with error
    console.warn('Access denied. Insufficient permissions.');
    return this.router.createUrlTree(['/dashboard'], {
      queryParams: { error: 'insufficient_permissions' }
    });
  }
}