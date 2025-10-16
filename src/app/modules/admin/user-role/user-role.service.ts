import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private apiUrl = 'http://localhost:5288/api';

  constructor(private http: HttpClient) { }

  // Get all users (admin endpoint)
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/admin-all`);
  }

  // Get user details by ID (admin endpoint)
  getUserDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/admin-details/${id}`);
  }

  // Get all roles
  getAllRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Role`);
  }

  // Get roles assigned to a specific user
  getUserRoles(userId: number): Observable<any[]> {
    // Assuming there's an endpoint to get user roles
    // Based on the swagger, this might be a custom endpoint
    // If not available, you might need to filter from all user roles
    return this.http.get<any[]>(`${this.apiUrl}/UserRole`); // This might need adjustment
  }

  // Assign roles to a user
 assignRolesToUser(
    userId: number,
    request: { roleIds: number[]; assignedById: number; note: string }
  ): Observable<any> {
    const url = `${this.apiUrl}/users/admin-assign-roles/${userId}`;
    // The request object already matches the structure of AssignRolesRequest
    // { roleIds: [...], assignedById: ..., note: ... }
    return this.http.post(url, request);
  }

  // Remove a role from a user
  removeRoleFromUser(userId: number, roleId: number): Observable<any> {
    // This would depend on your API endpoint structure
    // Example endpoint based on swagger: DELETE /api/UserRole/{userId}/{roleId}
    return this.http.delete(`${this.apiUrl}/UserRole/${userId}/${roleId}`);
  }

  // Companies (admin)
  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Company`);
  }

  // Admin create user (company inferred from token)
  adminCreateUser(payload: { firstName: string; lastName: string; matricule: string; email: string; password: string; }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/admin-create`, payload);
  }
}