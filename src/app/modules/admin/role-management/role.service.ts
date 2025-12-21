import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateRoleRequest {
  name: string;
}

export interface UpdateRoleRequest {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:5288/api/Role';

  constructor(private http: HttpClient) {}

  // Get all roles - Company-aware (backend filters by CompanyId from JWT)
  getAllRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Get role by ID
  getRoleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Create a new role
  createRole(request: CreateRoleRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request);
  }

  // Update role name
  updateRole(id: number, request: UpdateRoleRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/update-role-name`, request);
  }

  // Delete a role
  deleteRole(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

