// src/app/services/inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseCompanyService } from 'app/core/services/base-company.service';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService extends BaseCompanyService {
  protected apiUrl = `http://localhost:5288/api/Inventories`; // Use environment variable for API URL

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
  getInventories(isActive: boolean | null): Observable<any[]> {
    return this.getAllByCompany(isActive); // 🏢 Use company-aware method
  }

  // GET /api/Inventories/{id}
  getInventoryById(id: number): Observable<any> { // Using any for simplicity
    return this.getByIdAndCompany(id); // 🏢 Use company-aware method
  }

  // POST /api/Inventories
  createInventory(inventory: any): Observable<any> { // Accept any object matching the API's expected structure
    return this.createForCompany(inventory); // 🏢 Use company-aware method
  }

  // PUT /api/Inventories/{id}
  updateInventory(id: number, updateDto: any): Observable<any> {
    return this.updateForCompany(id, updateDto); // 🏢 Use company-aware method
  }

  // PUT /api/Inventories/{id}/set-active?value=true/false
  setActive(id: number, value: boolean): Observable<any> {
    return this.setActiveStatusForCompany(id, value); // 🏢 Use company-aware method
  }
  getDetailInventoriesByInventoryId(inventoryId: number, isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    // Use company-aware DetailInventory service instead of direct HTTP call
    return this.http.get<any[]>(`http://localhost:5288/api/DetailInventories/by-inventory/${inventoryId}`, { params });
  }
  
  createDetailInventory(createDto: any): Observable<any> {
    // Use company-aware DetailInventory service instead of direct HTTP call
    const url = `http://localhost:5288/api/DetailInventories`;
    return this.http.post(url, createDto);
  }

  getLocations(isActive: boolean | null = true): Observable<any[]> {
    // Use company-aware Location service instead of direct HTTP call
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    const url = `http://localhost:5288/api/Locations`;
    console.log(`[InventoryService] GET ${url} avec isActive=${isActive}`);
    return this.http.get<any[]>(url, { params });
  }

  getSaps(isActive: boolean | null = true): Observable<any[]> {
    // Use company-aware Sap service instead of direct HTTP call
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    const url = `http://localhost:5288/api/Sap`;
    console.log(`[InventoryService] GET ${url} avec isActive=${isActive}`);
    return this.http.get<any[]>(url, { params });
  }

  
}
