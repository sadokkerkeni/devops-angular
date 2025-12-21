import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MagasinService } from './magasin.service';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MapPickerComponent } from 'app/shared/components/map-picker/map-picker.component';
import { PaginationComponent, PaginationEvent } from 'app/shared/components/pagination/pagination.component';

@Component({
    selector: 'app-magasin',
    standalone: true,
    imports: [
        CommonModule, NgIf, NgFor, MatButtonModule, MatIconModule, MatCardModule,
        MatSnackBarModule, MatDialogModule, MatFormFieldModule, FormsModule,
        MatTooltipModule, MatInputModule, MatProgressSpinnerModule, MatChipsModule,
        MatSlideToggleModule, PaginationComponent
    ],
    templateUrl: './magasin.component.html',
    styleUrls: ['./magasin.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MagasinComponent implements OnInit, OnDestroy {
    warehouses: any[] = [];
    displayedWarehouses: any[] = [];
    loading = false;

    // Search & Filters
    searchQuery: string = '';
    selectedStatusFilter: 'active' | 'inactive' | 'all' = 'active';
    availableStatuses = [
        { value: 'active', label: 'Actifs', description: 'Magasins ouverts' },
        { value: 'inactive', label: 'Inactifs', description: 'Magasins désactivés' },
        { value: 'all', label: 'Tous', description: 'Tout afficher' }
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
        private _magasinService: MagasinService,
        private _dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadSavedFilters();
        this.loadWarehouses();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    trackById(index: number, item: any): number | string {
        return item?.id ?? index;
    }

    private normalizeWarehouseData(w: any): any {
        let name = w.name;
        if (Array.isArray(name)) {
            name = name.join('');
        }
        name = String(name || '').trim() || 'Sans nom';

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
        this._magasinService.getAllByCompany(null)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
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
                },
            });
    }

    applyFilters(): void {
        let filtered = [...this.warehouses];

        if (this.selectedStatusFilter !== 'all') {
            filtered = filtered.filter(w => this.selectedStatusFilter === 'active' ? w.isActive : !w.isActive);
        }

        if (this.searchQuery && this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(w => {
                const nameMatch = String(w.name || '').toLowerCase().includes(query);
                const descMatch = String(w.description || '').toLowerCase().includes(query);
                const addressMatch = String(w.address || '').toLowerCase().includes(query);
                return nameMatch || descMatch || addressMatch;
            });
        }

        filtered = this.sortWarehouses(filtered);
        this.displayedWarehouses = filtered;
        this.currentPage = 0;
        this.saveFiltersToStorage();
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.applyFilters();
    }

    resetFilters(): void {
        this.searchQuery = '';
        this.selectedStatusFilter = 'active';
        this.sortColumn = 'name';
        this.sortDirection = 'asc';
        this.currentPage = 0;
        this.applyFilters();
        this._snackBar.open('🔄 Filtres réinitialisés', '', {
            duration: 2000,
            panelClass: ['success-snackbar']
        });
    }

    toggleStatusFilter(status: 'active' | 'inactive' | 'all'): void {
        if (this.selectedStatusFilter === status) {
            return;
        }
        this.selectedStatusFilter = status;
        this.applyFilters();
    }

    isStatusSelected(status: string): boolean {
        return this.selectedStatusFilter === status;
    }

    hasActiveFilters(): boolean {
        return this.searchQuery.trim() !== '' ||
            this.selectedStatusFilter !== 'active';
    }

    getActiveFiltersCount(): number {
        let count = 0;
        if (this.searchQuery.trim()) count++;
        if (this.selectedStatusFilter !== 'active') count++;
        return count;
    }

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

    paginatedWarehouses(): any[] {
        const startIndex = this.currentPage * this.pageSize;
        return this.displayedWarehouses.slice(startIndex, startIndex + this.pageSize);
    }

    onPageChange(event: PaginationEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.saveFiltersToStorage();
    }

    saveFiltersToStorage(): void {
        const filters = {
            searchQuery: this.searchQuery,
            selectedStatusFilter: this.selectedStatusFilter,
            sortColumn: this.sortColumn,
            sortDirection: this.sortDirection,
            pageSize: this.pageSize,
            currentPage: this.currentPage
        };
        localStorage.setItem('magasin_filters', JSON.stringify(filters));
    }

    loadSavedFilters(): void {
        const saved = localStorage.getItem('magasin_filters');
        if (saved) {
            try {
                const filters = JSON.parse(saved);
                this.searchQuery = filters.searchQuery || '';
                this.selectedStatusFilter = filters.selectedStatusFilter || 'active';
                this.sortColumn = filters.sortColumn || 'name';
                this.sortDirection = filters.sortDirection || 'asc';
                this.pageSize = filters.pageSize || 12;
                this.currentPage = 0;
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
        this._magasinService.setActiveStatusForCompany(warehouse.id, newStatus)
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
        const dialogRef = this._dialog.open(EditMagasinDialogComponent, {
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
        const dialogRef = this._dialog.open(CreateMagasinDialogComponent, {
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
    selector: 'app-create-magasin-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatCardModule, MatDialogModule, MatIconModule, MapPickerComponent],
    template: `
    <h2 mat-dialog-title class="dialog-header">
      <mat-icon class="dialog-title-icon store-header-icon">store</mat-icon>
      Créer un nouveau magasin
    </h2>
    <mat-dialog-content class="dialog-content">
      <form class="warehouse-form">
        <div class="form-section">
          <h3 class="section-title"><mat-icon>info</mat-icon> Informations générales</h3>
          <mat-form-field class="full-width store-name-field" appearance="outline">
            <mat-label>Nom du magasin</mat-label>
            <mat-icon matPrefix>store</mat-icon>
            <input matInput [(ngModel)]="name" name="name" required />
          </mat-form-field>
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Description du magasin</mat-label>
            <mat-icon matPrefix>description</mat-icon>
            <textarea matInput [(ngModel)]="description" name="description" rows="3" spellcheck="false" lang="fr"></textarea>
          </mat-form-field>
        </div>
        <div class="form-section">
          <h3 class="section-title"><mat-icon>place</mat-icon> Emplacement</h3>
          <app-map-picker [height]="'300px'" [initialLatitude]="36.8065" [initialLongitude]="10.1815" [initialZoom]="12" (locationSelected)="onLocationSelected($event)"></app-map-picker>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="dialogRef.close()" class="cancel-btn"><mat-icon>close</mat-icon> Annuler</button>
      <button mat-flat-button color="primary" (click)="create()" [disabled]="!name" class="create-btn"><mat-icon>add</mat-icon> Créer</button>
    </mat-dialog-actions>
  `,
    styles: [`
    :host { display: block; --warehouse-label-color: var(--mdc-theme-text-secondary-on-background, rgba(0,0,0,0.6)); }
    .dialog-header { display: flex; align-items: center; gap: 12px; margin: 0; padding: 20px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .dialog-header .store-header-icon { color: #fff; }
    .dialog-content { padding: 24px !important; display: flex; flex-direction: column; gap: 20px; }
    .full-width { width: 100%; }
    :host ::ng-deep .store-name-field .mdc-floating-label,
    :host ::ng-deep .store-name-field .mdc-floating-label--float-above,
    :host ::ng-deep .store-name-field .mat-mdc-floating-label,
    :host ::ng-deep .store-name-field .mat-mdc-floating-label.mdc-floating-label--float-above { color: var(--warehouse-label-color); }
    :host ::ng-deep .store-name-field.mat-mdc-form-field-invalid .mdc-floating-label,
    :host ::ng-deep .store-name-field.mat-mdc-form-field-invalid .mdc-floating-label--float-above,
    :host ::ng-deep .store-name-field.mat-mdc-form-field-invalid .mat-mdc-floating-label,
    :host ::ng-deep .store-name-field .mdc-text-field--invalid .mdc-floating-label,
    :host ::ng-deep .store-name-field .mdc-text-field--invalid .mdc-floating-label--float-above { color: var(--warehouse-label-color); }
    .dialog-actions { padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  `],
})
export class CreateMagasinDialogComponent {
    name = ''; description = ''; address = ''; latitude: number | null = null; longitude: number | null = null;
    constructor(public dialogRef: MatDialogRef<CreateMagasinDialogComponent>, private _magasinService: MagasinService, private _snackBar: MatSnackBar) { }
    onLocationSelected(l: any) { this.latitude = l.latitude; this.longitude = l.longitude; this.address = l.address || ''; }
    create() {
        this._magasinService.createForCompany({ name: this.name, description: this.description, address: this.address, latitude: this.latitude, longitude: this.longitude }).subscribe({
            next: () => this.dialogRef.close('created'),
            error: () => this._snackBar.open('Erreur création', 'Erreur', { duration: 3000 })
        });
    }
}

@Component({
    selector: 'app-edit-magasin-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatDialogModule, MatIconModule, MapPickerComponent],
    template: `
    <h2 mat-dialog-title class="dialog-header">
      <mat-icon class="dialog-title-icon">edit</mat-icon> Modifier le magasin
    </h2>
    <mat-dialog-content class="dialog-content">
      <form class="warehouse-form">
        <div class="form-section">
          <h3 class="section-title"><mat-icon>info</mat-icon> Informations générales</h3>
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Nom du magasin</mat-label>
            <mat-icon matPrefix>store</mat-icon>
            <input matInput [(ngModel)]="name" name="name" required />
          </mat-form-field>
          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Description du magasin</mat-label>
            <mat-icon matPrefix>description</mat-icon>
            <textarea matInput [(ngModel)]="description" name="description" rows="3" spellcheck="false" lang="fr"></textarea>
          </mat-form-field>
        </div>
        <div class="form-section">
          <h3 class="section-title"><mat-icon>place</mat-icon> Emplacement</h3>
          <app-map-picker [height]="'300px'" [initialLatitude]="latitude || 36.8065" [initialLongitude]="longitude || 10.1815" [initialZoom]="latitude ? 16 : 12" (locationSelected)="onLocationSelected($event)"></app-map-picker>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="dialogRef.close()" class="cancel-btn"><mat-icon>close</mat-icon> Annuler</button>
      <button mat-flat-button color="primary" (click)="update()" [disabled]="!name" class="update-btn"><mat-icon>save</mat-icon> Mettre à jour</button>
    </mat-dialog-actions>
  `,
    styles: [`
    :host { display: block; }
    .dialog-header { display: flex; align-items: center; gap: 12px; margin: 0; padding: 20px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .dialog-content { padding: 24px !important; display: flex; flex-direction: column; gap: 20px; }
    .full-width { width: 100%; }
    .dialog-actions { padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  `],
})
export class EditMagasinDialogComponent {
    id: number; name: string; description: string; address: string; latitude: number; longitude: number;
    constructor(public dialogRef: MatDialogRef<EditMagasinDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private _magasinService: MagasinService, private _snackBar: MatSnackBar) {
        this.id = data?.id; this.name = data?.name || ''; this.description = data?.description || ''; this.address = data?.address || '';
        this.latitude = data?.latitude || 36.8065; this.longitude = data?.longitude || 10.1815;
    }
    onLocationSelected(l: any) { this.latitude = l.latitude; this.longitude = l.longitude; this.address = l.address || ''; }
    update() {
        this._magasinService.updateForCompany(this.id, { name: this.name, description: this.description, address: this.address, latitude: this.latitude, longitude: this.longitude }).subscribe({
            next: () => this.dialogRef.close('updated'),
            error: () => this._snackBar.open('Erreur modification', 'Erreur', { duration: 3000 })
        });
    }
}
