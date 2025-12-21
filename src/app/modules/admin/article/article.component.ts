// src/app/modules/admin/apps/logistics/articles/article.component.ts
import { Component, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Subject, takeUntil } from 'rxjs';
import { ArticleService } from './article.service';
import { MatDividerModule } from '@angular/material/divider';
import { PaginationComponent, PaginationEvent } from 'app/shared/components/pagination/pagination.component';

// --- Article List Component ---
@Component({
  selector: 'app-article',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
    MatButtonToggleModule,
    PaginationComponent,
  ],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  articles: any[] = [];
  displayedArticles: any[] = [];
  loading: boolean = false;

  // Search & Filters
  searchQuery: string = '';
  selectedStatusFilters: string[] = ['active'];
  availableStatuses = [
    { value: 'all', label: 'Tous', color: '#1d4ed8', description: 'Tout afficher' },
    { value: 'active', label: 'Actifs', color: '#10b981', description: 'Articles actifs' },
    { value: 'inactive', label: 'Inactifs', color: '#6b7280', description: 'Articles désactivés' }
  ];

  // View mode
  viewMode: 'table' | 'grid' = 'table';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];

  // Sorting
  sortColumn: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Table columns
  displayedColumns: string[] = ['id', 'codeProduit', 'designation', 'dateAjout', 'isActive', 'actions'];

  // Action loading states
  actionLoading: { [key: number]: boolean } = {};

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _formBuilder: FormBuilder,
    private _articleService: ArticleService,
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadSavedFilters();
    this.loadArticles();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * TrackBy to optimize ngFor rendering
   */
  trackById(index: number, item: any): number | string {
    return item?.id ?? index;
  }

  loadArticles(): void {
    this.loading = true;
    // Load all articles (both active and inactive) for client-side filtering
    this._articleService.getAllByCompany(null)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.articles = data || [];
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('[ArticleComponent] Erreur lors du chargement des articles:', err);
          this._snackBar.open('❌ Erreur lors du chargement des articles', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
          this.articles = [];
          this.displayedArticles = [];
        }
      });
  }

  // ============================================
  // FILTERING & SEARCH
  // ============================================

  applyFilters(): void {
    let filtered = [...this.articles];

    const filters = this.selectedStatusFilters.filter(f => f !== 'all');
    if (filters.length > 0) {
      filtered = filtered.filter(article => {
        const isActive = article.isActive;
        const matchesActive = filters.includes('active') && isActive;
        const matchesInactive = filters.includes('inactive') && !isActive;
        return matchesActive || matchesInactive;
      });
    }

    // Apply search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(a => {
        const codeMatch = String(a.codeProduit || '').toLowerCase().includes(query);
        const designationMatch = String(a.designation || '').toLowerCase().includes(query);
        const idMatch = String(a.id || '').includes(query);
        return codeMatch || designationMatch || idMatch;
      });
    }

    // Apply sorting
    filtered = this.sortArticles(filtered);

    this.displayedArticles = filtered;
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
    this.sortColumn = 'id';
    this.sortDirection = 'asc';
    this.currentPage = 0;
    this.applyFilters();
    this._snackBar.open('🔄 Filtres réinitialisés', '', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  toggleStatusFilter(status: 'all' | 'active' | 'inactive'): void {
    if (status === 'all') {
      this.selectedStatusFilters = ['all'];
      this.applyFilters();
      return;
    }

    const nextFilters = this.selectedStatusFilters.filter(f => f !== 'all');
    const idx = nextFilters.indexOf(status);

    if (idx > -1) {
      nextFilters.splice(idx, 1);
    } else {
      nextFilters.push(status);
    }

    this.selectedStatusFilters = nextFilters.length > 0 ? nextFilters : ['all'];
    this.applyFilters();
  }

  isStatusSelected(status: string): boolean {
    if (status === 'all') {
      return this.selectedStatusFilters.length === 1 && this.selectedStatusFilters[0] === 'all';
    }
    return this.selectedStatusFilters.includes(status);
  }

  hasActiveFilters(): boolean {
    return this.searchQuery.trim() !== '' ||
      !(this.selectedStatusFilters.length === 1 && this.selectedStatusFilters[0] === 'active');
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    const filtersAreDefault = this.selectedStatusFilters.length === 1 && this.selectedStatusFilters[0] === 'active';
    if (!filtersAreDefault) {
      const activeFilters = this.selectedStatusFilters.includes('all')
        ? 1
        : new Set(this.selectedStatusFilters).size;
      count += activeFilters;
    }
    return count;
  }

  getArticleCountLabel(): string {
    const count = this.displayedArticles.length;
    return `${count || 0} ${count > 1 ? 'articles' : 'article'}`;
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

  sortArticles(articles: any[]): any[] {
    return [...articles].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortColumn) {
        case 'id':
          valueA = a.id;
          valueB = b.id;
          break;
        case 'codeProduit':
          valueA = String(a.codeProduit || '').toLowerCase();
          valueB = String(b.codeProduit || '').toLowerCase();
          break;
        case 'designation':
          valueA = String(a.designation || '').toLowerCase();
          valueB = String(b.designation || '').toLowerCase();
          break;
        case 'dateAjout':
          valueA = new Date(a.dateAjout).getTime();
          valueB = new Date(b.dateAjout).getTime();
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

  paginatedArticles(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.displayedArticles.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.saveFiltersToStorage();
  }

  // ============================================
  // VIEW MODE
  // ============================================

  onViewModeChange(mode: 'table' | 'grid'): void {
    this.viewMode = mode;
    localStorage.setItem('article_view_mode', this.viewMode);
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
    localStorage.setItem('article_filters', JSON.stringify(filters));
  }

  loadSavedFilters(): void {
    // Load view mode
    const savedViewMode = localStorage.getItem('article_view_mode');
    if (savedViewMode === 'grid' || savedViewMode === 'table') {
      this.viewMode = savedViewMode;
    }

    // Load filters
    const saved = localStorage.getItem('article_filters');
    if (saved) {
      try {
        const filters = JSON.parse(saved);
        this.searchQuery = filters.searchQuery || '';
        this.selectedStatusFilters = filters.selectedStatusFilters && filters.selectedStatusFilters.length
          ? filters.selectedStatusFilters
          : ['active'];
        this.sortColumn = filters.sortColumn || 'id';
        this.sortDirection = filters.sortDirection || 'asc';
        this.pageSize = filters.pageSize || 10;
        this.currentPage = 0; // Always start at page 0
      } catch (e) {
        console.error('Error loading saved filters:', e);
      }
    }
  }

  toggleActiveFilter(): void {
    // Legacy method - kept for compatibility
    if (this.selectedStatusFilters.includes('active') && !this.selectedStatusFilters.includes('inactive')) {
      this.selectedStatusFilters = ['inactive'];
    } else {
      this.selectedStatusFilters = ['active'];
    }
    this.applyFilters();
  }

  onView(article: any): void {
    console.log('[ArticleComponent] Ouverture du dialogue de visualisation pour ID:', article.id);
    this._dialog.open(ArticleViewComponent, {
      minWidth: '400px',
      disableClose: false,
      autoFocus: true,
      data: { articleData: article }
    });
  }

  onEdit(article: any): void {
    console.log('[ArticleComponent] Ouverture du dialogue d\'édition pour ID:', article.id);
    const dialogRef = this._dialog.open(ArticleEditComponent, {
      minWidth: '400px',
      disableClose: false,
      autoFocus: true,
      data: { articleData: article }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('[ArticleComponent] Dialogue d\'édition fermé avec le résultat:', result);
      if (result === 'updated') {
        this._snackBar.open(`Article ID ${article.id} mis à jour avec succès.`, 'Succès', { duration: 3000 });
        this.loadArticles();
      }
    });
  }

  onCreate(): void {
    console.log('[ArticleComponent] Ouverture du dialogue de création.');
    const dialogRef = this._dialog.open(ArticleCreateComponent, {
      minWidth: '400px',
      disableClose: false,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('[ArticleComponent] Dialogue de création fermé avec le résultat:', result);
      if (result === 'created') {
        this._snackBar.open('Article créé avec succès.', 'Succès', { duration: 3000 });
        this.loadArticles();
      }
    });
  }

  onToggleActive(id: number, currentStatus: boolean): void {
    // 🏢 Use company-aware setActiveStatus method
    this._articleService.setActiveStatusForCompany(id, !currentStatus)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: () => {
          const index = this.articles.findIndex(a => a.id === id);
          if (index !== -1) {
            this.articles[index].isActive = !currentStatus;
          }
          this._snackBar.open(`Statut de l'article ID ${id} mis à jour.`, 'Succès', { duration: 3000 });
        },
        error: (err) => {
          console.error('[ArticleComponent] Erreur lors de la mise à jour du statut:', err);
          this._snackBar.open('Erreur lors de la mise à jour du statut.', 'Erreur', { duration: 5000 });
        }
      });
  }
}
// --- Fin du composant ArticleComponent ---

// --- Article Create Component ---
@Component({
  selector: 'app-article-create-dialog',
  template: `
    <div class="flex flex-col w-full h-full">
      <div class="flex items-center justify-between py-4 px-6 border-b">
        <div class="text-lg font-medium">Créer un Article</div>
        <button mat-icon-button (click)="onCancel()" [disabled]="submitting">
          <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
        </button>
      </div>

      <div class="flex-auto overflow-y-auto p-6 md:p-8">
        <form [formGroup]="articleForm" (ngSubmit)="onSubmit()" class="flex flex-col">
          
          <mat-form-field class="w-full">
            <mat-label>Code Produit</mat-label>
            <input matInput formControlName="codeProduit" placeholder="Entrez le code produit" required>
            <mat-error *ngIf="articleForm.get('codeProduit')?.invalid && articleForm.get('codeProduit')?.touched">
              <span *ngIf="articleForm.get('codeProduit')?.errors?.['required']">Le code produit est requis.</span>
            </mat-error>
          </mat-form-field>

          <mat-form-field class="w-full mt-4">
            <mat-label>Désignation</mat-label>
            <input matInput formControlName="designation" placeholder="Entrez la désignation" required spellcheck="false" lang="fr">
            <mat-error *ngIf="articleForm.get('designation')?.invalid && articleForm.get('designation')?.touched">
              <span *ngIf="articleForm.get('designation')?.errors?.['required']">La désignation est requise.</span>
            </mat-error>
          </mat-form-field>

          <!-- Photo Upload -->
          <div class="mt-4">
            <label class="block text-sm font-medium mb-2">Photo de l'article</label>
            <div class="flex items-center gap-4">
              <input
                type="file"
                #fileInput
                (change)="onPhotoSelected($event)"
                accept="image/jpeg,image/png,image/gif"
                style="display: none"
              />
              <button
                mat-stroked-button
                type="button"
                (click)="fileInput.click()"
                [disabled]="submitting"
              >
                <mat-icon>upload</mat-icon>
                <span class="ml-2">Choisir une photo</span>
              </button>
              <span class="text-sm text-gray-500" *ngIf="selectedPhoto">{{ selectedPhoto.name }}</span>
            </div>
            
            <!-- Photo Preview -->
            <div *ngIf="photoPreview" class="mt-4 relative inline-block">
              <img [src]="photoPreview" alt="Preview" class="max-w-xs max-h-48 rounded border">
              <button
                mat-icon-button
                type="button"
                (click)="removePhoto()"
                class="absolute top-0 right-0 bg-red-500 text-white"
                style="transform: translate(50%, -50%)"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-end mt-6">
            <button
              mat-stroked-button
              type="button"
              (click)="onCancel()"
              [disabled]="submitting"
            >
              Annuler
            </button>
            <button
              mat-flat-button
              type="submit"
              [color]="'primary'"
              class="ml-3"
              [disabled]="articleForm.invalid || submitting"
            >
              <mat-progress-spinner
                *ngIf="submitting"
                [diameter]="20"
                [mode]="'indeterminate'"
                class="mr-2"
              >
              </mat-progress-spinner>
              <span *ngIf="!submitting">Créer</span>
              <span *ngIf="submitting">Création...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .mat-mdc-form-field {
      width: 100%;
    }
    mat-progress-spinner {
      display: inline-block;
      vertical-align: middle;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ]
})
export class ArticleCreateComponent implements OnInit {
  articleForm: FormGroup;
  submitting: boolean = false;
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _formBuilder: FormBuilder,
    private _articleService: ArticleService,
    public dialogRef: MatDialogRef<ArticleCreateComponent>,
    private _snackBar: MatSnackBar
  ) {
    this.articleForm = this._formBuilder.group({
      codeProduit: ['', [Validators.required]],
      designation: ['', [Validators.required]]
    });
  }

  ngOnInit(): void { }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this._snackBar.open('La taille du fichier ne doit pas dépasser 5MB', 'Erreur', { duration: 5000 });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this._snackBar.open('Type de fichier non autorisé. Utilisez JPG, PNG ou GIF.', 'Erreur', { duration: 5000 });
        return;
      }

      this.selectedPhoto = file;

      // Generate preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.selectedPhoto = null;
    this.photoPreview = null;
  }

  onSubmit(): void {
    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formData = {
      ...this.articleForm.value,
      photo: this.selectedPhoto
    };

    // 🏢 Use company-aware create method
    this._articleService.createForCompany(formData)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          console.log('[ArticleCreateComponent] Article créé avec succès:', response);
          this.submitting = false;
          this._snackBar.open('Article créé avec succès.', 'Succès', { duration: 3000 });
          this.dialogRef.close('created');
        },
        error: (err) => {
          console.error('[ArticleCreateComponent] Erreur lors de la création:', err);
          this.submitting = false;
          let errorMsg = err.error?.message || 'Erreur lors de la création de l\'article.';
          if (err.status === 400) {
            errorMsg = err.error?.message || 'Données d\'article invalides.';
          } else if (err.status === 409) {
            errorMsg = 'Code produit déjà utilisé.';
          } else if (err.status >= 500) {
            errorMsg = 'Erreur serveur.';
          }
          this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close('cancelled');
  }
}
// --- Fin du composant ArticleCreateComponent ---

// --- Article Edit Component ---
@Component({
  selector: 'app-article-edit-dialog',
  template: `
    <div class="flex flex-col w-full h-full">
      <div class="flex items-center justify-between py-4 px-6 border-b">
        <div class="text-lg font-medium">Modifier l'Article (ID: {{ data?.articleData?.id }})</div>
        <button mat-icon-button (click)="onCancel()" [disabled]="submitting">
          <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
        </button>
      </div>

      <div class="flex-auto overflow-y-auto p-6 md:p-8">
        <div class="flex flex-col items-center justify-center" *ngIf="loadingData">
          <mat-spinner diameter="40"></mat-spinner>
          <div class="mt-4 text-secondary">Chargement des détails...</div>
        </div>

        <form [formGroup]="articleForm" (ngSubmit)="onSubmit()" class="flex flex-col" *ngIf="!loadingData">
          
          <mat-form-field class="w-full">
            <mat-label>Code Produit</mat-label>
            <input matInput formControlName="codeProduit" placeholder="Entrez le code produit" required>
            <mat-error *ngIf="articleForm.get('codeProduit')?.invalid && articleForm.get('codeProduit')?.touched">
              <span *ngIf="articleForm.get('codeProduit')?.errors?.['required']">Le code produit est requis.</span>
            </mat-error>
          </mat-form-field>

          <mat-form-field class="w-full mt-4">
            <mat-label>Désignation</mat-label>
            <input matInput formControlName="designation" placeholder="Entrez la désignation" required spellcheck="false" lang="fr">
            <mat-error *ngIf="articleForm.get('designation')?.invalid && articleForm.get('designation')?.touched">
              <span *ngIf="articleForm.get('designation')?.errors?.['required']">La désignation est requise.</span>
            </mat-error>
          </mat-form-field>

          <!-- Photo Upload -->
          <div class="mt-4">
            <label class="block text-sm font-medium mb-2">Photo de l'article</label>
            
            <!-- Existing Photo -->
            <div *ngIf="existingPhotoUrl && !photoPreview" class="mb-4">
              <p class="text-sm text-gray-600 mb-2">Photo actuelle:</p>
              <img [src]="'http://localhost:5288' + existingPhotoUrl" alt="Photo actuelle" class="max-w-xs max-h-48 rounded border">
            </div>
            
            <div class="flex items-center gap-4">
              <input
                type="file"
                #fileInput
                (change)="onPhotoSelected($event)"
                accept="image/jpeg,image/png,image/gif"
                style="display: none"
              />
              <button
                mat-stroked-button
                type="button"
                (click)="fileInput.click()"
                [disabled]="submitting"
              >
                <mat-icon>upload</mat-icon>
                <span class="ml-2">{{ existingPhotoUrl ? 'Changer la photo' : 'Choisir une photo' }}</span>
              </button>
              <span class="text-sm text-gray-500" *ngIf="selectedPhoto">{{ selectedPhoto.name }}</span>
            </div>
            
            <!-- New Photo Preview -->
            <div *ngIf="photoPreview" class="mt-4">
              <p class="text-sm text-gray-600 mb-2">Nouvelle photo:</p>
              <div class="relative inline-block">
                <img [src]="photoPreview" alt="Preview" class="max-w-xs max-h-48 rounded border">
                <button
                  mat-icon-button
                  type="button"
                  (click)="removePhoto()"
                  class="absolute top-0 right-0 bg-red-500 text-white"
                  style="transform: translate(50%, -50%)"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end mt-6">
            <button
              mat-stroked-button
              type="button"
              (click)="onCancel()"
              [disabled]="submitting"
            >
              Annuler
            </button>
            <button
              mat-flat-button
              type="submit"
              [color]="'primary'"
              class="ml-3"
              [disabled]="articleForm.invalid || submitting"
            >
              <mat-progress-spinner
                *ngIf="submitting"
                [diameter]="20"
                [mode]="'indeterminate'"
                class="mr-2"
              >
              </mat-progress-spinner>
              <span *ngIf="!submitting">Mettre à jour</span>
              <span *ngIf="submitting">Mise à jour...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .mat-mdc-form-field {
      width: 100%;
    }
    mat-progress-spinner {
      display: inline-block;
      vertical-align: middle;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ]
})
export class ArticleEditComponent implements OnInit {
  articleForm: FormGroup;
  submitting: boolean = false;
  loadingData: boolean = false;
  selectedPhoto: File | null = null;
  photoPreview: string | null = null;
  existingPhotoUrl: string | null = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _formBuilder: FormBuilder,
    private _articleService: ArticleService,
    public dialogRef: MatDialogRef<ArticleEditComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { articleData: any },
    private _snackBar: MatSnackBar
  ) {
    this.articleForm = this._formBuilder.group({
      codeProduit: ['', [Validators.required]],
      designation: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.data?.articleData) {
      console.log('[ArticleEditComponent] Données d\'article reçues:', this.data.articleData);
      this.articleForm.patchValue({
        codeProduit: this.data.articleData.codeProduit,
        designation: this.data.articleData.designation
      });
      this.existingPhotoUrl = this.data.articleData.photoUrl;
      this.loadingData = false;
    } else {
      console.error('[ArticleEditComponent] Aucune donnée d\'article fournie.');
      this.loadingData = false;
      this.dialogRef.close();
    }
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this._snackBar.open('La taille du fichier ne doit pas dépasser 5MB', 'Erreur', { duration: 5000 });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this._snackBar.open('Type de fichier non autorisé. Utilisez JPG, PNG ou GIF.', 'Erreur', { duration: 5000 });
        return;
      }

      this.selectedPhoto = file;

      // Generate preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.selectedPhoto = null;
    this.photoPreview = null;
  }

  onSubmit(): void {
    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const articleId = this.data?.articleData?.id;
    const formData = {
      ...this.articleForm.value,
      photo: this.selectedPhoto
    };

    if (articleId) {
      // 🏢 Use company-aware update method
      this._articleService.updateForCompany(articleId, formData)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (response) => {
            console.log('[ArticleEditComponent] Article mis à jour avec succès:', response);
            this.submitting = false;
            this._snackBar.open(`Article ID ${articleId} mis à jour avec succès.`, 'Succès', { duration: 3000 });
            this.dialogRef.close('updated');
          },
          error: (err) => {
            console.error('[ArticleEditComponent] Erreur lors de la mise à jour:', err);
            this.submitting = false;
            let errorMsg = err.error?.message || 'Erreur lors de la mise à jour de l\'article.';
            if (err.status === 400) {
              errorMsg = err.error?.message || 'Données d\'article invalides.';
            } else if (err.status === 404) {
              errorMsg = 'Article non trouvé.';
            } else if (err.status === 409) {
              errorMsg = 'Code produit déjà utilisé.';
            } else if (err.status >= 500) {
              errorMsg = 'Erreur serveur.';
            }
            this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
          }
        });
    } else {
      this.submitting = false;
      console.error('[ArticleEditComponent] ID d\'article manquant.');
      this._snackBar.open('Impossible de mettre à jour : ID d\'article manquant.', 'Erreur', { duration: 5000 });
    }
  }

  onCancel(): void {
    this.dialogRef.close('cancelled');
  }
}
// --- Fin du composant ArticleEditComponent ---

// --- Article View Component ---
@Component({
  selector: 'app-article-view-dialog',
  template: `
    <div class="flex flex-col w-full h-full">
      <div class="flex items-center justify-between py-4 px-6 border-b">
        <div class="text-lg font-medium">Détails de l'Article (ID: {{ data?.articleData?.id }})</div>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
        </button>
      </div>

      <div class="flex-auto overflow-y-auto p-6 md:p-8">
        <mat-list *ngIf="data?.articleData; else noData">
          <!-- Photo Display -->
          <div *ngIf="data.articleData.photoUrl" class="mb-6">
            <img [src]="'http://localhost:5288' + data.articleData.photoUrl" alt="Photo de l'article" class="max-w-md max-h-64 rounded border mx-auto block">
          </div>
          
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">ID:</span>
              <span>{{ data.articleData.id }}</span>
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">Code Produit:</span>
              <span>{{ data.articleData.codeProduit }}</span>
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">Désignation:</span>
              <span>{{ data.articleData.designation }}</span>
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">Date d'Ajout:</span>
              <span>{{ data.articleData.dateAjout | date:'short' }}</span>
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">Statut:</span>
              <span [ngClass]="{
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800': data.articleData.isActive,
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800': !data.articleData.isActive
              }">
                {{ data.articleData.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </mat-list-item>
        </mat-list>
        <ng-template #noData>
          <div class="text-center text-gray-500 p-4">Données d'article non disponibles.</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ]
})
export class ArticleViewComponent {
  constructor(
    public dialogRef: MatDialogRef<ArticleViewComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { articleData: any }
  ) { }

  onCancel(): void {
    this.dialogRef.close('cancelled');
  }
}
// --- Fin du composant ArticleViewComponent ---