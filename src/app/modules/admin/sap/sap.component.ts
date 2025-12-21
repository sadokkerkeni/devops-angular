import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { SapService } from './sap.service';
import { ArticleService } from '../article/article.service';
import { PaginationComponent, PaginationEvent } from 'app/shared/components/pagination/pagination.component';

@Component({
  selector: 'app-sap',
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
    PaginationComponent
  ],
  templateUrl: './sap.component.html',
  styleUrls: ['./sap.component.scss']
})
export class SapComponent implements OnInit {
  displayedColumns: string[] = ['id', 'article', 'usCode', 'quantite', 'isActive', 'actions'];
  sapEntries: any[] = [];
  availableArticles: any[] = []; // 📦 List of articles for dropdown
  searchQuery: string = ''; // Search query for filtering

  // Pagination properties
  pageSize: number = 10;
  currentPage: number = 0;

  // Single form object for both create and edit
  sapForm: any = { articleId: null, article: '', usCode: '', quantite: 0 };
  isEditMode = false;
  currentEditId: number | null = null; // Store the ID being edited

  // Computed property for filtered SAPs
  get displayedSaps(): any[] {
    if (!this.searchQuery) {
      return this.sapEntries;
    }

    const query = this.searchQuery.toLowerCase();
    return this.sapEntries.filter(sap =>
      sap.article?.toLowerCase().includes(query) ||
      sap.usCode?.toLowerCase().includes(query) ||
      sap.quantite?.toString().includes(query)
    );
  }

  constructor(
    private sapService: SapService,
    private articleService: ArticleService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadSapEntries();
    this.loadArticles();
  }

  loadArticles() {
    this.articleService.getAllByCompany(true).subscribe({
      next: (articles) => {
        this.availableArticles = articles;
      },
      error: (e) => {
        console.error('Erreur lors du chargement des articles:', e);
        this.snackBar.open('Erreur lors du chargement des articles', 'Erreur', { duration: 5000 });
      }
    });
  }

  onArticleSelected(articleId: number) {
    const selectedArticle = this.availableArticles.find(a => a.id === articleId);
    if (selectedArticle) {
      this.sapForm.article = selectedArticle.designation;
      this.sapForm.usCode = selectedArticle.codeProduit;
    }
  }

  loadSapEntries() {
    // 🏢 Use company-aware method instead of getAll
    this.sapService.getAllByCompany().subscribe({
      next: (entries) => {
        this.sapEntries = entries;
        // Snackbar on initial load might be too noisy, consider removing or making it optional
        // this.snackBar.open('Entrées SAP chargées avec succès', 'Succès', { duration: 3000 });
      },
      error: (e) => {
        console.error('Erreur lors du chargement des entrées SAP:', e);
        this.snackBar.open('Erreur lors du chargement des entrées SAP', 'Erreur', { duration: 5000 });
      }
    });
  }

  // Prepare the form for creating a new entry
  startCreate() {
    this.isEditMode = false;
    this.currentEditId = null;
    // Reset form to initial empty state
    this.sapForm = { articleId: null, article: '', usCode: '', quantite: 0 };
  }

  // Prepare the form for editing an existing entry
  startEdit(sap: any) {
    this.isEditMode = true;
    this.currentEditId = sap.id;
    // Populate form with the data of the item to edit
    this.sapForm = { ...sap };
    // Try to find matching article by usCode
    const matchingArticle = this.availableArticles.find(a => a.codeProduit === sap.usCode);
    if (matchingArticle) {
      this.sapForm.articleId = matchingArticle.id;
    }
  }

  toggleActiveStatus(id: any, currentStatus: any) { // Renommer le paramètre pour plus de clarté

    // Inverser le statut actuel pour l'envoyer au backend
    const newStatus = !(currentStatus === true); // Ou simplement !currentStatus si vous êtes sûr que c'est un booléen

    // 🏢 Use company-aware setActiveStatus method
    this.sapService.setActiveStatusForCompany(id, newStatus).subscribe({
      next: () => {
        // Mettre à jour l'interface utilisateur immédiatement (optionnel mais recommandé)
        const sapItem = this.sapEntries.find(item => item.id === id);
        if (sapItem) {
          sapItem.isActive = newStatus; // Mettre à jour avec le nouveau statut
        }

        this.snackBar.open('Statut de l\'entrée SAP mis à jour avec succès', 'Succès', { duration: 3000 });
        // this.loadSapEntries(); // Optionnel : recharger depuis le serveur ou se fier à la mise à jour locale
      },
      error: (e) => {
        console.error('Erreur lors de la mise à jour du statut de l\'entrée SAP:', e);
        // Vérifier si le backend renvoie un message d'erreur spécifique
        let errorMsg = 'Erreur lors de la mise à jour du statut de l\'entrée SAP';
        if (e.error && e.error.message) {
          errorMsg = e.error.message;
        }
        this.snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
      }
    });
  }

  // Submit the form (either create or update)
  submitForm() {
    if (!this.sapForm.articleId || !this.sapForm.usCode || this.sapForm.quantite < 0) {
      this.snackBar.open('Veuillez sélectionner un article et remplir tous les champs correctement', 'Erreur', { duration: 5000 });
      return;
    }

    if (this.isEditMode && this.currentEditId) {
      // 🏢 Update existing entry using company-aware method
      this.sapService.updateForCompany(this.currentEditId, this.sapForm).subscribe({
        next: () => {
          this.snackBar.open('Entrée SAP mise à jour avec succès', 'Succès', { duration: 3000 });
          this.resetForm(); // Reset form and mode after successful update
          this.loadSapEntries(); // Reload list
        },
        error: (e) => {
          console.error('Erreur lors de la mise à jour de l\'entrée SAP:', e);
          this.snackBar.open('Erreur lors de la mise à jour de l\'entrée SAP', 'Erreur', { duration: 5000 });
        }
      });
    } else {
      // 🏢 Create new entry using company-aware method
      this.sapService.createForCompany(this.sapForm).subscribe({
        next: () => {
          this.snackBar.open('Entrée SAP créée avec succès', 'Succès', { duration: 3000 });
          this.resetForm(); // Reset form after successful creation
          this.loadSapEntries(); // Reload list
        },
        error: (e) => {
          console.error('Erreur lors de la création de l\'entrée SAP:', e);
          this.snackBar.open('Erreur lors de la création de l\'entrée SAP', 'Erreur', { duration: 5000 });
        }
      });
    }
  }

  // Reset the form and editing state
  resetForm() {
    this.isEditMode = false;
    this.currentEditId = null;
    this.sapForm = { articleId: null, article: '', usCode: '', quantite: 0 };
  }

  // Cancel editing (same as reset in this implementation)
  cancelEdit() {
    this.resetForm();
  }

  // Filter/search methods
  applyFilters() {
    // Filtering is handled by the displayedSaps getter
    // This method exists for consistency with other components
  }

  clearSearch() {
    this.searchQuery = '';
  }

  // Pagination methods
  onPageChange(event: PaginationEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }

  paginatedSaps(): any[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.displayedSaps.slice(start, end);
  }

  // Quantity classification for color-coded badges
  getQuantityClass(quantity: number): string {
    if (quantity >= 50) return 'q-high';
    if (quantity >= 20) return 'q-medium';
    return 'q-low';
  }

  deleteSap(id: number) {
    const dialogRef = this.dialog.open(SapDeleteDialogComponent, {
      width: '400px',
      data: { id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sapService.delete(id).subscribe({
          next: () => {
            this.snackBar.open('Entrée SAP supprimée avec succès', 'Succès', { duration: 3000 });
            this.loadSapEntries();
          },
          error: (e) => {
            console.error('Erreur lors de la suppression de l\'entrée SAP:', e);
            // Check for specific error types if needed (e.g., 404, 409)
            let errorMsg = 'Erreur lors de la suppression de l\'entrée SAP';
            if (e.status === 404) {
              errorMsg = 'Entrée SAP non trouvée';
            } else if (e.status === 409) {
              errorMsg = 'Impossible de supprimer l\'entrée SAP (utilisée ailleurs)';
            }
            this.snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
          }
        });
      }
    });
  }
}

// ... (SapDeleteDialogComponent remains the same) ...
@Component({
  selector: 'app-sap-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h1 mat-dialog-title>Confirmer la suppression</h1>
    <div mat-dialog-content>
      <p>Êtes-vous sûr de vouloir supprimer cette entrée SAP ?</p>
    </div>
    <div mat-dialog-actions class="flex justify-end p-4">
      <button mat-button (click)="onClose(false)">Annuler</button>
      <button mat-button color="warn" (click)="onClose(true)">Supprimer</button>
    </div>
  `,
  styles: [`
    .flex { display: flex; }
    .justify-end { justify-content: flex-end; }
    .p-4 { padding: 1rem; }
  `]
})
export class SapDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SapDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number }
  ) { }

  onClose(confirm: boolean): void {
    this.dialogRef.close(confirm);
  }
}