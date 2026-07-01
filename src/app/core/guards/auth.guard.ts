import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
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
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree {
  if (this.authService.isAuthenticated()) {
    return true;
  }

  return this.router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Store the attempted URL for redirecting after login
    console.log('Access denied. Redirecting to login...');
    
    // Navigate to login with return URL
    return this.router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: url }
    });
  }
}