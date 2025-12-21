import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap, catchError } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) =>
{
    const router: Router = inject(Router);
    const authService = inject(AuthService);

    console.log('[AuthGuard] Checking authentication for:', state.url);

    // Check the authentication status
    return authService.check().pipe(
        switchMap((authenticated) =>
        {
            console.log('[AuthGuard] Authentication check result:', authenticated);
            
            // If the user is not authenticated...
            if ( !authenticated )
            {
                console.warn('[AuthGuard] User not authenticated, redirecting to sign-in');
                // Redirect to the sign-in page with a redirectUrl param
                const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
                const urlTree = router.parseUrl(`sign-in?${redirectURL}`);

                return of(urlTree);
            }

            console.log('[AuthGuard] User authenticated, allowing access');
            // Allow the access
            return of(true);
        }),
        catchError((error) => {
            console.error('[AuthGuard] Error during authentication check:', error);
            const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
            const urlTree = router.parseUrl(`sign-in?${redirectURL}`);
            return of(urlTree);
        })
    );
};
