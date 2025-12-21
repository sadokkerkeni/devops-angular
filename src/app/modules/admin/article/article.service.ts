// src/app/modules/admin/article/article.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseCompanyService } from 'app/core/services/base-company.service';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ArticleService extends BaseCompanyService {
  protected apiUrl = 'http://localhost:5288/api/Articles'; // Base URL de votre API Articles

  constructor(http: HttpClient, authService: AuthService) {
    super(http, authService);
  }

  // 🏢 Company-aware methods (inherited from BaseCompanyService)
  // - getAllByCompany(isActive?: boolean): Observable<any[]>
  // - getByIdAndCompany(id: number): Observable<any>
  // - setActiveStatusForCompany(id: number, value: boolean): Observable<any>

  // Override createForCompany to handle FormData
  override createForCompany(dto: any): Observable<any> {
    const formData = this.buildFormData(dto);
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Override updateForCompany to handle FormData
  override updateForCompany(id: number, dto: any): Observable<any> {
    const formData = this.buildFormData(dto);
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  private buildFormData(dto: any): FormData {
    const formData = new FormData();
    
    // Add all non-file fields
    Object.keys(dto).forEach(key => {
      if (key !== 'photo' && dto[key] !== null && dto[key] !== undefined) {
        formData.append(key, dto[key]);
      }
    });

    // Add photo file if present
    if (dto.photo) {
      formData.append('photo', dto.photo, dto.photo.name);
    }

    return formData;
  }

  // Legacy methods for backward compatibility (if needed)
  getAll(isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto);
  }

  update(id: number, dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  setActiveStatus(id: number, value: boolean): Observable<any> {
    let params = new HttpParams();
    params = params.append('value', value.toString());
    return this.http.put(`${this.apiUrl}/${id}/set-active`, null, { params });
  }
}