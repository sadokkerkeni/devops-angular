import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseCompanyService {
  protected abstract apiUrl: string;

  constructor(
    protected http: HttpClient,
    protected authService: AuthService
  ) {}

  /**
   * Get CompanyId from JWT token
   */
  protected getCompanyId(): number | null {
    return this.authService.getCompanyId();
  }

  /**
   * Get all items for the current company
   * Note: Backend automatically filters by CompanyId from JWT token
   */
  getAllByCompany(isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    // Backend automatically uses CompanyId from JWT token
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  /**
   * Get item by ID and company
   * Note: Backend automatically filters by CompanyId from JWT token
   */
  getByIdAndCompany(id: number): Observable<any> {
    // Backend automatically uses CompanyId from JWT token
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create item for current company
   * Note: Backend automatically uses CompanyId from JWT token
   */
  createForCompany(dto: any): Observable<any> {
    // Backend automatically uses CompanyId from JWT token
    return this.http.post<any>(this.apiUrl, dto);
  }

  /**
   * Update item for current company
   * Note: Backend automatically uses CompanyId from JWT token
   */
  updateForCompany(id: number, dto: any): Observable<any> {
    // Backend automatically uses CompanyId from JWT token
    return this.http.put<any>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Set active status for company item
   * Note: Backend automatically uses CompanyId from JWT token
   */
  setActiveStatusForCompany(id: number, value: boolean): Observable<any> {
    let params = new HttpParams();
    params = params.append('value', value.toString());
    // Backend automatically uses CompanyId from JWT token
    return this.http.put(`${this.apiUrl}/${id}/set-active`, null, { params });
  }
}
