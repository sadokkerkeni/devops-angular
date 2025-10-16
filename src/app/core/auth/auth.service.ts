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
        // Sign in using the token
        return this._httpClient.post('api/auth/sign-in-with-token', {
            accessToken: this.accessToken,
        }).pipe(
            catchError(() =>

                // Return false
                of(false),
            ),
            switchMap((response: any) =>
            {
                // Replace the access token with the new one if it's available on
                // the response object.
                //
                // This is an added optional step for better security. Once you sign
                // in using the token, you should generate a new one on the server
                // side and attach it to the response object. Then the following
                // piece of code can replace the token with the refreshed one.
                if ( response.accessToken )
                {
                    this.accessToken = response.accessToken;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            }),
        );
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
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
