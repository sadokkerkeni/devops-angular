import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCompanyService } from 'app/core/services/base-company.service';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MagasinService extends BaseCompanyService {

  protected apiUrl = 'http://localhost:5288/api/Warehouses';

  constructor(http: HttpClient, authService: AuthService) {
    super(http, authService);
  }

  // Company-aware methods (inherited from BaseCompanyService)
  // - getAllByCompany(isActive?: boolean): Observable<any[]>
  // - getByIdAndCompany(id: number): Observable<any>
  // - createForCompany(dto: any): Observable<any>
  // - updateForCompany(id: number, dto: any): Observable<any>
  // - setActiveStatusForCompany(id: number, value: boolean): Observable<any>

  // Legacy aliases for backward compatibility
  getWarehouses(): Observable<any[]> {
    return this.getAllByCompany();
  }

  createWarehouse(dto: {
    name: string;
    description: string;
    email?: string;
    address?: string;
    phoneNumber?: string;
    fixedPhone?: string;
    latitude?: number;
    longitude?: number;
  }): Observable<any> {
    return this.createForCompany(dto);
  }

  updateWarehouse(id: number, dto: {
    name: string;
    description: string;
    email?: string;
    address?: string;
    phoneNumber?: string;
    fixedPhone?: string;
    latitude?: number;
    longitude?: number;
  }): Observable<any> {
    return this.updateForCompany(id, dto);
  }

  // Get locations by warehouse
  getLocationsByWarehouse(warehouseId: number, isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    return this.http.get<any[]>(`http://localhost:5288/api/Locations/by-warehouse/${warehouseId}`, {
      params
    });
  }

  setActiveStatus(id: number, value: boolean): Observable<any> {
    return this.setActiveStatusForCompany(id, value);
  }
}
