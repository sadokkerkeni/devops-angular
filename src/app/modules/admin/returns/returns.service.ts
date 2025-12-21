import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// Return interface matching the backend model
export interface Return {
    id: number;
    returnLineId: number;
    articleId: number;
    articleCode?: string;
    articleDescription?: string;
    warehouseId: number;
    warehouseName?: string;
    quantity: number;
    reason?: string;
    status: string; // e.g., "Pending", "Approved", "Rejected"
    createdDate: Date;
    createdBy?: string;
    processedDate?: Date;
    processedBy?: string;
    notes?: string;
}

// API Response wrapper
export interface ReturnsResponse {
    data: Return[];
    total: number;
    page: number;
    pageSize: number;
}

@Injectable({
    providedIn: 'root'
})
export class ReturnsService {
    // Fixed: environment.apiUrl already contains '/api' (http://localhost:5288/api)
    // So we just append the controller name without repeating '/api'
    private apiUrl = `${environment.apiUrl}/ReturnLines`;

    constructor(private http: HttpClient) { }

    /**
     * Get all returns with optional pagination
     * @param page Page number (default: 1)
     * @param pageSize Items per page (default: 10)
     */
    getReturns(page: number = 1, pageSize: number = 10): Observable<Return[]> {
        // Add excludeCompleted=true to match dashboard KPI filter (Status != 'Terminé')
        const url = `${this.apiUrl}?excludeCompleted=true&page=${page}&pageSize=${pageSize}`;
        return this.http.get<Return[]>(url)
            .pipe(
                retry(2), // Retry failed requests up to 2 times
                catchError(this.handleError)
            );
    }

    /**
     * Get a specific return by ID
     * @param id Return ID
     */
    getReturnById(id: number): Observable<Return> {
        return this.http.get<Return>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Une erreur est survenue lors de la communication avec le serveur.';

        if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            errorMessage = `Erreur: ${error.error.message}`;
        } else {
            // Backend error
            errorMessage = `Erreur ${error.status}: ${error.message}`;

            // Handle specific status codes
            switch (error.status) {
                case 403:
                    errorMessage = 'Accès refusé: vérifiez vos droits (rôle requis).';
                    break;
                case 404:
                    errorMessage = 'Ressource introuvable.';
                    break;
                case 500:
                    errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                    break;
                case 401:
                    errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
                    break;
            }
        }

        console.error('ReturnsService Error:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
    }
}
