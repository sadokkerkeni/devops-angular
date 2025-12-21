import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { WarehouseService } from './warehouse.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { CommonModule, NgIf, NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MapPickerComponent } from 'app/shared/components/map-picker/map-picker.component';

@Component({
  selector: 'app-warehouse',
  standalone: true,
  imports: [
    CommonModule, NgIf, NgFor, MatButtonModule, MatIconModule, MatCardModule, 
    MatSnackBarModule, MatDialogModule, MatFormFieldModule, FormsModule, 
    MatTooltipModule, MatInputModule, MatProgressSpinnerModule, MatChipsModule,
    MatPaginatorModule, MatSlideToggleModule
  ],
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WarehouseComponent implements OnInit, OnDestroy {
  warehouses: any[] = [];
  displayedWarehouses: any[] = [];
  loading = false;
  
  // Search & Filters
  searchQuery: string = '';
  selectedStatusFilters: string[] = ['active']; // active, inactive
  availableStatuses = [
    { value: 'active', label: 'Actifs', color: '#10b981' },
    { value: 'inactive', label: 'Inactifs', color: '#6b7280' }
  ];
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];
  
  // Sorting
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Action loading states
  actionLoading: { [key: number]: boolean } = {};

  private destroy$ = new Subject<void>();

  constructor(
    private _snackBar: MatSnackBar,
    private WarehouseService: WarehouseService,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSavedFilters();
    this.loadWarehouses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
   /**
     * TrackBy to optimize ngFor rendering in the template
     */
    trackById(index: number, item: any): number | string {
        return item?.id ?? index;
    }

  /**
   * Normalize warehouse data - ensure strings are not arrays
   */
  private normalizeWarehouseData(w: any): any {
    // Ensure name is a string, not an array
    let name = w.name;
    if (Array.isArray(name)) {
      name = name.join('');
    }
    name = String(name || '').trim() || 'Sans nom';
    
    // Ensure description is a string, not an array
    let description = w.description;
    if (Array.isArray(description)) {
      description = description.join('');
    }
    description = String(description || '').trim() || 'Aucune description';
    
    return {
      ...w,
      id: w.id,
      name: name,
      description: description,
      isActive: w.isActive !== undefined ? Boolean(w.isActive) : true
    };
  }

  loadWarehouses(): void {
    this.loading = true;
    // 🏢 Load all warehouses and filter client-side for better performance
    this.WarehouseService.getAllByCompany(null)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('[WarehouseComponent] Loaded warehouses:', data);
          // Clean and normalize data using the same normalization function
          this.warehouses = (data || []).map((w: any) => this.normalizeWarehouseData(w));
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading warehouses:', err);
          this._snackBar.open('❌ Erreur lors du chargement des magasins', 'Fermer', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
          this.warehouses = [];
          this.displayedWarehouses = [];
        },
      });
  }

  // ============================================
  // FILTERING & SEARCH
  // ============================================
  
  applyFilters(): void {
    let filtered = [...this.warehouses];

    // Apply status filters (chips)
    if (this.selectedStatusFilters.length > 0) {
      filtered = filtered.filter(w => {
        if (this.selectedStatusFilters.includes('active') && w.isActive) return true;
        if (this.selectedStatusFilters.includes('inactive') && !w.isActive) return true;
        return false;
      });
    }

    // Apply search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(w => {
        const nameMatch = String(w.name || '').toLowerCase().includes(query);
        const descMatch = String(w.description || '').toLowerCase().includes(query);
        const addressMatch = String(w.address || '').toLowerCase().includes(query);
        return nameMatch || descMatch || addressMatch;
      });
    }

    // Apply sorting
    filtered = this.sortWarehouses(filtered);

    this.displayedWarehouses = filtered;
    this.currentPage = 0; // Reset to first page when filters change
    this.saveFiltersToStorage();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatusFilters = ['active'];
    this.sortColumn = 'name';
    this.sortDirection = 'asc';
    this.currentPage = 0;
    this.applyFilters();
    this._snackBar.open('🔄 Filtres réinitialisés', '', { 
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  toggleStatusFilter(status: string): void {
    const index = this.selectedStatusFilters.indexOf(status);
    if (index > -1) {
      this.selectedStatusFilters.splice(index, 1);
    } else {
      this.selectedStatusFilters.push(status);
    }
    this.applyFilters();
  }

  isStatusSelected(status: string): boolean {
    return this.selectedStatusFilters.includes(status);
  }

  hasActiveFilters(): boolean {
    return this.searchQuery.trim() !== '' || 
           this.selectedStatusFilters.length !== 1 ||
           !this.selectedStatusFilters.includes('active');
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    if (this.selectedStatusFilters.length !== 1 || !this.selectedStatusFilters.includes('active')) count++;
    return count;
  }

  // ============================================
  // SORTING
  // ============================================
  
  onSortChange(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  sortWarehouses(warehouses: any[]): any[] {
    return [...warehouses].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortColumn) {
        case 'name':
          valueA = String(a.name || '').toLowerCase();
          valueB = String(b.name || '').toLowerCase();
          break;
        case 'description':
          valueA = String(a.description || '').toLowerCase();
          valueB = String(b.description || '').toLowerCase();
          break;
        case 'isActive':
          valueA = a.isActive ? 1 : 0;
          valueB = b.isActive ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'unfold_more';
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  // ============================================
  // PAGINATION
  // ============================================
  
  paginatedWarehouses(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.displayedWarehouses.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.saveFiltersToStorage();
  }

  // ============================================
  // PERSISTENCE (localStorage)
  // ============================================
  
  saveFiltersToStorage(): void {
    const filters = {
      searchQuery: this.searchQuery,
      selectedStatusFilters: this.selectedStatusFilters,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
      pageSize: this.pageSize,
      currentPage: this.currentPage
    };
    localStorage.setItem('warehouse_filters', JSON.stringify(filters));
  }

  loadSavedFilters(): void {
    const saved = localStorage.getItem('warehouse_filters');
    if (saved) {
      try {
        const filters = JSON.parse(saved);
        this.searchQuery = filters.searchQuery || '';
        this.selectedStatusFilters = filters.selectedStatusFilters || ['active'];
        this.sortColumn = filters.sortColumn || 'name';
        this.sortDirection = filters.sortDirection || 'asc';
        this.pageSize = filters.pageSize || 12;
        this.currentPage = 0; // Always start at page 0
      } catch (e) {
        console.error('Error loading saved filters:', e);
      }
    }
  }

  toggleActivation(warehouse: any): void {
    const newStatus = !warehouse.isActive;
    const oldStatus = warehouse.isActive;
    
    // Set loading state
    this.actionLoading[warehouse.id] = true;
    
    // Optimistic update - update UI immediately
    warehouse.isActive = newStatus;
    
    // 🏢 Use company-aware method
    this.WarehouseService.setActiveStatusForCompany(warehouse.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.actionLoading[warehouse.id] = false;
          this._snackBar.open(
            `✅ Magasin ${newStatus ? 'activé' : 'désactivé'} avec succès`, 
            '', 
            { 
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            }
          );
          // Reapply filters to update the displayed list
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error toggling activation:', err);
          this.actionLoading[warehouse.id] = false;
          // Revert optimistic update on error
          warehouse.isActive = oldStatus;
          this._snackBar.open(
            '❌ Erreur lors de la mise à jour du statut', 
            'Réessayer', 
            { 
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            }
          ).onAction().subscribe(() => {
            this.toggleActivation(warehouse);
          });
        }
      });
  }

  onEdit(warehouse: any): void {
    const dialogRef = this._dialog.open(EditWarehouseDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'warehouse-dialog',
      data: warehouse
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this._snackBar.open('✅ Magasin mis à jour avec succès', '', { 
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.loadWarehouses();
      }
    });
  }

  onCreate(): void {
    const dialogRef = this._dialog.open(CreateWarehouseDialogComponent, { 
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'warehouse-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'created') {
        this._snackBar.open('✅ Magasin créé avec succès', '', { 
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.loadWarehouses();
      }
    });
  }
}













@Component({
  selector: 'app-create-warehouse-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatCardModule, MatDialogModule, MatIconModule, MapPickerComponent],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="dialog-title-icon">store</mat-icon>
      Créer un nouveau magasin
    </h2>
    <mat-dialog-content class="dialog-content">
      <form class="warehouse-form">
        <!-- Basic Info Section -->
        <div class="form-section">
          <h3 class="section-title">
            <mat-icon>info</mat-icon>
            Informations générales
          </h3>
          <mat-form-field class="full-width field-with-icon field-standard" appearance="outline">
            <mat-label>Nom du magasin</mat-label>
            <mat-icon matPrefix>store</mat-icon>
            <input matInput [(ngModel)]="name" name="name" required />
          </mat-form-field>
          <mat-form-field class="full-width field-with-icon field-standard textarea-field" appearance="outline">
            <mat-label>Description du magasin</mat-label>
            <mat-icon matPrefix>description</mat-icon>
            <textarea matInput [(ngModel)]="description" name="description" rows="3" placeholder=""></textarea>
          </mat-form-field>
        </div>

        <!-- Location Section -->
        <div class="form-section">
          <h3 class="section-title">
            <mat-icon>place</mat-icon>
            Emplacement
          </h3>
          <!-- Map Picker -->
          <app-map-picker
            [height]="'300px'"
            [initialLatitude]="36.8065"
            [initialLongitude]="10.1815"
            [initialZoom]="12"
            (locationSelected)="onLocationSelected($event)">
          </app-map-picker>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="dialogRef.close()" class="cancel-btn">
        <mat-icon>close</mat-icon>
        Annuler
      </button>
      <button mat-flat-button color="primary" (click)="create()" [disabled]="!name" class="create-btn">
        <mat-icon>add</mat-icon>
        Créer le magasin
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 20px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .dialog-title-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    .dialog-content {
      padding: 24px !important;
      max-height: 70vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .mat-mdc-form-field {
        width: 100%;
        max-width: 100%;
      }

      app-map-picker {
        display: block;
        width: 100%;
        max-width: 100%;
      }
    }
    
    .warehouse-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .section-title mat-icon {
      color: #6366f1;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .full-width {
      width: 100%;
    }

    .field-standard {
      ::ng-deep .mat-mdc-text-field-wrapper {
        min-height: 52px;
        background: #ffffff;
        border-radius: 12px;
      }
      ::ng-deep .mat-mdc-form-field-flex {
        align-items: center;
      }
      ::ng-deep .mat-mdc-input-element {
        padding-top: 10px;
        padding-bottom: 10px;
        line-height: 1.4;
        word-break: break-word;
      }
    }

    .field-with-icon {
      ::ng-deep .mat-mdc-form-field-icon-prefix {
        align-items: flex-start;
        padding-top: 6px;
      }
    }

    .textarea-field {
      ::ng-deep .mat-mdc-text-field-wrapper {
        min-height: 110px;
        align-items: flex-start;
      }
      ::ng-deep .mat-mdc-form-field-flex {
        align-items: flex-start;
      }
      ::ng-deep .mat-mdc-text-field-infix {
        padding-top: 8px;
        padding-bottom: 10px;
        align-items: flex-start;
      }
      textarea.mat-mdc-input-element {
        min-height: 96px;
        line-height: 1.4;
        padding-top: 10px;
        padding-bottom: 10px;
        box-sizing: border-box;
        overflow: auto;
        resize: vertical;
        word-break: break-word;
        white-space: pre-wrap;
        vertical-align: top;
        display: block;
      }
    }
    
    .dialog-actions {
      padding: 16px 24px !important;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      gap: 12px;
    }
    
    .cancel-btn {
      color: #6b7280;
    }
    
    .create-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .cancel-btn mat-icon,
    .create-btn mat-icon {
      margin-right: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `],
})
export class CreateWarehouseDialogComponent {
  name = '';
  description = '';
  address = '';
  latitude: number | null = null;
  longitude: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<CreateWarehouseDialogComponent>,
    private warehouseService: WarehouseService,
    private _snackBar: MatSnackBar
  ) {}

  onLocationSelected(location: any): void {
    this.latitude = location.latitude;
    this.longitude = location.longitude;
    this.address = location.address || '';
  }

  create(): void {
    const dto = {
      name: this.name,
      description: this.description,
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude
    };
    
    // 🏢 Use company-aware method
    this.warehouseService.createForCompany(dto).subscribe({
      next: () => {
        this.dialogRef.close('created');
      },
      error: () => {
        this._snackBar.open('Erreur lors de la création du magasin.', 'Erreur', { duration: 3000 });
      }
    });
  }
}









@Component({
  selector: 'app-edit-warehouse-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDialogModule, MatIconModule, MapPickerComponent],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="dialog-title-icon">edit</mat-icon>
      Modifier le magasin
    </h2>
    <mat-dialog-content class="dialog-content">
      <form class="warehouse-form">
        <!-- Basic Info Section -->
        <div class="form-section">
          <h3 class="section-title">
            <mat-icon>info</mat-icon>
            Informations générales
          </h3>
          <mat-form-field class="full-width field-with-icon field-standard" appearance="outline">
            <mat-label>Nom du magasin</mat-label>
            <mat-icon matPrefix>store</mat-icon>
            <input matInput [(ngModel)]="name" name="name" required />
          </mat-form-field>
          <mat-form-field class="full-width field-with-icon field-standard textarea-field" appearance="outline">
            <mat-label>Description du magasin</mat-label>
            <mat-icon matPrefix>description</mat-icon>
            <textarea matInput [(ngModel)]="description" name="description" rows="3" placeholder=""></textarea>
          </mat-form-field>
        </div>

        <!-- Location Section -->
        <div class="form-section">
          <h3 class="section-title">
            <mat-icon>place</mat-icon>
            Emplacement
          </h3>
          <!-- Map Picker -->
          <app-map-picker
            [height]="'300px'"
            [initialLatitude]="latitude || 36.8065"
            [initialLongitude]="longitude || 10.1815"
            [initialZoom]="latitude ? 16 : 12"
            (locationSelected)="onLocationSelected($event)">
          </app-map-picker>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="dialogRef.close()" class="cancel-btn">
        <mat-icon>close</mat-icon>
        Annuler
      </button>
      <button mat-flat-button color="primary" (click)="update()" [disabled]="!name" class="update-btn">
        <mat-icon>save</mat-icon>
        Mettre à jour
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 20px 24px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .dialog-title-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    .dialog-content {
      padding: 24px !important;
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .warehouse-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .section-title mat-icon {
      color: #10b981;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .dialog-actions {
      padding: 16px 24px !important;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      gap: 12px;
    }
    
    .cancel-btn {
      color: #6b7280;
    }
    
    .update-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .cancel-btn mat-icon,
    .update-btn mat-icon {
      margin-right: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `],
})
export class EditWarehouseDialogComponent {
  name: string;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;

  constructor(
    public dialogRef: MatDialogRef<EditWarehouseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private warehouseService: WarehouseService,
    private _snackBar: MatSnackBar
  ) {
    this.name = data.name;
    this.description = data.description;
    this.address = data.address || '';
    this.latitude = data.latitude || null;
    this.longitude = data.longitude || null;
  }

  onLocationSelected(location: any): void {
    this.latitude = location.latitude;
    this.longitude = location.longitude;
    this.address = location.address || '';
  }

  update(): void {
    const dto = {
      name: this.name,
      description: this.description,
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude
    };
    
    // 🏢 Use company-aware method
    this.warehouseService.updateForCompany(this.data.id, dto).subscribe({
      next: () => {
        this.dialogRef.close('updated');
      },
      error: () => {
        this._snackBar.open('Erreur lors de la mise à jour du magasin.', 'Erreur', { duration: 3000 });
      }
    });
  }
}







