import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from 'app/core/user/user.service';
import { filterNavigationByRoles } from 'app/core/auth/auth.utils';
import { Observable, ReplaySubject, combineLatest, of, Subject } from 'rxjs';
import { map, tap, startWith, catchError, timeout, distinctUntilChanged, filter, takeUntil, shareReplay, take } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class NavigationService implements OnDestroy
{
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _baseNavigation$: Observable<Navigation>;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    )
    {
        // Emit initial empty navigation to ensure navigation$ always has a value
        const emptyNav: Navigation = {
            compact: [],
            default: [],
            futuristic: [],
            horizontal: []
        };
        this._navigation.next(emptyNav);

        // Load base navigation data once and cache it
        this._baseNavigation$ = this._httpClient.get<Navigation>('api/common/navigation').pipe(
            timeout(3000),
            shareReplay(1), // Cache the navigation data
            catchError((error) => {
                console.warn('[NavigationService] Error loading navigation, using empty navigation:', error);
                // Return empty navigation structure
                return of(emptyNav);
            })
        );

        // Subscribe to user changes and re-filter navigation reactively
        combineLatest([
            this._baseNavigation$,
            this._userService.user$.pipe(
                startWith(null),
                catchError(() => of(null))
            )
        ]).pipe(
            map(([navigation, user]) => {
                // Get user roles - only process if user data is actually loaded with valid roles
                const roles = (user && user.roles && Array.isArray(user.roles) && user.roles.length > 0) ? user.roles : null;
                
                // MODIFIED: If user data not loaded yet OR roles are empty/invalid, return empty navigation
                // This ensures navigation only shows when user is authenticated
                if (!user || !roles || roles.length === 0) {
                    console.log('[NavigationService] User not loaded or no roles - returning empty navigation. User:', user);
                    // Return empty navigation until user data is loaded
                    return emptyNav;
                }
                
                console.log('[NavigationService] Loading navigation for all users (no filtering)');
                
                // MODIFIED: All authenticated users see all navigation items
                // No filtering - everyone can access everything
                const processed = {
                    compact: navigation.compact || [],
                    default: navigation.default || [],
                    futuristic: navigation.futuristic || [],
                    horizontal: navigation.horizontal || [],
                };
                
                console.log('[NavigationService] Navigation items loaded:', {
                    compact: processed.compact.length,
                    default: processed.default.length,
                    futuristic: processed.futuristic.length,
                    horizontal: processed.horizontal.length,
                    roles: roles
                });
                
                return processed;
            }),
            tap((navigation) =>
            {
                console.log('[NavigationService] Emitting navigation update');
                this._navigation.next(navigation);
            }),
            catchError((error) => {
                console.error('[NavigationService] Fatal error:', error);
                // Return empty navigation on error
                this._navigation.next(emptyNav);
                return of(emptyNav);
            }),
            takeUntil(this._unsubscribeAll)
        ).subscribe();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnDestroy(): void
    {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data filtered by user roles
     * This method returns the observable for the resolver (backwards compatibility)
     */
    get(): Observable<Navigation>
    {
        // Return the navigation$ observable which is already reactive
        // ReplaySubject will immediately emit the last value if it exists
        // Otherwise wait for first emission with timeout
        return this.navigation$.pipe(
            take(1), // Take the first emission
            timeout(5000), // Wait up to 5 seconds
            catchError(() => {
                // If timeout or error, return empty navigation
                console.warn('[NavigationService] get() timeout/error, returning empty navigation');
                return of({
                    compact: [],
                    default: [],
                    futuristic: [],
                    horizontal: []
                } as Navigation);
            })
        );
    }
}
