// src/app/core/services/location.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:5288/api'; // Base URL de votre API

  constructor(private http: HttpClient) { }

  // GET: /api/Locations?isActive=true
  getLocations(isActive: boolean | null = true): Observable<any[]> {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
    return this.http.get<any[]>(`${this.apiUrl}/Locations`, { params });
  }

  // GET: /api/Locations/{id}
  getLocationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Locations/${id}`);
  }

  // POST: /api/Locations
  createLocation(location: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Locations`, location);
  }

  // PUT: /api/Locations/{id}
  updateLocation(id: number, location: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Locations/${id}`, location);
  }

  // PUT: /api/Locations/{id}/set-active?value=true/false
  setActiveStatus(id: number, value: boolean): Observable<any> {
    let params = new HttpParams();
    params = params.append('value', value.toString());
    // Empty body, params passed in options to match controller signature
    return this.http.put(`${this.apiUrl}/Locations/${id}/set-active`, {}, { params });
  }
  // location.service.ts



  getWarehouses(isActive: boolean | null = true) {
    let params = new HttpParams();
    if (isActive !== null) {
      params = params.append('isActive', isActive.toString());
    }
  return this.http.get<any[]>(`${this.apiUrl}/Warehouses`, { params });
}

}