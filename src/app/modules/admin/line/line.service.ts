import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { BaseCompanyService } from 'app/core/services/base-company.service';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LineService extends BaseCompanyService {
  protected apiUrl = 'http://localhost:5288/api/Lines';

  constructor(http: HttpClient, authService: AuthService) {
    super(http, authService);
  }

  // 🏢 Company-aware methods (inherited from BaseCompanyService)
  // - getAllByCompany(isActive?: boolean): Observable<any[]>
  // - getByIdAndCompany(id: number): Observable<any>
  // - createForCompany(dto: any): Observable<any>
  // - updateForCompany(id: number, dto: any): Observable<any>
  // - setActiveStatusForCompany(id: number, value: boolean): Observable<any>

  // Legacy methods for backward compatibility
  getAll(): Observable<any[]> {
    return from(
      Promise.all([
        this.getAllByCompany(true).toPromise(),
        this.getAllByCompany(false).toPromise()
      ]).then(([activeLines, inactiveLines]) => {
        return [...(activeLines || []), ...(inactiveLines || [])];
      }).catch(error => {
        throw error;
      })
    );
  }

  getById(id: number): Observable<any> {
    return this.getByIdAndCompany(id); // 🏢 Use company-aware method
  }

  create(line: any): Observable<any> {
    return this.createForCompany(line); // 🏢 Use company-aware method
  }

  update(id: number, line: any): Observable<void> {
    return this.updateForCompany(id, line); // 🏢 Use company-aware method
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setActive(id: number, active: boolean): Observable<void> {
    return this.setActiveStatusForCompany(id, active); // 🏢 Use company-aware method
  }

  assignPicklist(lineId: number, picklistId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${lineId}/picklists`, { picklistId });
  }
}