// src/app/core/services/location.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseCompanyService } from 'app/core/services/base-company.service';
import { AuthService } from 'app/core/auth/auth.service';
import {
  ReturnLineReadDto,
  ReturnLineCreateDto,
  ReturnLineUpdateDto
} from './return.interfaces';

// Re-export interfaces for backward compatibility
export { ReturnLineReadDto, ReturnLineCreateDto, ReturnLineUpdateDto } from './return.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReturnService extends BaseCompanyService {

  protected apiUrl = 'http://localhost:5288/api/ReturnLines'; // Ajustez le port si nécessaire

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
  getAll(): Observable<ReturnLineReadDto[]> {
    return this.getAllByCompany(); // 🏢 Use company-aware method
  }

  getById(id: number): Observable<ReturnLineReadDto> {
    return this.getByIdAndCompany(id); // 🏢 Use company-aware method
  }

  create(dto: ReturnLineCreateDto): Observable<ReturnLineReadDto> {
    return this.createForCompany(dto); // 🏢 Use company-aware method
  }

  update(id: number, dto: ReturnLineUpdateDto): Observable<any> { // PUT souvent retourne 204 No Content
    return this.updateForCompany(id, dto); // 🏢 Use company-aware method
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Exemple : Mettre à jour le statut (alternatif à update)
  // setStatus(id: number, statusId: number): Observable<any> {
  //   const params = new HttpParams().set('statusId', statusId.toString());
  //   return this.http.put(`${this.apiUrl}/${id}/status`, {}, { params });
  // }


}
