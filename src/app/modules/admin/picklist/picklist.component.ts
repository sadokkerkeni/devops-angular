
import { Component, Inject, inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PicklistService } from './picklist.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { PaginationComponent, PaginationEvent } from 'app/shared/components/pagination/pagination.component';
import { SkeletonLoaderComponent } from 'app/shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-picklist',
  standalone: true,
   imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    PaginationComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './picklist.component.html',
  styleUrls: ['./picklist.component.scss'],
   encapsulation: ViewEncapsulation.None, 
})
export class PicklistComponent implements OnInit, OnDestroy {
  Math = Math; // For template access

picklists: any[] = [];
displayedPicklists: any[] = [];
loading: boolean = false;
filter: 'all' | 'active' | 'inactive' = 'all';
  warehouses: any[] = [];
  lines: any[] = [];
  availableStatuses: any[] = [];

  private destroy$ = new Subject<void>();

  // Filters
  selectedWarehouseId: number | null = null;
  selectedLineId: number | null = null;
  selectedStatusIds: number[] = [];
  searchQuery: string = '';

  // Loading states for individual actions
  actionLoading: { [key: number]: boolean } = {};

  // Pagination
  pageSize: number = 25;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  currentPage: number = 0;
  totalItems: number = 0;

  // Sorting
  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  displayedColumns = ['id', 'name', 'status', 'actions'];

  constructor(
      private _snackBar: MatSnackBar,
      private picklistService: PicklistService,
      private _dialog: MatDialog,
        private router: Router
    ) {}

  ngOnInit() {
    this.selectedWarehouseId = null;
    this.selectedLineId = null;
    
    // Load saved filters from localStorage
    this.loadSavedFilters();
    
    this.loadpicklists();
    this.loadmagasin();
    this.loadline();
    this.loadStatuses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filteredPicklists(): any[] {
    return this.displayedPicklists;
  }

  paginatedPicklists(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.displayedPicklists.slice(startIndex, endIndex);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    
    // Save pagination preferences
    localStorage.setItem('picklist-pagination', JSON.stringify({
      pageSize: this.pageSize,
      currentPage: this.currentPage
    }));
  }

  onSortChange(column: string): void {
    if (this.sortColumn === column) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.sortPicklists();
    
    // Save sort preferences
    localStorage.setItem('picklist-sort', JSON.stringify({
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection
    }));
  }

  private sortPicklists(): void {
    this.displayedPicklists.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortColumn) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.description?.toLowerCase() || '';
          bValue = b.status?.description?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'unfold_more';
    }
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  applyFilters(): void {
    let filtered = [...this.picklists];

    // Search filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.id?.toString().includes(query) ||
        p.type?.toLowerCase().includes(query)
      );
    }

    // Warehouse filter
    if (this.selectedWarehouseId) {
      filtered = filtered.filter(p => p.warehouseId === this.selectedWarehouseId);
    }

    // Line filter
    if (this.selectedLineId) {
      filtered = filtered.filter(p => p.lineId === this.selectedLineId);
    }

    // Status filter
    if (this.selectedStatusIds.length > 0) {
      filtered = filtered.filter(p => 
        this.selectedStatusIds.includes(p.status?.id)
      );
    }

    this.displayedPicklists = filtered;
    this.totalItems = filtered.length;
    
    // Apply sorting
    this.sortPicklists();
    
    // Reset to first page when filters change
    this.currentPage = 0;
    
    // Save filters to localStorage
    this.saveFiltersToStorage();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedWarehouseId = null;
    this.selectedLineId = null;
    this.selectedStatusIds = [];
    this.applyFilters();
    localStorage.removeItem('picklist-filters');
  }

  toggleStatusFilter(statusId: number): void {
    const index = this.selectedStatusIds.indexOf(statusId);
    if (index > -1) {
      this.selectedStatusIds.splice(index, 1);
    } else {
      this.selectedStatusIds.push(statusId);
    }
    this.applyFilters();
  }

  isStatusSelected(statusId: number): boolean {
    return this.selectedStatusIds.includes(statusId);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchQuery ||
      this.selectedWarehouseId ||
      this.selectedLineId ||
      this.selectedStatusIds.length > 0
    );
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchQuery) count++;
    if (this.selectedWarehouseId) count++;
    if (this.selectedLineId) count++;
    if (this.selectedStatusIds.length > 0) count += this.selectedStatusIds.length;
    return count;
  }

  private saveFiltersToStorage(): void {
    const filters = {
      searchQuery: this.searchQuery,
      selectedWarehouseId: this.selectedWarehouseId,
      selectedLineId: this.selectedLineId,
      selectedStatusIds: this.selectedStatusIds
    };
    localStorage.setItem('picklist-filters', JSON.stringify(filters));
  }

  private loadSavedFilters(): void {
    const saved = localStorage.getItem('picklist-filters');
    if (saved) {
      try {
        const filters = JSON.parse(saved);
        this.searchQuery = filters.searchQuery || '';
        this.selectedWarehouseId = filters.selectedWarehouseId || null;
        this.selectedLineId = filters.selectedLineId || null;
        this.selectedStatusIds = filters.selectedStatusIds || [];
      } catch (e) {
        console.error('Error loading saved filters:', e);
      }
    }

    // Load pagination preferences
    const savedPagination = localStorage.getItem('picklist-pagination');
    if (savedPagination) {
      try {
        const pagination = JSON.parse(savedPagination);
        this.pageSize = pagination.pageSize || 25;
        this.currentPage = pagination.currentPage || 0;
      } catch (e) {
        console.error('Error loading saved pagination:', e);
      }
    }

    // Load sort preferences
    const savedSort = localStorage.getItem('picklist-sort');
    if (savedSort) {
      try {
        const sort = JSON.parse(savedSort);
        this.sortColumn = sort.sortColumn || 'id';
        this.sortDirection = sort.sortDirection || 'desc';
      } catch (e) {
        console.error('Error loading saved sort:', e);
      }
    }
  }

  private loadStatuses(): void {
    this.picklistService.getstatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.availableStatuses = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des statuts:', err);
        }
      });
  }
  goToPicklistDetails(picklistId: number) {
  this.router.navigate(['/picklist', picklistId]);
}
  openCreateDialog() {
    const dialogRef = this._dialog.open(CreatePicklistDialogComponent, {
      width: '800px',
  maxHeight: '90vh', // this is critical
        disableClose: false,
        autoFocus: true,
      data: { warehouses: this.warehouses, lines: this.lines }
    });

   dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Convertir la quantité en nombre si c'est une string
      const picklistData = {
        ...result,
        quantity: typeof result.quantity === 'string' ? parseInt(result.quantity, 10) : result.quantity
      };
      
      console.log('[PicklistComponent] Création de picklist avec données:', picklistData);
      
      this.picklistService.createPicklist(picklistData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdPicklist) => {
            console.log('[PicklistComponent] ✅ Picklist créée avec succès:', createdPicklist);
            this._snackBar.open('Pickliste créée avec succès.', '', { duration: 3000 });
            this.loadpicklists(); // Reload after successful creation
          },
          error: (err) => {
            console.error('[PicklistComponent] ❌ Erreur lors de la création de la pickliste:', err);
            const errorMessage = err.error?.message || 'Erreur lors de la création de la pickliste.';
            this._snackBar.open(errorMessage, 'Erreur', {
              duration: 5000,
            });
          }
        });
    }
    });
  }

   editPicklist(picklist: any) {
    const dialogRef = this._dialog.open(EditPicklistDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: { 
        picklistData: picklist, 
        warehouses: this.warehouses, 
        lines: this.lines 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this._snackBar.open('Pickliste mise à jour avec succès.', '', { duration: 3000 });
        this.loadpicklists(); // Recharger la liste
      } else if (result === 'error') {
        // Gérer l'erreur si nécessaire, le message est déjà affiché dans le dialogue
      }
      // 'cancelled' ou autre : ne rien faire
    });
  }

  deletePicklist(picklist: any) {
    this.picklists = this.picklists.filter(p => p.id !== picklist.id);
  }

  loadmagasin(){
    this.picklistService.getWarehouses().pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        console.log(data);
        
        this.warehouses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des warehouses:', err);
        this._snackBar.open('Erreur lors du chargement des warehouses.', 'Erreur', {
          duration: 5000,
        });
        this.loading = false;
      }
    });
   
    
  }
  loadline(){

    this.picklistService.getlines().pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.lines = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des lines:', err);
        this._snackBar.open('Erreur lors du chargement des lines.', 'Erreur', {
          duration: 5000,
        });
        this.loading = false;
      }
    });

   
    
  }

 loadpicklists(): void {
  this.loading = true;

  this.picklistService.getPicklists(undefined) // fetch all (no filter)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.picklists = data;
        console.log('Picklists loaded:', this.picklists);
        
        // Apply filters after loading
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des picklistes:', err);
        this._snackBar.open('Erreur lors du chargement des picklistes.', 'Erreur', {
          duration: 5000,
        });
        this.loading = false;
      }
    });
  }

  // Transition handlers
  onMarkReadyWithFeedback(p: any): void {
    this.actionLoading[p.id] = true;
    
    // Optimistic UI update
    const originalStatus = { ...p.status };
    
    this.picklistService.loadDetailPicklists(p.id).subscribe({
      next: (details) => {
        const payload = details.map((d: any) => ({
          id: d.id,
          detailPicklistId: d.id,
          articleId: d.articleId || d.article?.id, // Ajout de articleId requis
          article: d.article,
          status: d.status,
          emplacement: d.emplacement,
          quantite: d.quantite,
          picklistId: d.picklistId,
          isActive: d.isActive
        }));
        
        this.picklistService.checkInventoryAvailability(payload).subscribe({
          next: (res) => {
            const allOk = res.every(r => r.isAvailable === true);
            
            if (!allOk) {
              this.actionLoading[p.id] = false;
              const unavailableItems = res.filter(r => !r.isAvailable).length;
              
              const snackBarRef = this._snackBar.open(
                `⚠️ Stock insuffisant pour ${unavailableItems} article(s)`, 
                'Voir détails', 
                { 
                  duration: 6000, 
                  panelClass: ['error-snackbar'],
                  horizontalPosition: 'end',
                  verticalPosition: 'top'
                }
              );
              
              snackBarRef.onAction().subscribe(() => {
                this.goToPicklistDetails(p.id);
              });
              return;
            }
            
            this.picklistService.markReady(p.id).subscribe({
              next: () => {
                this._snackBar.open(
                  '✅ Pickliste marquée comme Prête', 
                  '', 
                  { 
                    duration: 3000,
                    panelClass: ['success-snackbar'],
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                  }
                );
                this.actionLoading[p.id] = false;
                this.loadpicklists();
              },
              error: (e) => {
                console.error(e);
                p.status = originalStatus;
                this.actionLoading[p.id] = false;
                this._snackBar.open(
                  '❌ Erreur lors du marquage', 
                  'Réessayer', 
                  { 
                    duration: 5000,
                    panelClass: ['error-snackbar'],
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                  }
                );
              }
            });
          },
          error: (err) => {
            console.error(err);
            this.actionLoading[p.id] = false;
            this._snackBar.open(
              '❌ Impossible de vérifier la disponibilité', 
              '', 
              { 
                duration: 4000,
                panelClass: ['error-snackbar'],
                horizontalPosition: 'end',
                verticalPosition: 'top'
              }
            );
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.actionLoading[p.id] = false;
        this._snackBar.open(
          '❌ Erreur de chargement des détails', 
          '', 
          { 
            duration: 4000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          }
        );
      }
    });
  }

  onMarkReady(p: any): void {
    this.onMarkReadyWithFeedback(p);
  }

  onStartShippingWithFeedback(p: any): void {
    this.actionLoading[p.id] = true;
    
    this.picklistService.startShipping(p.id).subscribe({
      next: () => {
        this._snackBar.open(
          '✅ Expédition démarrée avec succès', 
          '', 
          { 
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          }
        );
        this.actionLoading[p.id] = false;
        this.loadpicklists();
      },
      error: (e) => {
        console.error(e);
        this.actionLoading[p.id] = false;
        this._snackBar.open(
          '❌ Erreur lors du démarrage de l\'expédition', 
          'Réessayer', 
          { 
            duration: 5000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          }
        );
      }
    });
  }

  onStartShipping(p: any): void {
    this.onStartShippingWithFeedback(p);
  }

  onCompleteWithFeedback(p: any): void {
    this.actionLoading[p.id] = true;
    
    this.picklistService.complete(p.id).subscribe({
      next: () => {
        this._snackBar.open(
          '✅ Pickliste terminée avec succès', 
          '', 
          { 
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          }
        );
        this.actionLoading[p.id] = false;
        this.loadpicklists();
      },
      error: (e) => {
        console.error(e);
        this.actionLoading[p.id] = false;
        this._snackBar.open(
          '❌ Erreur lors de la finalisation', 
          'Réessayer', 
          { 
            duration: 5000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          }
        );
      }
    });
  }

  onComplete(p: any): void {
    this.onCompleteWithFeedback(p);
  }

  onCheckAvailability(p: any): void {
    this.picklistService.loadDetailPicklists(p.id).subscribe({
      next: (details) => {
        const payload = details.map((d: any) => ({
          id: d.id,
          detailPicklistId: d.id,
          articleId: d.articleId || d.article?.id, // Ajout de articleId requis
          article: d.article,
          status: d.status,
          emplacement: d.emplacement,
          quantite: d.quantite,
          picklistId: d.picklistId,
          isActive: d.isActive
        }));
        this.picklistService.checkInventoryAvailability(payload).subscribe({
          next: (res) => {
            const ok = res.filter(r => r.isAvailable);
            const ko = res.filter(r => !r.isAvailable);
            this._snackBar.open(`Disponibles: ${ok.length}, Indisponibles: ${ko.length}`, '', { duration: 4000 });
          },
          error: (e) => { console.error(e); this._snackBar.open('Erreur vérification disponibilité', 'Erreur', { duration: 4000 }); }
        });
      },
      error: (e) => { console.error(e); this._snackBar.open('Erreur chargement détails', 'Erreur', { duration: 4000 }); }
    });
  }
}









@Component({
  selector: 'app-create-picklist-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Créer une Pickliste</h2>
    <div mat-dialog-content class="flex flex-col gap-4">

      <mat-form-field appearance="fill">
        <mat-label>Nom</mat-label>
        <input matInput [(ngModel)]="picklist.name" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Type</mat-label>
        <input matInput [(ngModel)]="picklist.type" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Quantité</mat-label>
        <input matInput [(ngModel)]="picklist.quantity" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Magasin</mat-label>
        <mat-select [(ngModel)]="picklist.warehouseId">
          <mat-option [value]="null">select one</mat-option>
          <mat-option *ngFor="let w of data.warehouses" [value]="w.id">
            {{ w.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Ligne</mat-label>
        <mat-select [(ngModel)]="picklist.lineId">
          <mat-option *ngFor="let l of data.lines" [value]="l.id">
            {{ l.description }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="fill">
  <mat-label>Statut</mat-label>
  <mat-select [(ngModel)]="picklist.statusId">
    <mat-option *ngFor="let s of status" [value]="s.id">
      {{ s.description }}
    </mat-option>
  </mat-select>
</mat-form-field>

    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Annuler</button>
      <button mat-flat-button color="primary" (click)="create()" [disabled]="!isValid()">Créer</button>
    </div>
  `
})
export class CreatePicklistDialogComponent implements OnInit{
  picklist = {
    name: '',
    type: '',
    quantity: '',
    lineId: null,
    warehouseId: null,
    statusId: null // default status if needed
  };
  status :any[]=[]

  constructor(
    private dialogRef: MatDialogRef<CreatePicklistDialogComponent>,
    private picklistService : PicklistService,
    @Inject(MAT_DIALOG_DATA) public data: { warehouses: any[]; lines: any[] }
  ) {}

  ngOnInit(): void {
     this.picklistService.getstatus().pipe()
    .subscribe({
      next: (data) => {
       this.status=data
      },
      error: (err) => {
        console.error('Erreur lors du chargement des warehouses:', err);
       
      }
    });
  }
  cancel() {
    this.dialogRef.close();
  }

  create() {
    this.dialogRef.close(this.picklist);
  }

 isValid() {
  return this.picklist.name &&
         this.picklist.type &&
         this.picklist.quantity &&
         this.picklist.lineId &&
         this.picklist.warehouseId &&
         this.picklist.statusId;
}
}










@Component({
  selector: 'app-edit-picklist-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Modifier la Pickliste</h2>
    <div mat-dialog-content class="flex flex-col gap-4">

      <mat-form-field appearance="fill">
        <mat-label>Nom</mat-label>
        <input matInput [(ngModel)]="picklist.name" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Type</mat-label>
        <input matInput [(ngModel)]="picklist.type" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Quantité</mat-label>
        <input matInput [(ngModel)]="picklist.quantity" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Magasin</mat-label>
        <mat-select [(ngModel)]="picklist.warehouseId">
          <mat-option *ngFor="let w of data.warehouses" [value]="w.id">{{ w.name }}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Ligne</mat-label>
        <mat-select [(ngModel)]="picklist.lineId">
          <mat-option *ngFor="let l of data.lines" [value]="l.id">{{ l.description }}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Statut</mat-label>
        <mat-select [(ngModel)]="picklist.status.id">
          <mat-option *ngFor="let s of status" [value]="s.id">{{ s.description }}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Annuler</button>
      <button mat-flat-button color="primary" (click)="update()" [disabled]="!isValid()">Mettre à jour</button>
    </div>
  `
})
export class EditPicklistDialogComponent implements OnInit {
  picklist: any = {};
  status: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<EditPicklistDialogComponent>,
    private picklistService: PicklistService,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: { picklistData: any; warehouses: any[]; lines: any[] }
  ) {}

  ngOnInit(): void {
    this.picklist = { ...this.data.picklistData };

    this.picklistService.getstatus().subscribe({
      next: (data) => {
        this.status = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statuts:', err);
      }
    });
  }

  cancel(): void {
    this.dialogRef.close('cancelled');
  }

  update(): void {
    const finalpicklis ={ 
      name : this.picklist.name,
      type : this.picklist.type,
      quantity: this.picklist.quantity ,
      lineId: this.picklist.lineId ,
      warehouseId: this.picklist.warehouseId ,
      statusId: this.picklist.status.id,
    }
  
    
    this.picklistService.updatePicklist(this.picklist.id, finalpicklis).subscribe({
      next: () => {
        this._snackBar.open('Pickliste mise à jour avec succès.', '', { duration: 3000 });
        this.dialogRef.close('updated');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la pickliste:', err);
        this._snackBar.open('Erreur lors de la mise à jour.', 'Erreur', { duration: 5000 });
        this.dialogRef.close('error');
      }
    });
  }

  isValid(): boolean {
    return this.picklist.name &&
           this.picklist.type &&
           this.picklist.quantity &&
           this.picklist.lineId &&
           this.picklist.warehouseId &&
           this.picklist.status.id;
  }
}