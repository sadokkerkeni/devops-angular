import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReturnLineCreateDto, ReturnLineReadDto, ReturnLineUpdateDto, ReturnService } from './return.service';
import { Subject, takeUntil, Unsubscribable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';



@Component({
  selector: 'app-return-line',
  standalone: true,
  imports: [
    MatSnackBarModule,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatCardModule,
    MatSlideToggleModule,
    MatTooltipModule,
    HttpClientModule // Nécessaire pour le HttpClient dans ReturnLineService
  ],
  templateUrl: './return-line.component.html',
  styleUrls: ['./return-line.component.scss']
})

export class ReturnLineComponent implements OnInit, OnDestroy {
  returnLines: ReturnLineReadDto[] = [];
  groupedByUser: Array<{ userName: string, items: ReturnLineReadDto[] }> = [];
  loading: boolean = false;
  isActiveFilter: boolean = true; // Placeholder, voir note dans le template
  displayedColumns: string[] = ['id', 'dateRetour', 'quantite', 'articleId', 'userId', 'statusId', 'actions'];

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _formBuilder: FormBuilder,
    private _returnLineService: ReturnService,
    private _matDialog: MatDialog,
    
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReturnLines();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadReturnLines(): void {
    this.loading = true;
    this._returnLineService.getAll()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.returnLines = data || [];
          const groups: { [key: string]: ReturnLineReadDto[] } = {};
          for (const r of this.returnLines) {
            const key = (r.userName || '—').toString();
            if (!groups[key]) groups[key] = [];
            groups[key].push(r);
          }
          this.groupedByUser = Object.keys(groups).map(k => ({ userName: k, items: groups[k] }));
          this.loading = false;
        },
        error: (err) => {
          console.error('[ReturnLineComponent] Erreur lors du chargement des retours:', err);
          this._snackBar.open('Erreur lors du chargement des retours.', 'Erreur', { duration: 5000 });
          this.loading = false;
          this.returnLines = [];
          this.groupedByUser = [];
        }
      });
  }

  toggleActiveFilter(): void {
    // Placeholder pour le filtre. A adapter selon tes besoins (ex: filtrer par statut).
    this.isActiveFilter = !this.isActiveFilter;
    // this.loadReturnLines(); // Recharger si le filtre affecte l'API
    console.log('[ReturnLineComponent] Filtre actif/inactif basculé (placeholder):', this.isActiveFilter);
  }

  openCreateDialog(): void {
  const dialogRef = this._matDialog.open(ReturnLineCreateComponent, {
    minWidth: '600px',
    maxHeight: '90vh', // ✅ Limit height of modal
    disableClose: false,
    autoFocus: true,
    panelClass: 'custom-dialog-container' // ✅ Optional for custom styles
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'created') {
      this._snackBar.open('Retour créé avec succès.', 'Succès', { duration: 3000 });
      this.loadReturnLines();
    }
  });
}

  openEditDialog(returnLine: ReturnLineReadDto): void {
    console.log('[ReturnLineComponent] Ouverture du dialogue d\'édition pour ID:', returnLine.id);
    const dialogRef = this._matDialog.open(ReturnLineEditComponent, {
       width: '800px',
  maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
       data: { returnLineData: returnLine } 
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('[ReturnLineComponent] Dialogue d\'édition fermé avec le résultat:', result);
      if (result === 'updated') {
        this._snackBar.open('Retour mis à jour avec succès.', 'Succès', { duration: 3000 });
        this.loadReturnLines(); // Recharger la liste
      }
      // Gérer 'cancelled' ou d'autres résultats si nécessaire
    });
  }

  openViewDialog(returnLine: ReturnLineReadDto): void {
    console.log('[ReturnLineComponent] Ouverture du dialogue de visualisation pour ID:', returnLine.id);
    this._matDialog.open(ReturnLineViewComponent, {
      minWidth: '400px',
      disableClose: false,
      autoFocus: true,
       data: { returnLineData: returnLine } 
    });
  }

  openDeleteDialog(id: number): void {
    console.log('[ReturnLineComponent] Ouverture du dialogue de suppression pour ID:', id);
    const dialogRef = this._matDialog.open(ReturnLineDeleteComponent, {
      minWidth: '300px',
      disableClose: false,
      autoFocus: true,
       data: { returnLineData: id } 
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('[ReturnLineComponent] Dialogue de suppression fermé avec le résultat:', result);
      if (result === 'deleted') {
        this._snackBar.open('Retour supprimé avec succès.', 'Succès', { duration: 3000 });
        this.loadReturnLines(); // Recharger la liste
      }
      // Gérer 'cancelled' ou d'autres résultats si nécessaire
    });
  }

  // openStatusDialog(returnLine: ReturnLineReadDto): void {
  //   // Placeholder pour un dialogue de changement de statut
  // }
}
// --- Fin du composant ReturnLineComponent ---

// --- Return Line Create Component (dans le même fichier) ---
@Component({
  selector: 'app-return-line-create-dialog',
  template: `<!-- Template pour ReturnLineCreateComponent -->
<div class="dialog-container flex flex-col w-full h-full overflow-y-auto">
  <!-- Dialog Header (Fixed) -->
  <div class="dialog-header flex items-center justify-between py-4 px-6 border-b flex-shrink-0">
    <div class="text-lg font-medium">Créer un Retour Ligne</div>
    <button mat-icon-button (click)="onCancel()" [disabled]="submitting" aria-label="Fermer">
      <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
    </button>
  </div>

  <!-- Scrollable Dialog Content -->
  <div class="dialog-content flex-auto overflow-y-auto p-6 md:p-8">
    <form [formGroup]="returnLineForm" (ngSubmit)="onSubmit()" class="flex flex-col">
      
      <!-- DateRetour -->
      <mat-form-field class="w-full">
        <mat-label>Date du Retour</mat-label>
        <input matInput type="datetime-local" formControlName="dateRetour" required>
        <mat-error *ngIf="returnLineForm.get('dateRetour')?.invalid && returnLineForm.get('dateRetour')?.touched">
          La date du retour est requise.
        </mat-error>
      </mat-form-field>

      <!-- Quantite -->
      <mat-form-field class="w-full mt-4">
        <mat-label>Quantité</mat-label>
        <input matInput type="text" formControlName="quantite" placeholder="Entrez la quantité" required>
        <mat-error *ngIf="returnLineForm.get('quantite')?.invalid && returnLineForm.get('quantite')?.touched">
          La quantité est requise.
        </mat-error>
      </mat-form-field>

      <!-- UsCode -->
      <!-- <mat-form-field class="w-full mt-4">
        <mat-label>Code US</mat-label>
        <input matInput formControlName="usCode" placeholder="Entrez le code US" required>
        <mat-error *ngIf="returnLineForm.get('usCode')?.invalid && returnLineForm.get('usCode')?.touched">
          Le code US est requis.
        </mat-error>
      </mat-form-field> -->

      <!-- ArticleId -->
      <mat-form-field class="w-full mt-4">
        <mat-label>ID Article</mat-label>
        <input matInput type="number" formControlName="articleId" placeholder="Entrez l'ID de l'article" required min="1">
        <mat-error *ngIf="returnLineForm.get('articleId')?.invalid && returnLineForm.get('articleId')?.touched">
          <span *ngIf="returnLineForm.get('articleId')?.errors?.['required']">L'ID de l'article est requis.</span>
          <span *ngIf="returnLineForm.get('articleId')?.errors?.['min']">L'ID doit être positif.</span>
        </mat-error>
      </mat-form-field>

      <!-- UserId -->
      <mat-form-field class="w-full mt-4">
        <mat-label>ID Utilisateur</mat-label>
        <input matInput type="number" formControlName="userId" placeholder="Entrez l'ID de l'utilisateur" required min="1">
        <mat-error *ngIf="returnLineForm.get('userId')?.invalid && returnLineForm.get('userId')?.touched">
          <span *ngIf="returnLineForm.get('userId')?.errors?.['required']">L'ID de l'utilisateur est requis.</span>
          <span *ngIf="returnLineForm.get('userId')?.errors?.['min']">L'ID doit être positif.</span>
        </mat-error>
      </mat-form-field>

      <!-- StatusId -->
      <mat-form-field class="w-full mt-4">
        <mat-label>ID Statut</mat-label>
        <input matInput type="number" formControlName="statusId" placeholder="Entrez l'ID du statut" required min="1">
        <mat-error *ngIf="returnLineForm.get('statusId')?.invalid && returnLineForm.get('statusId')?.touched">
          <span *ngIf="returnLineForm.get('statusId')?.errors?.['required']">L'ID du statut est requis.</span>
          <span *ngIf="returnLineForm.get('statusId')?.errors?.['min']">L'ID doit être positif.</span>
        </mat-error>
      </mat-form-field>

      <!-- Action Buttons -->
      <div class="form-actions flex items-center justify-end mt-6 flex-shrink-0">
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
          [disabled]="returnLineForm.invalid || submitting"
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
</div>`,
  styles: [`
  :host {
  display: block;
  height: 100%;
  overflow: hidden; /* Prevent parent overflow */
}

.dialog-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; /* Prevent outer scroll */
}

.dialog-header {
  flex-shrink: 0; /* Fixed header */
}

.dialog-content {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0; /* ✅ Important: allows content to scroll in flexbox */
}

.form-actions {
  flex-shrink: 0;
}

`],
  standalone: true,
  imports: [
    MatSnackBarModule,
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
export class ReturnLineCreateComponent implements OnInit {
  returnLineForm: FormGroup;
  submitting: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { returnLineData: any },
    private _formBuilder: FormBuilder,
    private _returnLineService: ReturnService,
    public dialogRef: MatDialogRef<ReturnLineCreateComponent>,
    private _snackBar: MatSnackBar
  ) {
    this.returnLineForm = this._formBuilder.group({
      dateRetour: ['', [Validators.required]], // datetime-local renvoie une chaîne
      quantite: ['', [Validators.required]],
      // usCode: ['', [Validators.required]],
      articleId: [null, [Validators.required, Validators.min(1)]],
      userId: [null, [Validators.required, Validators.min(1)]], // ID de l'utilisateur effectuant le retour
      statusId: [1, [Validators.required, Validators.min(1)]]  // Statut initial, ex: 1 = "En Attente"
    });
  }

  ngOnInit(): void {
    // Optionnel : Définir la date actuelle par défaut
    // const now = new Date().toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:mm
    // this.returnLineForm.patchValue({ dateRetour: now });
  }

  onSubmit(): void {
    if (this.returnLineForm.invalid) {
      this.returnLineForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formData: ReturnLineCreateDto= this.returnLineForm.value;

    console.log('[ReturnLineCreateComponent] Appel du service pour créer un retour:', formData);
    this._returnLineService.create(formData)
      .pipe(takeUntil(this._unsubscribeAll)) // Assurez-vous que _unsubscribeAll est accessible ou créez-en un local
      .subscribe({
        next: (response) => {
          console.log('[ReturnLineCreateComponent] Retour créé avec succès:', response);
          this.submitting = false;
          this._snackBar.open('Retour créé avec succès.', 'Succès', { duration: 3000 });
          this.dialogRef.close('created');
        },
        error: (err) => {
          console.error('[ReturnLineCreateComponent] Erreur lors de la création du retour:', err);
          this.submitting = false;
          // Afficher un message d'erreur plus détaillé si possible
          let errorMsg = 'Erreur lors de la création du retour.';
          if (err.status === 400) {
            errorMsg = 'Données de retour invalides.';
          } else if (err.status === 404) {
            errorMsg = 'Article, Utilisateur ou Statut non trouvé.';
          } else if (err.status >= 500) {
            errorMsg = 'Erreur serveur.';
          }
          this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
          // Ne pas fermer le dialogue pour permettre à l'utilisateur de corriger
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close('cancelled');
  }
}
// --- Fin du composant ReturnLineCreateComponent ---

// --- Return Line Edit Component (dans le même fichier) ---
@Component({
  selector: 'app-return-line-edit-dialog',
  template: `
    <div class="flex flex-col w-full h-full">
      <!-- Dialog Header -->
      <div class="flex items-center justify-between py-4 px-6 border-b">
        <div class="text-lg font-medium">Modifier le Retour Ligne (ID: {{ data?.returnLineData?.id }})</div>
        <button mat-icon-button (click)="onCancel()" [disabled]="submitting">
          <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
        </button>
      </div>

      <!-- Dialog Content -->
      <div class="flex-auto overflow-y-auto p-6 md:p-8">
        <form [formGroup]="returnLineForm" (ngSubmit)="onSubmit()" class="flex flex-col">
          <!-- DateRetour -->
          <mat-form-field class="w-full">
            <mat-label>Date du Retour</mat-label>
            <input matInput type="datetime-local" formControlName="dateRetour" required>
            <mat-error *ngIf="returnLineForm.get('dateRetour')?.invalid && returnLineForm.get('dateRetour')?.touched">
              La date du retour est requise.
            </mat-error>
          </mat-form-field>

          <!-- Quantite -->
          <mat-form-field class="w-full mt-4">
            <mat-label>Quantité</mat-label>
            <input matInput type="text" formControlName="quantite" placeholder="Entrez la quantité" required>
            <mat-error *ngIf="returnLineForm.get('quantite')?.invalid && returnLineForm.get('quantite')?.touched">
              La quantité est requise.
            </mat-error>
          </mat-form-field>

          <!-- UsCode -->
          <!-- <mat-form-field class="w-full mt-4">
            <mat-label>Code US</mat-label>
            <input matInput formControlName="usCode" placeholder="Entrez le code US" required>
            <mat-error *ngIf="returnLineForm.get('usCode')?.invalid && returnLineForm.get('usCode')?.touched">
              Le code US est requis.
            </mat-error>
          </mat-form-field> -->

          <!-- ArticleId -->
          <mat-form-field class="w-full mt-4">
            <mat-label>ID Article</mat-label>
            <input matInput type="number" formControlName="articleId" placeholder="Entrez l'ID de l'article" required min="1">
            <mat-error *ngIf="returnLineForm.get('articleId')?.invalid && returnLineForm.get('articleId')?.touched">
              <span *ngIf="returnLineForm.get('articleId')?.errors?.['required']">L'ID de l'article est requis.</span>
              <span *ngIf="returnLineForm.get('articleId')?.errors?.['min']">L'ID doit être positif.</span>
            </mat-error>
          </mat-form-field>

          <!-- UserId -->
          <mat-form-field class="w-full mt-4">
            <mat-label>ID Utilisateur</mat-label>
            <input matInput type="number" formControlName="userId" placeholder="Entrez l'ID de l'utilisateur" required min="1">
            <mat-error *ngIf="returnLineForm.get('userId')?.invalid && returnLineForm.get('userId')?.touched">
              <span *ngIf="returnLineForm.get('userId')?.errors?.['required']">L'ID de l'utilisateur est requis.</span>
              <span *ngIf="returnLineForm.get('userId')?.errors?.['min']">L'ID doit être positif.</span>
            </mat-error>
          </mat-form-field>

          <!-- StatusId -->
          <mat-form-field class="w-full mt-4">
            <mat-label>ID Statut</mat-label>
            <input matInput type="number" formControlName="statusId" placeholder="Entrez l'ID du statut" required min="1">
            <mat-error *ngIf="returnLineForm.get('statusId')?.invalid && returnLineForm.get('statusId')?.touched">
              <span *ngIf="returnLineForm.get('statusId')?.errors?.['required']">L'ID du statut est requis.</span>
              <span *ngIf="returnLineForm.get('statusId')?.errors?.['min']">L'ID doit être positif.</span>
            </mat-error>
          </mat-form-field>

          <!-- Action Buttons -->
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
              [disabled]="returnLineForm.invalid || submitting"
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
    MatSnackBarModule,
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
export class ReturnLineEditComponent implements OnInit {
  returnLineForm: FormGroup;
  submitting: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>(); // Pour gérer les subscriptions

  constructor(
    
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { returnLineData: any },
    private _formBuilder: FormBuilder,
    private _returnLineService: ReturnService,
    public dialogRef: MatDialogRef<ReturnLineEditComponent>,
    private _snackBar: MatSnackBar,
  ) {
    this.returnLineForm = this._formBuilder.group({
      dateRetour: ['', [Validators.required]],
      quantite: ['', [Validators.required]],
      // usCode: ['', [Validators.required]],
      articleId: [null, [Validators.required, Validators.min(1)]],
      userId: [null, [Validators.required, Validators.min(1)]],
      statusId: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    if (this.data?.returnLineData) {
      console.log('[ReturnLineEditComponent] Données de retour reçues pour édition:', this.data.returnLineData);
      // Convertir la date ISO en format datetime-local si nécessaire
      // const isoDate = this.data.returnLineData.dateRetour;
      // const localDate = new Date(isoDate);
      // const formattedDate = localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
      this.returnLineForm.patchValue({
        ...this.data.returnLineData,
        // dateRetour: formattedDate // Utiliser la date formatée si nécessaire
      });
    } else {
      console.error('[ReturnLineEditComponent] Aucune donnée de retour fournie au dialogue d\'édition.');
      this.dialogRef.close();
    }
  }

  onSubmit(): void {
    if (this.returnLineForm.invalid) {
      this.returnLineForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const returnLineId = this.data?.returnLineData?.id;
    const formData: ReturnLineUpdateDto = this.returnLineForm.value;

    if (returnLineId) {
      console.log(`[ReturnLineEditComponent] Appel du service pour mettre à jour le retour ID ${returnLineId} avec:`, formData);
      this._returnLineService.update(returnLineId, formData)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (response) => {
            console.log(`[ReturnLineEditComponent] Retour ID ${returnLineId} mis à jour avec succès:`, response);
            this.submitting = false;
            this._snackBar.open(`Retour ID ${returnLineId} mis à jour avec succès.`, 'Succès', { duration: 3000 });
            this.dialogRef.close('updated');
          },
          error: (err) => {
            console.error(`[ReturnLineEditComponent] Erreur lors de la mise à jour du retour ID ${returnLineId}:`, err);
            this.submitting = false;
            let errorMsg = 'Erreur lors de la mise à jour du retour.';
            if (err.status === 400) {
              errorMsg = 'Données de retour invalides.';
            } else if (err.status === 404) {
              errorMsg = 'Retour, Article, Utilisateur ou Statut non trouvé.';
            } else if (err.status >= 500) {
              errorMsg = 'Erreur serveur.';
            }
            this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
            // Ne pas fermer le dialogue
          }
        });
    } else {
      this.submitting = false;
      console.error('[ReturnLineEditComponent] Impossible de mettre à jour : ID de retour manquant.');
      this._snackBar.open('Impossible de mettre à jour : ID de retour manquant.', 'Erreur', { duration: 5000 });
    }
  }

  onCancel(): void {
    this.dialogRef.close('cancelled');
  }
}
// --- Fin du composant ReturnLineEditComponent ---

// --- Return Line View Component (dans le même fichier) ---
@Component({
  selector: 'app-return-line-view-dialog',
  template: `
    <div class="flex flex-col w-full h-full">
      <!-- Dialog Header -->
      <div class="flex items-center justify-between py-4 px-6 border-b">
        <div class="text-lg font-medium">Détails du Retour Ligne (ID: {{ data?.returnLineData?.id }})</div>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
        </button>
      </div>

      <!-- Dialog Content -->
      <div class="flex-auto overflow-y-auto p-6 md:p-8">
        <mat-list *ngIf="data?.returnLineData; else noData">
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">ID:</span>
              <span>{{ data.returnLineData.id }}</span>
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">Date du Retour:</span>
              <span>{{ data.returnLineData.dateRetour | date:'short' }}</span>
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">Quantité:</span>
              <span>{{ data.returnLineData.quantite }}</span>
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <!-- <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">Code US:</span>
              <span>{{ data.returnLineData.usCode }}</span>
            </div>
          </mat-list-item> -->
          <mat-divider></mat-divider>
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">ID Article:</span>
              <span>{{ data.returnLineData.articleId }}</span>
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">ID Utilisateur:</span>
              <span>{{ data.returnLineData.userId }}</span>
            </div>
          </mat-list-item>
          <mat-divider></mat-divider>
          <mat-list-item>
            <div class="flex justify-between w-full">
              <span class="font-medium">ID Statut:</span>
              <span>{{ data.returnLineData.status?.description || data.returnLineData.statusId }}</span>
            </div>
          </mat-list-item>
          <!-- Ajoutez d'autres champs si nécessaire -->
        </mat-list>
        <ng-template #noData>
          <div class="text-center text-gray-500 p-4">Données de retour non disponibles.</div>
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
    MatSnackBarModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule, // Assurez-vous de l'importer si vous utilisez <mat-divider>
  ]
})
export class ReturnLineViewComponent {
  constructor(
    
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { returnLineData: any },
    public dialogRef: MatDialogRef<ReturnLineViewComponent>,
  ) {}

  onCancel(): void {
    this.dialogRef.close('cancelled');
  }
}
// --- Fin du composant ReturnLineViewComponent ---

// --- Return Line Delete Component (dans le même fichier) ---
@Component({
  selector: 'app-return-line-delete-dialog',
  template: `
    <div class="flex flex-col w-full">
      <!-- Dialog Header -->
      <div class="flex items-center justify-between py-4 px-6 border-b">
        <div class="text-lg font-medium">Confirmer la suppression</div>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
        </button>
      </div>

      <!-- Dialog Content -->
      <div class="flex-auto overflow-y-auto p-6 md:p-8">
        <p>Êtes-vous sûr de vouloir supprimer le retour ligne avec l'ID <strong>{{ data?.returnLineData?.id }}</strong> ?</p>
        <p>Cette action est irréversible.</p>
      </div>

      <!-- Dialog Actions -->
      <div class="flex items-center justify-end px-6 py-3 border-t bg-gray-50">
        <button mat-stroked-button (click)="onCancel()">Annuler</button>
        <button mat-flat-button color="warn" class="ml-3" (click)="onDelete()" [disabled]="deleting">
          <mat-progress-spinner *ngIf="deleting" [diameter]="20" [mode]="'indeterminate'" class="mr-2"></mat-progress-spinner>
          <span *ngIf="!deleting">Supprimer</span>
          <span *ngIf="deleting">Suppression...</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    mat-progress-spinner {
      display: inline-block;
      vertical-align: middle;
    }
  `],
  standalone: true,
  imports: [
    MatSnackBarModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ]
})
export class ReturnLineDeleteComponent {
  deleting: boolean = false;

  constructor(
    
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { returnLineData: any },
    private _returnLineService: ReturnService,
    public dialogRef: MatDialogRef<ReturnLineDeleteComponent>,
    private _snackBar: MatSnackBar,
  ) {}

  onDelete(): void {
    const id = this.data?.returnLineData;
    console.log(this.data);
    
    if (!id) {
      console.error('[ReturnLineDeleteComponent] ID de retour manquant pour la suppression.');
      this._snackBar.open('ID de retour manquant pour la suppression.', 'Erreur', { duration: 5000 });
      this.dialogRef.close();
      return;
    }

    this.deleting = true;
    console.log(`[ReturnLineDeleteComponent] Appel du service pour supprimer le retour ID ${id}.`);
    this._returnLineService.delete(id)
      .subscribe({
        next: (response) => {
          console.log(`[ReturnLineDeleteComponent] Retour ID ${id} supprimé avec succès.`);
          this.deleting = false;
          this._snackBar.open(`Retour ID ${id} supprimé avec succès.`, 'Succès', { duration: 3000 });
          this.dialogRef.close('deleted');
        },
        error: (err) => {
          console.error(`[ReturnLineDeleteComponent] Erreur lors de la suppression du retour ID ${id}:`, err);
          this.deleting = false;
          let errorMsg = 'Erreur lors de la suppression du retour.';
          if (err.status === 404) {
            errorMsg = 'Retour non trouvé.';
          } else if (err.status === 409) {
            errorMsg = 'Impossible de supprimer le retour (lié à d\'autres données).';
          } else if (err.status >= 500) {
            errorMsg = 'Erreur serveur.';
          }
          this._snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
          // Ne pas fermer le dialogue pour montrer l'erreur
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close('cancelled');
  }
}

