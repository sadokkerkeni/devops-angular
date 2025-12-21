import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private apiUrl = 'http://localhost:5288/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Get all users (admin endpoint) - Company-aware
  getAllUsers(): Observable<any[]> {
    // Backend automatically filters by CompanyId from JWT token
    return this.http.get<any[]>(`${this.apiUrl}/users/admin-all`);
  }

  // Get user details by ID (admin endpoint) - Company-aware
  getUserDetails(id: number): Observable<any> {
    // Backend automatically filters by CompanyId from JWT token
    return this.http.get<any>(`${this.apiUrl}/users/admin-details/${id}`);
  }

  // Update user (admin endpoint)
  updateUser(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/admin-update/${id}`, payload);
  }

  // Toggle activation status
  toggleUserState(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/admin-toggle-state/${id}`, {});
  }

  // Get all roles - Company-aware
  getAllRoles(): Observable<any[]> {
    // Backend automatically filters by CompanyId from JWT token
    return this.http.get<any[]>(`${this.apiUrl}/Role`);
  }

  // Get roles assigned to a specific user
  getUserRoles(userId: number): Observable<any[]> {
    // Assuming there's an endpoint to get user roles
    // Based on the swagger, this might be a custom endpoint
    // If not available, you might need to filter from all user roles
    return this.http.get<any[]>(`${this.apiUrl}/UserRole`); // This might need adjustment
  }

  // Assign roles to a user - Company-aware
  assignRolesToUser(
    userId: number,
    request: { roleIds: number[]; assignedById: number; note: string }
  ): Observable<any> {
    // Backend automatically filters by CompanyId from JWT token
    const url = `${this.apiUrl}/users/admin-assign-roles/${userId}`;
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

  // 🏢 Invite user to company - Company-aware
  inviteUserToCompany(payload: { 
    firstName: string; 
    lastName: string; 
    matricule: string; 
    email: string; 
    password: string; 
    companyId: number;
    role: string;
  }): Observable<any> {
    // Use the correct endpoint for creating users in company
    return this.http.post(`${this.apiUrl}/users/admin-create`, payload);
  }

  // 🏢 Delete user from company - Company-aware
  deleteUserFromCompany(userId: number): Observable<any> {
    // Backend automatically filters by CompanyId from JWT token
    return this.http.delete(`${this.apiUrl}/users/admin-delete/${userId}`);
  }

  // Admin create user (company inferred from token) - DEPRECATED, use inviteUserToCompany instead
  adminCreateUser(payload: { firstName: string; lastName: string; matricule: string; email: string; password: string; }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/admin-create`, payload);
  }
}