import { AfterViewInit, Component, ElementRef, Inject, OnInit, Optional, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
import { concat, concatMap, from, Observable, Subject, takeUntil } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LocationService } from '../../location/location.service';

@Component({
  selector: 'app-details',
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
    MatSnackBarModule
  ],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  // Property to hold the calculated total quantity
  totalPicklistQuantity: number = 0;
  isAllAvailable: boolean = false; // Initialize
  private _unsubscribeAll: Subject<any> = new Subject<any>();
    articles: any[] = []; // Ajouter cette propriété pour stocker les articles


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
    const updateData = {
      name: this.picklist.name,
      type: this.picklist.type,

      quantity: this.totalPicklistQuantity?.toString() ?? this.picklist.quantity, 
      lineId: this.picklist.line?.id ?? this.picklist.lineId, // Use nested object or direct ID
      warehouseId: this.picklist.warehouse?.id ?? this.picklist.warehouseId, // Use nested object or direct ID
     
      statusId: 2 
    };

    console.log(`Updating picklist ${this.picklistId} with data:`, updateData); // Debug log

    // 2. Call the update service method
    this.picklistService.updatePicklist(this.picklistId, updateData).subscribe({
      next: (response) => { // Handle successful response
        console.log('Picklist updated successfully:', response);
        this._snackBar.open('Picklist envoyée avec succès', 'Succès', { duration: 3000 });
        
        // 3. Refresh picklist data to reflect the change
        this.loadPicklist(); 
        this.createMovementTracesForPicklist();
        // If details also show status, reload them too
        // this.loadDetailPicklists(this.picklistId); 
      },
      error: (e) => { // Handle errors
        console.error('Error sending picklist:', e);
        // Try to get a more specific error message from the backend response
        let errorMsg = 'Erreur lors de l\'envoi de la picklist';
        if (e.error && e.error.message) {
          errorMsg = e.error.message;
        } else if (e.message) {
          errorMsg = e.message;
        }
        this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 }); // Longer duration for errors
      }
    });
  } else {
    // Provide feedback if conditions aren't met
    if (!this.picklist) {
        this._snackBar.open('Données de picklist non chargées', 'Erreur', { duration: 5000 });
    } else if (!this.isAllAvailable) {
        this._snackBar.open('Certaines quantités ne sont pas disponibles', 'Erreur', { duration: 5000 });
    }
  }
}

  openAddDetailDialog(): void {
    console.log(`[DetailsComponent] Ouverture du dialogue d'ajout de détail pour la Picklist ID ${this.picklistId}`);
    
  const dialogRef =  this.dialog.open(AddDetailPicklistDialogComponent, {
  minWidth: '400px',
  disableClose: false,
  autoFocus: true,
  data: { picklistId: this.picklistId, articles: this.articles }
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
          this._snackBar.open(`Erreur lors de l'enregistrement d'un mouvement.`, 'Erreur', { duration: 5000 });
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



checkAvailabilityAndShowDialog() {
  if (this.detailPicklists.length === 0) {
    this._snackBar.open('Aucun détail à vérifier.', 'Info', { duration: 3000 });
    return;
  }

  // Prepare data for the backend check (same as before)
  const detailsForCheck = this.detailPicklists.map(detail => ({ ...detail }));

  this.picklistService.checkInventoryAvailability(detailsForCheck).subscribe({
    next: (availability) => {
      if (availability.length !== this.detailPicklists.length) {
        console.error('Availability response length mismatch');
        this._snackBar.open('Erreur de données de disponibilité', 'Erreur', { duration: 5000 });
        return;
      }

      // Update detailPicklists with availability information (same as before)
      this.detailPicklists = this.detailPicklists.map((detail, index) => ({
        ...detail,
        isAvailable: availability[index].isAvailable,
        availableQuantity: availability[index].availableQuantity
      }));

      // Determine if all items are available (same as before)
      this.isAllAvailable = this.detailPicklists.every(detail => detail.isAvailable === true);

      this._snackBar.open('Disponibilité vérifiée.', 'Succès', { duration: 3000 });

      // --- Open the dialog AFTER the data is updated ---
      const dialogRef = this.dialog.open(AvailabilityDialogComponent, {
        width: '600px',
        data: { details: this.detailPicklists } // Now passes updated data
      });

      dialogRef.afterClosed().subscribe(result => {
        // Handle dialog close if needed (e.g., refresh parent component)
        // Note: Calling checkAvailability again here might be redundant
        // unless the dialog itself can modify inventory/trigger a recheck.
        // if (result) {
        //   this.checkAvailability(); // Remove this to avoid loop
        // }
      });
    },
    error: (e) => {
      console.error('Error checking availability:', e);
      let errorMsg = 'Erreur lors de la vérification de la disponibilité';
      if (e.error && e.error.message) {
        errorMsg = e.error.message;
      }
      this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
    
    }
  });
}





checkAvailability() {
  if (this.detailPicklists.length === 0) {
    this._snackBar.open('Aucun détail à vérifier.', 'Info', { duration: 3000 });
    return;
  }

  // Prepare data for the backend check
  // Send the detail picklist items. The backend should be able to identify them
  // via their 'id' field to correlate with the response.
  const detailsForCheck = this.detailPicklists.map(detail => ({
    // Send the whole detail object or just the ID if the backend only needs that for correlation.
    // Sending the whole object is safer if the backend needs other fields for the check.
    ...detail
    // Alternatively, if backend only needs ID:
    // id: detail.id
  }));
  console.log('Sending for availability check:', detailsForCheck);

  this.picklistService.checkInventoryAvailability(detailsForCheck).subscribe({
    next: (availability) => { // Type this properly if you have the DTO interface
      console.log('Availability response received:', availability);
      if (availability.length !== this.detailPicklists.length) {
        console.error('Availability response length mismatch');
        this._snackBar.open('Erreur de données de disponibilité', 'Erreur', { duration: 5000 });
        return;
      }

      // --- KEY CHANGE HERE ---
      // Update detailPicklists by *merging* availability info, not replacing objects
      // Use map to create a new array, ensuring change detection works
      const updatedDetails = this.detailPicklists.map((detail, index) => ({
        // Spread the original detail object to keep all its properties
        ...detail,
        // Add or overwrite the availability properties from the response
        isAvailable: availability[index].isAvailable,
        availableQuantity: availability[index].availableQuantity
        // requestedQuantity and codeProduit are in the response but might not be needed
        // on the main object if they are already present (e.g., detail.quantite, detail.article?.codeProduit)
        // requestedQuantity: availability[index].requestedQuantity,
        // codeProduit: availability[index].codeProduit
      }));

      // 1. Update the component's property with the merged data
      this.detailPicklists = updatedDetails;
      console.log(this.detailPicklists);
      

      // 2. Determine if all items are available
      this.isAllAvailable = this.detailPicklists.every(detail => detail.isAvailable === true);
      console.log('All items available:', this.isAllAvailable);

      // 3. Show success snackbar
      this._snackBar.open('Disponibilité vérifiée.', 'Succès', { duration: 3000 });

      // 4. --- Open the dialog AFTER the data is updated ---
      const dialogRef = this.dialog.open(AvailabilityDialogComponent, {
        width: '600px',
        // Pass the updated data
        data: { details: this.detailPicklists } // or [...this.detailPicklists]
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Dialog closed with result:', result);
        this.generateBarcodes();
        // Handle dialog close if needed in the future
      });
    },
    error: (e) => {
      console.error('Error checking availability:', e);
      let errorMsg = 'Erreur lors de la vérification de la disponibilité';
      if (e.error && e.error.message) {
        errorMsg = e.error.message;
      }
      this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
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
          
          <!-- Article -->
          <mat-form-field class="w-full">
            <mat-label>Sélectionner un Article</mat-label>
            <mat-select formControlName="articleId" required>
              <mat-option *ngFor="let article of data?.articles" [value]="article.id">
                {{ article.codeProduit }} - {{ article.designation }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="detailForm.get('articleId')?.invalid && detailForm.get('articleId')?.touched">
              La sélection d'un article est requise.
            </mat-error>
          </mat-form-field>

          <!-- Location (sets emplacement) -->
          <mat-form-field class="w-full mt-4">
            <mat-label>Emplacement</mat-label>
            <mat-select [value]="detailForm.get('emplacement')?.value" (selectionChange)="onLocationSelect($event.value)" required>
              <mat-option *ngFor="let loc of locations" [value]="loc.code">
                {{ loc.code }} - {{ loc.designation }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="detailForm.get('emplacement')?.invalid && detailForm.get('emplacement')?.touched">
              L'emplacement est requis.
            </mat-error>
          </mat-form-field>

          <!-- Quantité -->
          <mat-form-field class="w-full mt-4">
            <mat-label>Quantité</mat-label>
            <input matInput type="text" formControlName="quantite" placeholder="Entrez la quantité" required>
            <mat-error *ngIf="detailForm.get('quantite')?.invalid && detailForm.get('quantite')?.touched">
              La quantité est requise.
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
  locations: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private _formBuilder: FormBuilder,
    private _picklistService: PicklistService,
    private _locationService: LocationService,
    public dialogRef: MatDialogRef<AddDetailPicklistDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { picklistId: number; articles: any[] }
  ) {
    this.detailForm = this._formBuilder.group({
      articleId: [null, [Validators.required, Validators.min(1)]],
      emplacement: ['', [Validators.required]],
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

    // Load locations
    this._locationService.getLocations(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: locs => this.locations = locs,
        error: err => console.error('Error loading locations:', err)
      });
  }

  onLocationSelect(code: string): void {
    this.detailForm.get('emplacement')?.setValue(code);
  }

  onSubmit(): void {
    if (this.detailForm.invalid) {
      this.detailForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formData = this.detailForm.value;

    this._picklistService.createDetailPicklist(formData)
      .pipe(takeUntil(this.destroy$))
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