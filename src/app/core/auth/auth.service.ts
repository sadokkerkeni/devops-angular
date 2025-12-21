import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError ,map } from 'rxjs';
import { User } from '../user/user.types';


@Injectable({providedIn: 'root'})
export class AuthService
{
    
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
     * Get CompanyId from JWT token
     */
    getCompanyId(): number | null {
        const token = this.accessToken;
        if (!token) {
            console.log('[AuthService] No access token found');
            return null;
        }
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('[AuthService] JWT payload:', payload);
            const companyId = payload.CompanyId || null;
            console.log('[AuthService] Extracted CompanyId:', companyId);
            return companyId;
        } catch (error) {
            console.error('[AuthService] Error parsing JWT token:', error);
            return null;
        }
    }

    /**
     * Get UserId from JWT token
     */
    getUserId(): number | null {
        const token = this.accessToken;
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.UserId || payload.sub || null;
        } catch (error) {
            console.error('Error parsing JWT token:', error);
            return null;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
  signIn(credentials: { email: string; password: string }): Observable<any> {
    if (this._authenticated) {
      return throwError(() => new Error('User is already logged in.'));
    }

    const loginUrl = `http://localhost:5288/api/Auth/login`;
    return this._httpClient.post<{ token: string }>(loginUrl, credentials).pipe(
      switchMap((loginResponse) => {
        const token = loginResponse.token;
        if (token) {
          this.accessToken = token;
          this._authenticated = true;

          const profileUrl = `http://localhost:5288/api/users/user-profile`;
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
          });

          return this._httpClient.get<any>(profileUrl, { headers }).pipe(
            switchMap((userProfileData: any) => { // Typage explicite pour les données brutes
              console.log('[AuthService] Profil utilisateur brut reçu:', userProfileData);

              // --- DEBUT DE LA TRANSFORMATION ---
              // Mapper les données du backend vers l'interface User de Fuse
              // Vérifiez les types et adaptez si nécessaire
              const mappedUser: User = {
                // id: userProfileData.id?.toString() || '', // Convertir number en string si nécessaire
                // Si l'ID backend est un number et Fuse attend un string
                id: userProfileData.id != null ? userProfileData.id.toString() : '',
                // Combiner firstName et lastName pour le champ 'name' de Fuse
                name: `${userProfileData.firstName || ''} ${userProfileData.lastName || ''}`.trim(),
                // email correspond directement
                email: userProfileData.email || '',
                // 🏢 Add CompanyId from JWT token
                companyId: this.getCompanyId(),
                // Add roles from user profile
                roles: userProfileData.roles || [],
                // avatar: '', // Backend ne fournit pas d'avatar? Laisser vide ou undefined
                // status: userProfileData.state !== undefined ? userProfileData.state.toString() : 'true', // Mapper 'state' boolean à 'status' string si voulu
                // Vous pouvez ajouter d'autres mappings si nécessaire en fonction de User.types
              };
              console.log('[AuthService] Profil utilisateur mappé:', mappedUser);
              // --- FIN DE LA TRANSFORMATION ---

              // Assigner l'utilisateur MAPPÉ au UserService
              // Cela utilisera le setter de UserService qui alimente le ReplaySubject
              this._userService.user = mappedUser;

              // Retourner les données combinées si nécessaire pour l'observable
              return of({
                ...loginResponse,
                user: mappedUser // Inclure l'utilisateur mappé
              });
            }),
            catchError((profileError) => {
              console.error('[AuthService] Erreur lors de la récupération du profil utilisateur après login:', profileError);
              this.signOut(); // Nettoyer en cas d'erreur de profil
              return throwError(() => new Error('Login succeeded, but failed to load user profile.'));
            })
          );
        } else {
          return throwError(() => new Error('Login failed: No token received.'));
        }
      }),
      catchError((loginError) => {
        this._authenticated = false;
        console.error('[AuthService] Erreur de login:', loginError);
        return throwError(loginError);
      })
    );
  }


    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // If already authenticated, just return true
        if (this._authenticated && this.accessToken && !AuthUtils.isTokenExpired(this.accessToken))
        {
            console.log('[AuthService] Already authenticated with valid token');
            return of(true);
        }

        // If we have a token, load user profile and set authenticated
        if (this.accessToken && !AuthUtils.isTokenExpired(this.accessToken))
        {
            console.log('[AuthService] Loading user profile from token');
            const profileUrl = `http://localhost:5288/api/users/user-profile`;
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${this.accessToken}`
            });

            return this._httpClient.get<any>(profileUrl, { headers }).pipe(
                switchMap((userProfileData: any) => {
                    console.log('[AuthService] Profile loaded from token:', userProfileData);
                    
                    // Map user data
                    const mappedUser: User = {
                        id: userProfileData.id != null ? userProfileData.id.toString() : '',
                        name: `${userProfileData.firstName || ''} ${userProfileData.lastName || ''}`.trim(),
                        email: userProfileData.email || '',
                        companyId: this.getCompanyId(),
                        roles: userProfileData.roles || [],
                    };

                    // Set authenticated
                    this._authenticated = true;

                    // Store the user
                    this._userService.user = mappedUser;

                    return of(true);
                }),
                catchError((error) => {
                    console.error('[AuthService] Error loading profile from token:', error);
                    this._authenticated = false;
                    return of(false);
                })
            );
        }

        // No valid token
        return of(false);
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Clear user data to ensure navigation is filtered properly
        // Set user to empty object with no roles so navigation becomes empty
        this._userService.user = {
            id: '',
            name: '',
            email: '',
            roles: []
        };

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
   signUp(user: {
    firstName: string;
    lastName: string;
    matricule: string;
    email: string;
    password: string;
}): Observable<any> {
    // Use backend Auth register endpoint per swagger
    return this._httpClient.post('http://localhost:5288/api/Auth/register', user);
}


    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            this._authenticated = false;
            return of(false);
        }

        // If we have a valid token but aren't marked as authenticated yet,
        // try to load user profile and set authenticated
        if (this.accessToken && !AuthUtils.isTokenExpired(this.accessToken))
        {
            const profileUrl = `http://localhost:5288/api/users/user-profile`;
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${this.accessToken}`
            });

            return this._httpClient.get<any>(profileUrl, { headers }).pipe(
                switchMap((userProfileData: any) => {
                    // Map user data
                    const mappedUser: User = {
                        id: userProfileData.id != null ? userProfileData.id.toString() : '',
                        name: `${userProfileData.firstName || ''} ${userProfileData.lastName || ''}`.trim(),
                        email: userProfileData.email || '',
                        companyId: this.getCompanyId(),
                        roles: userProfileData.roles || [],
                    };

                    // Set authenticated
                    this._authenticated = true;

                    // Store the user
                    this._userService.user = mappedUser;

                    return of(true);
                }),
                catchError((error) => {
                    console.error('[AuthService] Error loading profile in check():', error);
                    this._authenticated = false;
                    return of(false);
                })
            );
        }

        return of(false);
    }
}
