import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { ROLE_ACCESS } from 'app/core/auth/auth.utils';
import { filter, map, take, catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Role Guard - Checks if user has required roles
 * @param allowedRoles - Array of role names that are allowed to access the route
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const router: Router = inject(Router);
    const userService: UserService = inject(UserService);

    return userService.user$.pipe(
      filter(user => user !== null && user !== undefined), // Wait for user to be loaded
      take(1), // Take the first valid user
      map((user) => {
        if (!user || !user.roles || user.roles.length === 0) {
          console.warn('[RoleGuard] No user or roles found');
          router.navigate(['/']);
          return false;
        }

        console.log('[RoleGuard] Checking access for user with roles:', user.roles);
        console.log('[RoleGuard] Required roles:', allowedRoles);

        // Admin or Administrateur role has access to everything
        if (user.roles.includes('Administrateur') || user.roles.includes('Admin')) {
          console.log('[RoleGuard] User has Administrateur/Admin role - allowing access');
          return true;
        }

        // Check if user has any of the required roles
        const hasAccess = allowedRoles.some(role => user.roles?.includes(role));
        
        console.log('[RoleGuard] Has access:', hasAccess);
        
        if (!hasAccess) {
          console.warn('[RoleGuard] Access denied - redirecting');
          // Redirect to first accessible route based on user roles
          let redirectPath = '/profile'; // Default safe route for all authenticated users
          
          // Find first accessible route for user
          for (const role of user.roles) {
            const allowedRoutes = ROLE_ACCESS[role] || [];
            if (allowedRoutes.length > 0 && allowedRoutes[0] !== '*') {
              redirectPath = allowedRoutes[0];
              break;
            }
          }
          
          console.log('[RoleGuard] Redirecting to:', redirectPath);
          router.navigate([redirectPath]);
          return false;
        }

        return true;
      }),
      catchError((error) => {
        console.error('[RoleGuard] Error checking roles:', error);
        router.navigate(['/']);
        return of(false);
      })
    );
  };
};

