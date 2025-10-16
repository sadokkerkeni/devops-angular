// src/app/core/services/article.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:5288/api/Articles'; // Base URL de votre API Articles

  constructor(private http: HttpClient) { }

  // GET: /api/Articles?isActive=true
  getAll(isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  // GET: /api/Articles/{id}
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // POST: /api/Articles
  create(dto: any): Observable<any> { // ArticleCreateDto
    return this.http.post<any>(this.apiUrl, dto);
  }

  // PUT: /api/Articles/{id}
  update(id: number, dto: any): Observable<any> { // ArticleUpdateDto
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }

  // PUT: /api/Articles/{id}/set-active?value=true/false
  setActiveStatus(id: number, value: boolean): Observable<any> {
    let params = new HttpParams();
    params = params.append('value', value.toString());
    return this.http.put(`${this.apiUrl}/${id}/set-active`, null, { params });
  }
}