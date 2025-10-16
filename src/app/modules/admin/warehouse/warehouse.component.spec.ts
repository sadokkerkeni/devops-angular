import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { WarehouseComponent, CreateWarehouseDialogComponent, EditWarehouseDialogComponent } from './warehouse.component';
import { WarehouseService } from './warehouse.service';

describe('WarehouseComponent', () => {
  let component: WarehouseComponent;
  let fixture: ComponentFixture<WarehouseComponent>;
  let warehouseService: jasmine.SpyObj<WarehouseService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockWarehouses = [
    { id: 1, name: 'Warehouse 1', description: 'Description 1', isActive: true },
    { id: 2, name: 'Warehouse 2', description: 'Description 2', isActive: false },
    { id: 3, name: 'Warehouse 3', description: 'Description 3', isActive: true }
  ];

  beforeEach(async () => {
    const warehouseServiceSpy = jasmine.createSpyObj('WarehouseService', [
      'getWarehouses',
      'createWarehouse',
      'updateWarehouse',
      'setActiveStatus'
    ]);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        WarehouseComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: WarehouseService, useValue: warehouseServiceSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WarehouseComponent);
    component = fixture.componentInstance;
    warehouseService = TestBed.inject(WarehouseService) as jasmine.SpyObj<WarehouseService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadWarehouses on init', () => {
      spyOn(component, 'loadWarehouses');
      component.ngOnInit();
      expect(component.loadWarehouses).toHaveBeenCalled();
    });
  });

  describe('loadWarehouses', () => {
    it('should load warehouses and filter by active', () => {
      warehouseService.getWarehouses.and.returnValue(of(mockWarehouses));
      component.filterMode = 'active';

      component.loadWarehouses();

      expect(component.loading).toBeFalse();
      expect(component.warehouses).toEqual([
        { id: 1, name: 'Warehouse 1', description: 'Description 1', isActive: true },
        { id: 3, name: 'Warehouse 3', description: 'Description 3', isActive: true }
      ]);
    });

    it('should load warehouses and filter by inactive', () => {
      warehouseService.getWarehouses.and.returnValue(of(mockWarehouses));
      component.filterMode = 'inactive';

      component.loadWarehouses();

      expect(component.loading).toBeFalse();
      expect(component.warehouses).toEqual([
        { id: 2, name: 'Warehouse 2', description: 'Description 2', isActive: false }
      ]);
    });

    it('should load all warehouses when filter mode is all', () => {
      warehouseService.getWarehouses.and.returnValue(of(mockWarehouses));
      component.filterMode = 'all';

      component.loadWarehouses();

      expect(component.loading).toBeFalse();
      expect(component.warehouses).toEqual(mockWarehouses);
    });

    it('should handle error when loading warehouses fails', () => {
      warehouseService.getWarehouses.and.returnValue(throwError(() => new Error('Network error')));
      spyOn(component['_snackBar'], 'open');

      component.loadWarehouses();

      expect(component.loading).toBeFalse();
      expect(component['_snackBar'].open).toHaveBeenCalledWith(
        'Erreur lors du chargement des magasins.',
        'Erreur',
        { duration: 5000 }
      );
    });
  });

  describe('cycleFilterMode', () => {
    it('should cycle from active to inactive', () => {
      component.filterMode = 'active';
      spyOn(component, 'loadWarehouses');

      component.cycleFilterMode();

      expect(component.filterMode).toBe('inactive');
      expect(component.loadWarehouses).toHaveBeenCalled();
    });

    it('should cycle from inactive to all', () => {
      component.filterMode = 'inactive';
      spyOn(component, 'loadWarehouses');

      component.cycleFilterMode();

      expect(component.filterMode).toBe('all');
      expect(component.loadWarehouses).toHaveBeenCalled();
    });

    it('should cycle from all to active', () => {
      component.filterMode = 'all';
      spyOn(component, 'loadWarehouses');

      component.cycleFilterMode();

      expect(component.filterMode).toBe('active');
      expect(component.loadWarehouses).toHaveBeenCalled();
    });
  });

  describe('onCreate', () => {
    it('should open create dialog and reload warehouses on success', () => {
      const mockDialogRef = {
        afterClosed: () => of('created')
      };
      dialog.open.and.returnValue(mockDialogRef as any);
      spyOn(component, 'loadWarehouses');
      spyOn(component['_snackBar'], 'open');

      component.onCreate();

      expect(dialog.open).toHaveBeenCalledWith(CreateWarehouseDialogComponent, { width: '400px' });
      expect(component.loadWarehouses).toHaveBeenCalled();
      expect(component['_snackBar'].open).toHaveBeenCalledWith(
        'Magasin créé avec succès.',
        '',
        { duration: 3000 }
      );
    });

    it('should not reload warehouses if dialog is cancelled', () => {
      const mockDialogRef = {
        afterClosed: () => of(null)
      };
      dialog.open.and.returnValue(mockDialogRef as any);
      spyOn(component, 'loadWarehouses');

      component.onCreate();

      expect(dialog.open).toHaveBeenCalledWith(CreateWarehouseDialogComponent, { width: '400px' });
      expect(component.loadWarehouses).not.toHaveBeenCalled();
    });
  });

  describe('onEdit', () => {
    it('should open edit dialog and reload warehouses on success', () => {
      const mockWarehouse = { id: 1, name: 'Test Warehouse', description: 'Test Description' };
      const mockDialogRef = {
        afterClosed: () => of('updated')
      };
      dialog.open.and.returnValue(mockDialogRef as any);
      spyOn(component, 'loadWarehouses');
      spyOn(component['_snackBar'], 'open');

      component.onEdit(mockWarehouse);

      expect(dialog.open).toHaveBeenCalledWith(EditWarehouseDialogComponent, {
        width: '400px',
        data: mockWarehouse
      });
      expect(component.loadWarehouses).toHaveBeenCalled();
      expect(component['_snackBar'].open).toHaveBeenCalledWith(
        'Magasin mis à jour.',
        '',
        { duration: 3000 }
      );
    });
  });

  describe('toggleActivation', () => {
    it('should toggle warehouse from active to inactive', () => {
      const mockWarehouse = { id: 1, name: 'Test Warehouse', isActive: true };
      warehouseService.setActiveStatus.and.returnValue(of({}));
      spyOn(component['_snackBar'], 'open');

      component.toggleActivation(mockWarehouse);

      expect(warehouseService.setActiveStatus).toHaveBeenCalledWith(1, false);
      expect(mockWarehouse.isActive).toBeFalse();
      expect(component['_snackBar'].open).toHaveBeenCalledWith(
        'Magasin désactivé avec succès.',
        '',
        { duration: 3000 }
      );
    });

    it('should toggle warehouse from inactive to active', () => {
      const mockWarehouse = { id: 1, name: 'Test Warehouse', isActive: false };
      warehouseService.setActiveStatus.and.returnValue(of({}));
      spyOn(component['_snackBar'], 'open');

      component.toggleActivation(mockWarehouse);

      expect(warehouseService.setActiveStatus).toHaveBeenCalledWith(1, true);
      expect(mockWarehouse.isActive).toBeTrue();
      expect(component['_snackBar'].open).toHaveBeenCalledWith(
        'Magasin activé avec succès.',
        '',
        { duration: 3000 }
      );
    });

    it('should handle error when toggle activation fails', () => {
      const mockWarehouse = { id: 1, name: 'Test Warehouse', isActive: true };
      warehouseService.setActiveStatus.and.returnValue(throwError(() => new Error('Network error')));
      spyOn(component['_snackBar'], 'open');

      component.toggleActivation(mockWarehouse);

      expect(component['_snackBar'].open).toHaveBeenCalledWith(
        'Erreur lors de la mise à jour de l\'état.',
        'Erreur',
        { duration: 5000 }
      );
    });
  });

  describe('trackById', () => {
    it('should return item id when available', () => {
      const item = { id: 123, name: 'Test' };
      const result = component.trackById(0, item);
      expect(result).toBe(123);
    });

    it('should return index when item id is not available', () => {
      const item = { name: 'Test' };
      const result = component.trackById(5, item);
      expect(result).toBe(5);
    });
  });
});
