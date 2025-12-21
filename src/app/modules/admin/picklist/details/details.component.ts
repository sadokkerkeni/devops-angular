import { AfterViewInit, Component, ElementRef, Inject, OnInit, Optional, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PicklistService } from '../picklist.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import JsBarcode from 'jsbarcode';
import { concat, concatMap, from, Observable, Subject, takeUntil, take } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
// LocationService removed - feature deprecated

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
    MatCheckboxModule
  ],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  // Property to hold the calculated total quantity
  totalPicklistQuantity: number = 0;
  isAllAvailable: boolean = false; // Initialize
  isCheckingAvailability = false; // ✅ UI loading state for availability
  availabilityError: string | null = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  articles: any[] = []; // Ajouter cette propriété pour stocker les articles
  sapEntries: any[] = []; // SAP stock entries for dropdown
  sapLoading: boolean = false; // Loading state for SAP entries
  sapError: string | null = null; // Error state for SAP entries


  @ViewChildren('barcodeRef') barcodeElements!: QueryList<ElementRef>;
  picklistId!: number;
  picklist: any;
  detailPicklists: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private picklistService: PicklistService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _userService :UserService
  ) { }

sendOutPicklist() {
  if (this.isAllAvailable && this.picklist) { 
    console.log(`[DetailsComponent] Completion de la picklist ${this.picklistId} avec déduction du stock`);

    // ✅ CORRECTION : Appeler /complete qui déduit le stock automatiquement
    // Au lieu de mettre statusId: 2 qui ne fait rien
    this.picklistService.complete(this.picklistId).subscribe({
      next: (response) => {
        console.log('✅ Picklist complétée avec succès, stock déduit:', response);
        
        // ✅ CRITICAL FIX: Créer les traces de mouvement après la complétion
        this.createMovementTracesForPicklist();
        
        this._snackBar.open('✅ Picklist complétée avec succès ! Stock déduit et traces créées.', 'Succès', { 
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        // Recharger les données pour voir le nouveau statut "Completed"
        this.loadPicklist(); 
        this.loadDetailPicklists(this.picklistId);
      },
      error: (e) => {
        console.error('❌ Erreur lors de la complétion de la picklist:', e);
        let errorMsg = 'Erreur lors de la complétion de la picklist';
        if (e.error && e.error.message) {
          errorMsg = e.error.message;
        } else if (e.message) {
          errorMsg = e.message;
        }
        this._snackBar.open(`❌ ${errorMsg}`, 'Erreur', { 
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      }
    });
  } else {
    // Feedback si les conditions ne sont pas remplies
    if (!this.picklist) {
        this._snackBar.open('Données de picklist non chargées', 'Erreur', { duration: 5000 });
    } else if (!this.isAllAvailable) {
        this._snackBar.open('⚠️ Certaines quantités ne sont pas disponibles. Vérifiez la disponibilité d\'abord.', 'Avertissement', { duration: 6000 });
    }
  }
}

  openAddDetailDialog(): void {
    console.log(`[DetailsComponent] Ouverture du dialogue d'ajout de détail pour la Picklist ID ${this.picklistId}`);
    
  const dialogRef =  this.dialog.open(AddDetailPicklistDialogComponent, {
  minWidth: '400px',
  disableClose: false,
  autoFocus: true,
  data: { 
    picklistId: this.picklistId, 
    articles: this.articles,
    sapEntries: this.sapEntries,
    sapLoading: this.sapLoading,
    sapError: this.sapError
  }
});


    dialogRef.afterClosed().subscribe(result => {
      console.log(`[DetailsComponent] Dialogue d'ajout de détail fermé avec le résultat:`, result);
      if (result === 'created') {
        this._snackBar.open(`Détail ajouté avec succès à la picklist ID ${this.picklistId}.`, 'Succès', { duration: 3000 });
        // Recharger la liste des détails pour inclure le nouveau
        this.loadDetailPicklists(this.picklistId);
      }
      // Gérer 'cancelled' ou d'autres résultats si nécessaire
    });
  }

  private createMovementTracesForPicklist(): void {
    console.log(`[DetailsComponent] Création des MovementTraces pour la Picklist ID ${this.picklistId}`);

    if (!this.detailPicklists || this.detailPicklists.length === 0) {
      console.warn('[DetailsComponent] Aucun détail de picklist à traiter pour les MovementTraces.');
      this._snackBar.open('Aucun détail de picklist à traiter pour les mouvements.', 'Avertissement', { duration: 5000 });
      return;
    }

    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      console.error('[DetailsComponent] Impossible de créer les MovementTraces : ID utilisateur non disponible.');
      this._snackBar.open('Impossible de créer les mouvements : utilisateur non identifié.', 'Erreur', { duration: 5000 });
      return;
    }

    // Créer un tableau d'observables pour les requêtes de création
    const createObservables: Observable<any>[] = [];

    for (const detail of this.detailPicklists) {
      // --- MODIFICATION : Utiliser articleCode pour usNom ---
      // Vérifier la structure de votre DetailPicklistReadDto
      // Exemple : detail.article?.codeArticle ou detail.article?.name
      // Assurez-vous que detail.article existe et a la bonne propriété

      const articleCode = detail.article?.codeProduit; // Ajustez 'codeArticle' si le nom est différent (ex: 'name', 'designation')
      console.log(detail.article);
      
      const traceData: any = {
        // Utiliser articleCode comme usNom, ou un fallback si non disponible
        usNom: articleCode || detail.usCode || `TRACE-${this.picklistId}-${detail.id}`, 
        quantite: detail.quantite || '1', 
        userId: currentUserId,
        detailPicklistId: detail.id 
      };
      // --- FIN DE LA MODIFICATION ---

      console.log(`[DetailsComponent] Préparation de la création de MovementTrace pour DetailPicklist ID ${detail.id}:`, traceData);
      
      createObservables.push(this.picklistService.createMovementTrace(traceData)); 
    }

    // --- Exécuter les observables ---
    if (createObservables.length > 0) {
      concat(...createObservables).subscribe({
        next: (result) => {
          console.log('[DetailsComponent] MovementTrace créé avec succès:', result);
        },
        error: (err) => {
          console.error('[DetailsComponent] Erreur lors de la création d\'un MovementTrace:', err);
          let errorMsg = 'Erreur lors de l\'enregistrement d\'un mouvement.';
          if (err.status === 403) {
            errorMsg = 'Accès refusé: vérifiez vos droits (rôle Magasinier/Admin requis).';
          } else if (err.status === 401) {
            errorMsg = 'Session expirée. Veuillez vous reconnecter.';
          } else if (err.status === 400) {
            errorMsg = 'Données invalides pour le mouvement.';
          } else if (err.error?.message) {
            errorMsg = err.error.message;
          }
          this._snackBar.open(errorMsg, 'Erreur', { duration: 6000 });
        },
        complete: () => {
          console.log(`[DetailsComponent] Tous les MovementTraces (${createObservables.length}) pour la Picklist ID ${this.picklistId} ont été traités.`);
          this._snackBar.open(`Mouvements pour la picklist ID ${this.picklistId} enregistrés.`, 'Succès', { duration: 3000 });
          // Optionnel : Recharger la liste des MovementTraces si elle est affichée ailleurs
          // this.loadMovementTraces(); 
        }
      });
    } else {
      console.log(`[DetailsComponent] Aucun MovementTrace à créer pour la Picklist ID ${this.picklistId}.`);
    }
    // --- Fin de l'exécution --- 
  }
// --- Fin de la nouvelle méthode ---

// --- Méthode utilitaire pour obtenir l'ID de l'utilisateur actuel ---
/**
 * Obtient l'ID de l'utilisateur actuellement connecté.
 * @returns L'ID de l'utilisateur ou null si non disponible.
 */
 private getCurrentUserId(): number | null {
    var userIdStr = null;
     this._userService.user$
                .pipe((takeUntil(this._unsubscribeAll)))
                .subscribe((user: any) =>
                { console.log(user);
                
                  userIdStr = user.id
                });
    if (userIdStr) {
      
      return userIdStr
    }
    return null;
 }



checkAvailability(): void {
  if (this.detailPicklists.length === 0) {
    this._snackBar.open('Aucun détail à vérifier.', 'Info', { duration: 3000 });
    return;
  }

  const detailsForCheck = this.detailPicklists.map(detail => ({ ...detail }));
  console.log('Sending for availability check:', detailsForCheck);

  if (this.isCheckingAvailability) {
    return;
  }
  this.isCheckingAvailability = true;
  this.availabilityError = null;

  this.picklistService.checkInventoryAvailability(detailsForCheck).pipe(take(1)).subscribe({
    next: (availability) => {
      console.log('Availability response received:', availability);

      if (availability.length !== this.detailPicklists.length) {
        console.error('Availability response length mismatch');
        this._snackBar.open('Erreur de données de disponibilité', 'Erreur', { duration: 5000 });
        this.isCheckingAvailability = false;
        return;
      }

      const updatedDetails = this.detailPicklists.map((detail, index) => ({
        ...detail,
        isAvailable: availability[index].isAvailable,
        availableQuantity: availability[index].availableQuantity
      }));

      this.detailPicklists = updatedDetails;
      this.isAllAvailable = this.detailPicklists.every(detail => detail.isAvailable === true);

      this._snackBar.open('Disponibilité vérifiée.', 'Succès', { duration: 3000 });
      this.isCheckingAvailability = false;

      const dialogRef = this.dialog.open(AvailabilityDialogComponent, {
        width: '600px',
        data: { details: this.detailPicklists }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog closed with result:', result);
        this.generateBarcodes();
      });
    },
    error: (e) => {
      console.error('Error checking availability:', e);
      let errorMsg = 'Erreur lors de la vérification de la disponibilité';
      if (e.error && e.error.message) {
        errorMsg = e.error.message;
      }
      this.availabilityError = errorMsg;
      this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
      this.isCheckingAvailability = false;
    }
  });
}

deleteDetail(detailId: number): void {
  const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      title: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cet article ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    }
  });

  confirmDialog.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.picklistService.deleteDetailPicklist(detailId).subscribe({
        next: () => {
          this._snackBar.open('Article supprimé avec succès.', 'Succès', { duration: 3000 });
          this.loadDetailPicklists(this.picklistId);
        },
        error: (err) => {
          console.error('Error deleting detail:', err);
          this._snackBar.open('Erreur lors de la suppression de l\'article.', 'Erreur', { duration: 5000 });
        }
      });
    }
  });
}

  generateBarcodes() {
    // Use setTimeout to ensure the view is fully rendered before accessing elements
    setTimeout(() => {
      if (this.barcodeElements && this.barcodeElements.length > 0) {
        this.barcodeElements.forEach((el: ElementRef, index: number) => {
          const code = this.detailPicklists[index]?.article?.codeProduit || '000000';
          // console.log(`Generating barcode for detail ${index}: ${code}`); // Optional debug log

          JsBarcode(el.nativeElement, code, {
            format: 'CODE128',
            lineColor: '#FFFFFF',
            background: '#374151', // Tailwind's gray-700
            width: 2,
            height: 24,
            displayValue: true,
            // Add error handling for barcode generation
            // Note: JsBarcode doesn't have a direct error callback in this syntax,
            // but invalid codes usually result in a default barcode or placeholder.
          });
        });
      }
    }, 0); // Very short delay, mainly to push to the end of the execution queue
  }

  calculateTotalQuantity() {
    this.totalPicklistQuantity = this.detailPicklists.reduce((sum, detail) => {
      const quantite = parseInt(detail.quantite, 10);
      return sum + (isNaN(quantite) ? 0 : quantite);
    }, 0);
    console.log('Total Picklist Quantity Calculated:', this.totalPicklistQuantity);
  }

   ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.picklistId = +params['id'];
      if (this.picklistId) {
         this.loadPicklist();
         this.loadDetailPicklists(this.picklistId);
         this.loadArticles(); // Charger les articles au démarrage
         this.loadSapEntries(); // ✅ Load SAP entries for dropdown
      } else {
         this._snackBar.open('ID de picklist invalide', 'Erreur', { duration: 5000 });
      }
    });
  }

  // --- NOUVEAUTÉ : Charger les articles ---
loadArticles(): void {
  this.picklistService.getArticles().subscribe({
    next: (articles) => {
      this.articles = articles;
      console.log('Articles loaded:', this.articles);
    },
    error: (err) => {
      console.error('Error loading articles:', err);
      this._snackBar.open('Erreur lors du chargement des articles', 'Erreur', { duration: 5000 });
    }
  });
}

// ✅ NEW: Load SAP entries for dropdown
loadSapEntries(): void {
  this.sapLoading = true;
  this.sapError = null;
  this.picklistService.getSapEntries().subscribe({
    next: (entries) => {
      this.sapEntries = entries;
      this.sapLoading = false;
      console.log('SAP entries loaded:', this.sapEntries);
    },
    error: (err) => {
      console.error('Error loading SAP entries:', err);
      this.sapLoading = false;
      this.sapError = 'Erreur lors du chargement des articles SAP';
      this._snackBar.open('Erreur lors du chargement des articles SAP', 'Erreur', { duration: 5000 });
    }
  });
}


  

  loadPicklist() {
    this.picklistService.getPicklistById(this.picklistId).subscribe({
      next: (p) => {
        this.picklist = p;
        console.log('Picklist loaded:', this.picklist);
      },
      error: (e) => {
        console.error('Error loading picklist:', e);
        this._snackBar.open('Erreur chargement picklist', 'Erreur', { duration: 5000 });
      }
    });
  }

  loadDetailPicklists(id: number) {
    this.picklistService.loadDetailPicklists(id).subscribe({
      next: (d) => {
        this.detailPicklists = d;
        console.log('Detail Picklists loaded:', this.detailPicklists);

        // Calculate total quantity after loading details
        this.calculateTotalQuantity();

        // Check availability after loading details (optional, can be triggered by button click)
        // this.checkAvailability();

        // Generate barcodes after loading details
        this.generateBarcodes(); // This now uses setTimeout internally
      },
      error: e => {
        console.error('Error loading detail picklists:', e);
        // Provide more specific error message if possible from e.error.message
        let errorMsg = 'Erreur chargement détails';
        if (e.error && e.error.message) {
            errorMsg = e.error.message;
        }
        this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
      }
    });
  }

  // 🔄 NOUVEAU : Ouvrir le dialogue de scan
  openScanDialog(detail: any): void {
    const dialogRef = this.dialog.open(ScanDialogComponent, {
      width: '400px',
      data: { 
        detail: detail,
        articleCode: detail.article?.codeProduit || '',
        quantite: detail.quantite || '1'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'scanned') {
        this._snackBar.open('✅ Scan enregistré avec succès ! MovementTrace créé automatiquement.', 'Succès', { 
          duration: 5000 
        });
        // Optionnel : Recharger les détails pour voir les changements
        // this.loadDetailPicklists(this.picklistId);
      }
    });
  }
}


@Component({
  selector: 'app-availability-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatButtonModule], // Added MatButtonModule
  template: `
    <h1 mat-dialog-title>Vérification de la Disponibilité</h1>
    <div mat-dialog-content>
      <table mat-table [dataSource]="data.details" class="min-w-full">
        <!-- Article Column -->
        <ng-container matColumnDef="article">
          <th mat-header-cell *matHeaderCellDef class="px-4 py-2 text-left">Article</th>
          <td mat-cell *matCellDef="let detail" class="px-4 py-2 border-b">{{ detail.article?.designation }}</td>
        </ng-container>

        <!-- Required Quantity Column -->
        <ng-container matColumnDef="quantite">
          <th mat-header-cell *matHeaderCellDef class="px-4 py-2 text-left">Quantité Requise</th>
          <td mat-cell *matCellDef="let detail" class="px-4 py-2 border-b">{{ detail.quantite }}</td>
        </ng-container>

        <!-- Availability Column -->
        <ng-container matColumnDef="available">
          <th mat-header-cell *matHeaderCellDef class="px-4 py-2 text-left">Disponibilité</th>
          <td mat-cell *matCellDef="let detail" class="px-4 py-2 border-b">
            <span [ngClass]="{
              'text-green-400 font-semibold': detail.isAvailable === true,
              'text-red-400 font-semibold': detail.isAvailable === false,
              'text-yellow-400': detail.isAvailable !== true && detail.isAvailable !== false
            }">
              <span *ngIf="detail.isAvailable === true">Disponible</span>
              <span *ngIf="detail.isAvailable === false">Non disponible</span>
              <span *ngIf="detail.isAvailable !== true && detail.isAvailable !== false">Vérification...</span>
              <span *ngIf="detail.availableQuantity !== undefined"> ({{ detail.availableQuantity }})</span>
            </span>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            [ngClass]="{
              'bg-green-900/30': row.isAvailable === true,
              'bg-red-900/30': row.isAvailable === false
            }"></tr>
      </table>
    </div>
    <div mat-dialog-actions class="flex justify-end p-4">
      <button mat-button (click)="onClose()">Fermer</button>
    </div>
  `,
  styles: [`
    /* Optional: Add basic table styling if not covered by global styles */
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; text-align: left; }
    th { background-color: #1f2937; /* gray-800 */ }
    tr:hover { background-color: #374151; /* gray-700 */ }
    .text-green-400 { color: #4ade80; } /* Tailwind green-400 */
    .text-red-400 { color: #f87171; }   /* Tailwind red-400 */
    .text-yellow-400 { color: #fbbf24; } /* Tailwind yellow-400 */
    .font-semibold { font-weight: 600; }
    .bg-green-900\\/30 { background-color: rgba(16, 185, 129, 0.1); } /* green-500 with opacity */
    .bg-red-900\\/30 { background-color: rgba(239, 68, 68, 0.1); }   /* red-500 with opacity */
  `]
})
export class AvailabilityDialogComponent {
  displayedColumns: string[] = ['article', 'quantite', 'available'];

  constructor(
    public dialogRef: MatDialogRef<AvailabilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { details: any[] }
  ) {
    // Optional: Log received data for debugging
    // console.log('Dialog received data:', data);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}



@Component({
  selector: 'app-add-detail-picklist-dialog',
  template: `
    <div class="flex flex-col w-full h-full">
      <!-- Header -->
      <div class="flex items-center justify-between py-4 px-6 border-b">
        <div class="text-lg font-medium">Ajouter un Détail à la Picklist #{{ data?.picklistId }}</div>
        <button mat-icon-button (click)="onCancel()" [disabled]="submitting">
          <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-auto overflow-y-auto p-6 md:p-8">
        <form [formGroup]="detailForm" (ngSubmit)="onSubmit()" class="flex flex-col">
          
          <!-- Article SAP Dropdown with Loading/Error/Empty states -->
          <div class="w-full">
            <!-- Loading State -->
            <div *ngIf="data?.sapLoading" class="flex items-center justify-center p-4 bg-gray-800 rounded mb-4">
              <mat-progress-spinner diameter="24" mode="indeterminate" class="mr-3"></mat-progress-spinner>
              <span class="text-gray-400">Chargement des articles SAP...</span>
            </div>

            <!-- Error State -->
            <div *ngIf="data?.sapError && !data?.sapLoading" class="p-4 bg-red-900/30 border border-red-500 rounded mb-4">
              <div class="flex items-center text-red-400">
                <mat-icon class="mr-2">error_outline</mat-icon>
                <span>{{ data.sapError }}</span>
              </div>
              <p class="text-sm text-gray-400 mt-2">Vérifiez la connexion SAP et réessayez.</p>
            </div>

            <!-- Empty State -->
            <div *ngIf="!data?.sapLoading && !data?.sapError && (!data?.sapEntries || data?.sapEntries?.length === 0)" 
                 class="p-4 bg-yellow-900/30 border border-yellow-500 rounded mb-4">
              <div class="flex items-center text-yellow-400">
                <mat-icon class="mr-2">warning</mat-icon>
                <span>Aucun article SAP disponible</span>
              </div>
              <p class="text-sm text-gray-400 mt-2">Aucun article n'est disponible dans le stock SAP.</p>
            </div>

            <!-- SAP Article Dropdown -->
            <mat-form-field class="w-full" *ngIf="!data?.sapLoading && !data?.sapError && data?.sapEntries?.length > 0">
              <mat-label>Sélectionner un Article SAP</mat-label>
              <mat-select formControlName="sapEntryId" required>
                <mat-option *ngFor="let sap of filteredSapEntries" [value]="sap.id">
                  <span class="font-mono">{{ sap.article }}</span> - {{ sap.usCode }} 
                  <span class="text-green-400 ml-2">(Qté: {{ sap.quantite }})</span>
                </mat-option>
              </mat-select>
              <mat-hint>Sélectionnez un article du stock SAP</mat-hint>
              <mat-error *ngIf="detailForm.get('sapEntryId')?.invalid && detailForm.get('sapEntryId')?.touched">
                La sélection d'un article SAP est requise.
              </mat-error>
            </mat-form-field>

            <!-- Search/Filter for SAP entries -->
            <mat-form-field class="w-full mt-2" *ngIf="!data?.sapLoading && !data?.sapError && data?.sapEntries?.length > 5">
              <mat-label>Rechercher un article</mat-label>
              <input matInput [(ngModel)]="sapSearchQuery" [ngModelOptions]="{standalone: true}" 
                     placeholder="Filtrer par code ou US..." (input)="filterSapEntries()">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <!-- Emplacement (champ texte libre) -->
          <mat-form-field class="w-full mt-4">
            <mat-label>Emplacement</mat-label>
            <input matInput formControlName="emplacement" placeholder="Entrez l'emplacement (ex: A1-B2-C3)" required>
            <mat-hint>Exemple: A1-B2-C3, Zone-A, etc.</mat-hint>
            <mat-error *ngIf="detailForm.get('emplacement')?.invalid && detailForm.get('emplacement')?.touched">
              L'emplacement est requis.
            </mat-error>
          </mat-form-field>

          <!-- Quantité -->
          <mat-form-field class="w-full mt-4">
            <mat-label>Quantité</mat-label>
            <input matInput type="number" formControlName="quantite" placeholder="Entrez la quantité" required min="1">
            <mat-error *ngIf="detailForm.get('quantite')?.invalid && detailForm.get('quantite')?.touched">
              <span *ngIf="detailForm.get('quantite')?.errors?.['required']">La quantité est requise.</span>
              <span *ngIf="detailForm.get('quantite')?.errors?.['min']">La quantité doit être supérieure à 0.</span>
            </mat-error>
          </mat-form-field>

          <!-- Hidden fields -->
          <input type="hidden" formControlName="statusId">
          <input type="hidden" formControlName="picklistId">

          <!-- Actions -->
          <div class="flex items-center justify-end mt-6">
            <button mat-stroked-button type="button" (click)="onCancel()" [disabled]="submitting">
              Annuler
            </button>
            <button mat-flat-button color="primary" type="submit" class="ml-3" [disabled]="detailForm.invalid || submitting">
              <mat-progress-spinner *ngIf="submitting" diameter="20" mode="indeterminate" class="mr-2"></mat-progress-spinner>
              <span *ngIf="!submitting">Ajouter Détail</span>
              <span *ngIf="submitting">Ajout...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }
    .mat-mdc-form-field { width: 100%; }
    mat-progress-spinner { display: inline-block; vertical-align: middle; }
  `],
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
    MatProgressSpinnerModule
  ]
})
export class AddDetailPicklistDialogComponent implements OnInit {
  detailForm: FormGroup;
  submitting = false;
  sapSearchQuery: string = '';
  filteredSapEntries: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private _formBuilder: FormBuilder,
    private _picklistService: PicklistService,
    public dialogRef: MatDialogRef<AddDetailPicklistDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { 
      picklistId: number; 
      articles: any[]; 
      sapEntries: any[];
      sapLoading: boolean;
      sapError: string | null;
    }
  ) {
    this.detailForm = this._formBuilder.group({
      sapEntryId: [null, [Validators.required, Validators.min(1)]],
      emplacement: ['', [Validators.required, Validators.minLength(1)]],
      quantite: ['', [Validators.required]],
      statusId: [1],
      picklistId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.data?.picklistId) {
      console.error('[AddDetailPicklistDialogComponent] Missing picklist ID.');
      this.dialogRef.close();
      return;
    }
    this.detailForm.patchValue({ picklistId: this.data.picklistId });
    // Initialize filtered SAP entries
    this.filteredSapEntries = this.data?.sapEntries || [];
  }

  // Filter SAP entries based on search query
  filterSapEntries(): void {
    if (!this.sapSearchQuery.trim()) {
      this.filteredSapEntries = this.data?.sapEntries || [];
      return;
    }
    const query = this.sapSearchQuery.toLowerCase().trim();
    this.filteredSapEntries = (this.data?.sapEntries || []).filter(sap => 
      sap.article?.toLowerCase().includes(query) || 
      sap.usCode?.toLowerCase().includes(query)
    );
  }

  onSubmit(): void {
    if (this.detailForm.invalid) {
      this.detailForm.markAllAsTouched();
      return;
    }

    // ✅ Guard against double submission
    if (this.submitting) {
      return;
    }
    this.submitting = true;
    const formData = this.detailForm.value;

    this._picklistService.createDetailPicklist(formData)
      .pipe(take(1), takeUntil(this.destroy$)) // ✅ Ensure single execution
      .subscribe({
        next: () => {
          this.submitting = false;
          this.dialogRef.close('created');
        },
        error: err => {
          this.submitting = false;
          let errorMsg = 'Erreur lors de la création du détail.';
          if (err.status === 400) errorMsg = 'Données de détail invalides.';
          else if (err.status === 404) errorMsg = 'Picklist, Article ou Statut non trouvé.';
          else if (err.status >= 500) errorMsg = 'Erreur serveur.';
          alert(errorMsg);
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close('cancelled');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
// --- Fin du composant AddDetailPicklistDialogComponent ---

// 🔄 Scan Dialog Component
@Component({
  selector: 'app-scan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="flex flex-col w-full h-full">
      <div class="flex items-center justify-between py-4 px-6 border-b">
        <div class="text-lg font-medium">📱 Scanner l'article</div>
        <button mat-icon-button (click)="onCancel()" [disabled]="scanning">
          <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
        </button>
      </div>

      <div class="flex-auto overflow-y-auto p-6">
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">Article: <strong>{{ data.articleCode }}</strong></p>
          <p class="text-sm text-gray-600">Quantité: <strong>{{ data.quantite }}</strong></p>
        </div>

        <mat-form-field class="w-full">
          <mat-label>Code scanné</mat-label>
          <input 
            matInput 
            [(ngModel)]="scannedCode" 
            placeholder="Entrez le code ou scannez avec votre téléphone"
            (keydown.enter)="onScan()"
            autofocus
          />
          <mat-hint>Utilisez une app de scan sur votre téléphone ou entrez le code manuellement</mat-hint>
        </mat-form-field>

        <div class="mt-4 p-4 bg-blue-50 rounded">
          <p class="text-sm text-blue-800">
            💡 <strong>Astuce :</strong> Utilisez une app de scan de code-barres sur votre téléphone, 
            scannez le code affiché ci-dessus, puis copiez-collez le résultat ici.
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end p-4 border-t gap-3">
        <button mat-stroked-button (click)="onCancel()" [disabled]="scanning">
          Annuler
        </button>
        <button 
          mat-flat-button 
          color="primary" 
          (click)="onScan()" 
          [disabled]="!scannedCode || scanning"
        >
          <mat-progress-spinner *ngIf="scanning" diameter="20" mode="indeterminate" class="mr-2"></mat-progress-spinner>
          <mat-icon *ngIf="!scanning">check</mat-icon>
          <span class="ml-2">{{ scanning ? 'Enregistrement...' : 'Enregistrer le scan' }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }
  `]
})
export class ScanDialogComponent {
  scannedCode: string = '';
  scanning = false;

  constructor(
    private _picklistService: PicklistService,
    private _userService: UserService,
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ScanDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { 
      detail: any; 
      articleCode: string; 
      quantite: string 
    }
  ) {
    // Pré-remplir avec le code produit par défaut
    this.scannedCode = data.articleCode;
  }

  onScan(): void {
    if (!this.scannedCode.trim()) {
      this._snackBar.open('Veuillez entrer un code', 'Erreur', { duration: 3000 });
      return;
    }

    this.scanning = true;

    // Récupérer l'ID de l'utilisateur actuel
    let currentUserId: number | null = null;
    this._userService.user$.pipe(take(1)).subscribe((user: any) => {
      currentUserId = user?.id || null;

      if (!currentUserId) {
        this.scanning = false;
        this._snackBar.open('Utilisateur non identifié', 'Erreur', { duration: 3000 });
        return;
      }

      // Créer le PicklistUs (scan)
      const picklistUsDto = {
        nom: this.scannedCode.trim(),
        quantite: this.data.quantite || '1',
        userId: currentUserId,
        detailPicklistId: this.data.detail.id,
        statusId: 1 // Statut par défaut
      };

      console.log('[ScanDialog] Création du PicklistUs:', picklistUsDto);

      this._picklistService.createPicklistUs(picklistUsDto).subscribe({
        next: (result) => {
          console.log('[ScanDialog] ✅ PicklistUs créé avec succès:', result);
          this.scanning = false;
          this._snackBar.open('✅ Scan enregistré ! MovementTrace créé automatiquement.', 'Succès', { 
            duration: 4000 
          });
          this.dialogRef.close('scanned');
        },
        error: (err) => {
          console.error('[ScanDialog] Erreur lors du scan:', err);
          this.scanning = false;
          let errorMsg = 'Erreur lors de l\'enregistrement du scan.';
          if (err.error?.message) {
            errorMsg = err.error.message;
          }
          this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
        }
      });
    });
  }

  onCancel(): void {
    this.dialogRef.close('cancelled');
  }
}

// Confirmation Dialog Component
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-6">
      <h2 mat-dialog-title class="text-xl font-semibold text-white mb-4">{{ data.title }}</h2>
      <div mat-dialog-content class="mb-6">
        <p class="text-gray-300">{{ data.message }}</p>
      </div>
      <div mat-dialog-actions class="flex justify-end space-x-3">
        <button mat-button (click)="onCancel()" class="text-gray-400 hover:text-white">
          {{ data.cancelText || 'Annuler' }}
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          {{ data.confirmText || 'Confirmer' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
    }
  ) {}

  onConfirm(): void {
    this.dialogRef.close('confirm');
  }

  onCancel(): void {
    this.dialogRef.close('cancel');
  }
}