import { Observable, of, throwError } from 'rxjs';

// Mock data for testing
export const MOCK_WAREHOUSES = [
  { id: 1, name: 'Main Warehouse', description: 'Primary storage facility', isActive: true },
  { id: 2, name: 'Secondary Warehouse', description: 'Backup storage facility', isActive: false },
  { id: 3, name: 'Distribution Center', description: 'Shipping and distribution hub', isActive: true }
];

export const MOCK_ARTICLES = [
  { id: 1, codeProduit: 'ART001', designation: 'Article 1', companyId: 1 },
  { id: 2, codeProduit: 'ART002', designation: 'Article 2', companyId: 1 },
  { id: 3, codeProduit: 'ART003', designation: 'Article 3', companyId: 1 }
];

export const MOCK_PICKLISTS = [
  { id: 1, name: 'Picklist 1', type: 'Manual', quantity: '100', lineId: 1, warehouseId: 1, statusId: 1 },
  { id: 2, name: 'Picklist 2', type: 'Automatic', quantity: '200', lineId: 2, warehouseId: 2, statusId: 2 }
];

export const MOCK_USERS = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', matricule: 'EMP001' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', matricule: 'EMP002' }
];

// Mock Warehouse Service
export class MockWarehouseService {
  getWarehouses(): Observable<any[]> {
    return of(MOCK_WAREHOUSES);
  }

  createWarehouse(dto: { name: string; description: string }): Observable<any> {
    const newWarehouse = { id: 4, ...dto, isActive: true };
    return of(newWarehouse);
  }

  updateWarehouse(id: number, dto: { name: string; description: string }): Observable<any> {
    const updatedWarehouse = { id, ...dto, isActive: true };
    return of(updatedWarehouse);
  }

  setActiveStatus(id: number, value: boolean): Observable<any> {
    return of({ id, isActive: value });
  }

  // Error simulation methods
  getWarehousesWithError(): Observable<any[]> {
    return throwError(() => new Error('Network error'));
  }

  createWarehouseWithError(dto: { name: string; description: string }): Observable<any> {
    return throwError(() => new Error('Validation error'));
  }
}

// Mock Article Service
export class MockArticleService {
  getArticles(): Observable<any[]> {
    return of(MOCK_ARTICLES);
  }

  createArticle(dto: any): Observable<any> {
    const newArticle = { id: 4, ...dto };
    return of(newArticle);
  }

  updateArticle(id: number, dto: any): Observable<any> {
    const updatedArticle = { id, ...dto };
    return of(updatedArticle);
  }

  deleteArticle(id: number): Observable<any> {
    return of({ success: true });
  }
}

// Mock Picklist Service
export class MockPicklistService {
  getPicklists(): Observable<any[]> {
    return of(MOCK_PICKLISTS);
  }

  createPicklist(dto: any): Observable<any> {
    const newPicklist = { id: 3, ...dto };
    return of(newPicklist);
  }

  updatePicklist(id: number, dto: any): Observable<any> {
    const updatedPicklist = { id, ...dto };
    return of(updatedPicklist);
  }

  deletePicklist(id: number): Observable<any> {
    return of({ success: true });
  }
}

// Mock User Service
export class MockUserService {
  getUsers(): Observable<any[]> {
    return of(MOCK_USERS);
  }

  createUser(dto: any): Observable<any> {
    const newUser = { id: 3, ...dto };
    return of(newUser);
  }

  updateUser(id: number, dto: any): Observable<any> {
    const updatedUser = { id, ...dto };
    return of(updatedUser);
  }

  deleteUser(id: number): Observable<any> {
    return of({ success: true });
  }
}

// Mock HTTP Error responses
export const MOCK_ERROR_RESPONSES = {
  BAD_REQUEST: { status: 400, statusText: 'Bad Request' },
  UNAUTHORIZED: { status: 401, statusText: 'Unauthorized' },
  FORBIDDEN: { status: 403, statusText: 'Forbidden' },
  NOT_FOUND: { status: 404, statusText: 'Not Found' },
  INTERNAL_SERVER_ERROR: { status: 500, statusText: 'Internal Server Error' }
};

// Utility function to create mock HTTP errors
export function createMockHttpError(status: number, message: string = 'Error') {
  return throwError(() => ({
    status,
    statusText: message,
    error: { message }
  }));
}
