import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WarehouseService } from './warehouse.service';

describe('WarehouseService', () => {
  let service: WarehouseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WarehouseService]
    });
    service = TestBed.inject(WarehouseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getWarehouses', () => {
    it('should return warehouses list', () => {
      const mockWarehouses = [
        { id: 1, name: 'Warehouse 1', description: 'Description 1', isActive: true },
        { id: 2, name: 'Warehouse 2', description: 'Description 2', isActive: false }
      ];

      service.getWarehouses().subscribe(warehouses => {
        expect(warehouses).toEqual(mockWarehouses);
        expect(warehouses.length).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:5288/api/Warehouses');
      expect(req.request.method).toBe('GET');
      req.flush(mockWarehouses);
    });

    it('should handle empty warehouses list', () => {
      service.getWarehouses().subscribe(warehouses => {
        expect(warehouses).toEqual([]);
        expect(warehouses.length).toBe(0);
      });

      const req = httpMock.expectOne('http://localhost:5288/api/Warehouses');
      req.flush([]);
    });
  });

  describe('createWarehouse', () => {
    it('should create a new warehouse', () => {
      const newWarehouse = { name: 'New Warehouse', description: 'New Description' };
      const mockResponse = { id: 3, ...newWarehouse, isActive: true };

      service.createWarehouse(newWarehouse).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:5288/api/Warehouses');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newWarehouse);
      req.flush(mockResponse);
    });

    it('should handle creation error', () => {
      const newWarehouse = { name: '', description: 'Invalid' };

      service.createWarehouse(newWarehouse).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('http://localhost:5288/api/Warehouses');
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateWarehouse', () => {
    it('should update an existing warehouse', () => {
      const warehouseId = 1;
      const updateData = { name: 'Updated Warehouse', description: 'Updated Description' };
      const mockResponse = { id: warehouseId, ...updateData, isActive: true };

      service.updateWarehouse(warehouseId, updateData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:5288/api/Warehouses/${warehouseId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('setActiveStatus', () => {
    it('should set warehouse active status to true', () => {
      const warehouseId = 1;
      const isActive = true;
      const mockResponse = { id: warehouseId, isActive: true };

      service.setActiveStatus(warehouseId, isActive).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:5288/api/Warehouses/${warehouseId}/set-active?value=true`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should set warehouse active status to false', () => {
      const warehouseId = 1;
      const isActive = false;
      const mockResponse = { id: warehouseId, isActive: false };

      service.setActiveStatus(warehouseId, isActive).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:5288/api/Warehouses/${warehouseId}/set-active?value=false`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });
});
