import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

    private baseUrl = `http://localhost:5288/api/Warehouses`; // Use environment variable for API URL


  constructor(private http: HttpClient) {}

  getWarehouses(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  createWarehouse(dto: { name: string; description: string }): Observable<any> {
    return this.http.post(this.baseUrl, dto);
  }

  updateWarehouse(id: number, dto: { name: string; description: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, dto);
  }

  setActiveStatus(id: number, value: boolean): Observable<any> {
    const params = { params: { value: value.toString() } } as const;
    return this.http.put(`${this.baseUrl}/${id}/set-active`, {}, params);
  }
}



