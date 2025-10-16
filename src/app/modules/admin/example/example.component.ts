import { Component, ViewEncapsulation, ElementRef, OnInit, ViewChild, AfterViewInit, Optional, Inject } from '@angular/core';
import { EmailEditorComponent,UnlayerOptions,EmailEditorModule  } from '@trippete/angular-email-editor';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InventoryService } from './inventory.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector     : 'example',
    standalone   : true,
    imports     : [EmailEditorModule, MatButtonModule, CommonModule, MatIconModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
    templateUrl  : './example.component.html',
    styleUrls : ['./example.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ExampleComponent
{// Use 'any[]' for simplicity, or define a proper type
    inventories: any[] = [];
    private allInventories: any[] = [];

    loading: boolean = false;
currentFilter: 'all' | 'active' | 'inactive' = 'all'; // Commence par afficher tous

    // For managing subscriptions and preventing memory leaks
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
      private _snackBar: MatSnackBar,
        private _inventoryService: InventoryService,
        private _matDialog: MatDialog // Inject MatDialog
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.loadInventories();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load inventories based on the active filter
     */
  loadInventories(): void {
  this.loading = true;

  // Fetch all inventories (no active/inactive filter)
  this._inventoryService.getInventories(null)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe({
      next: (data) => {
        this.allInventories = data || []; // Cache everything
        this.applyLocalFilter(); // Apply UI-side filtering
        this.loading = false;
        console.log(this.allInventories);
        
      },
      error: (err) => {
        console.error('Erreur lors du chargement des inventaires:', err);
        this._snackBar.open('Erreur lors du chargement des inventaires.', 'Erreur', {
          duration: 5000,
        });
        this.allInventories = [];
        this.inventories = [];
        this.loading = false;
      }
    });
}


    /**
     * Toggle the active/inactive filter
     */
    toggleActiveFilter(): void {
    switch (this.currentFilter) {
        case 'all':
            this.currentFilter = 'active';
            break;
        case 'active':
            this.currentFilter = 'inactive';
            break;
        case 'inactive':
        default:
            this.currentFilter = 'all';
            break;
    }
    // Appliquer le filtre localement sans rappeler l'API
    this.applyLocalFilter();
}

    /**
     * TrackBy to optimize ngFor rendering in the template
     */
    trackById(index: number, item: any): number | string {
        return item?.id ?? index;
    }
private applyLocalFilter(): void {
    switch (this.currentFilter) {
        case 'active':
            this.inventories = this.allInventories.filter(inv => inv.isActive === true);
            break;
        case 'inactive':
            this.inventories = this.allInventories.filter(inv => inv.isActive === false);
            break;
        case 'all':
        default:
            // Afficher tous les inventaires récupérés
            this.inventories = [...this.allInventories]; // Copie pour éviter les modifications directes
            break;
    }
}


    /**
     * View inventory details (placeholder)
     */
    onView(id: number): void {
        // Implement navigation or detail view logic
        console.log('View inventory with ID:', id);
        // Example: this._router.navigate(['/apps/inventory', id]);
    }

    /**
     * Edit an inventory item (placeholder)
     */
  onEdit(inventory: any): void { // <-- Changer le paramètre pour prendre l'objet complet
    // Open the InventoryEditComponent in a MatDialog

    if (inventory.isActive === false) {
        console.log('Modification interdite : L\'inventaire est actif.');
        
        this._snackBar.open(
            'Modification impossible. Veuillez activer l\'inventaire d\'abord.',
            'OK',
            {
                duration: 5000, // Durée d'affichage en ms
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                panelClass: ['error-snackbar'] // Classe CSS optionnelle pour le style
            }
        );
        return
      }


    const dialogRef = this._matDialog.open(InventoryEditComponent, {
        width: '800px',
  maxHeight: '90vh', // this is critical
        disableClose: false,
        autoFocus: true,
        // Pass the full inventory object to the dialog
        data: { inventoryData: inventory } // <-- Passer l'objet complet
    });

    dialogRef.afterClosed().subscribe(result => {
        console.log('Le dialogue de modification a été fermé avec le résultat:', result);
        if (result === 'updated') {
            console.log('Inventaire mis à jour, rafraîchissement de la liste...');
            // this._fuseAlertService.showSuccess('Inventaire mis à jour avec succès.');
            this.loadInventories(); // Rafraîchir la liste
        }
        // Gérer 'cancelled' ou d'autres résultats si nécessaire
    });
}

    /**
     * Create a new inventory item using MatDialog
     */
    onCreate(): void {
        // Open the InventoryCreateComponent in a MatDialog
        const dialogRef = this._matDialog.open(InventoryCreateComponent, {
            // MatDialog configuration options
            minWidth: '600px', // Adjust size as needed
             maxWidth: '800px',
            // minHeight: '300px',
            disableClose: false, // Allow closing by clicking backdrop or pressing ESC
            // data: { /* Pass any data to the dialog component here */ }
            autoFocus: true, // Focus the first focusable element in the dialog
            // You can also configure backdrop, position, etc.
        });

        // Subscribe to the dialog's afterClosed observable
        dialogRef.afterClosed().subscribe(result => {
            // 'result' will contain data passed from the dialog when it closes
            // (e.g., if the dialog component calls dialogRef.close('created'))
            console.log('The dialog was closed with result:', result);
            if (result === 'created') {
                // If an item was successfully created, reload the list
                console.log('Inventory created, refreshing list...');
                // You might want to use Fuse's notification service here
                // this._fuseAlertService.showSuccess('Inventaire créé avec succès.');
                this.loadInventories();
            }
            // Handle other potential results (e.g., 'cancelled', error states)
        });
    }

    /**
     * Toggle the active state of an inventory item
     */
    onToggleActive(id: number, currentStatus: boolean): void {
        // Call the service to update the status
        this._inventoryService.setActive(id, !currentStatus)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    // Update local list optimistically or pessimistically
                    const index = this.inventories.findIndex(inv => inv.id === id);
                    if (index !== -1) {
                        this.inventories[index].isActive = !currentStatus;
                    }
                    console.log(`Statut de l'inventaire ${id} mis à jour.`);
                    // this._fuseAlertService.showSuccess(`Statut de l'inventaire mis à jour.`);
                },
                error: (err) => {
                    console.error('Error toggling inventory status:', err);
                    // this._fuseAlertService.showError('Erreur lors de la mise à jour du statut.');
                }
            });
    }
}

// --- Inventory Create Component (in the same file) ---

@Component({
    selector: 'app-inventory-create-dialog', // Unique selector for the dialog component
    // Inline template for the dialog content
    template: `
        <div class="flex flex-col w-full h-full">
            <!-- Dialog Header -->
            <div class="flex items-center justify-between py-4 px-6 border-b">
                <div class="text-lg font-medium">Créer un Inventaire</div>
                <button mat-icon-button (click)="onCancel()" [disabled]="submitting">
                    <!-- Use appropriate icon, e.g., from heroicons or material icons -->
                    <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
                </button>
            </div>

            <!-- Dialog Content -->
            <div class="flex-auto overflow-y-auto p-6 md:p-8">
                <form [formGroup]="inventoryForm" (ngSubmit)="onSubmit()" class="flex flex-col">
                    <!-- Name Input Field -->
                    <mat-form-field class="w-full">
                        <mat-label>Nom de l'Inventaire</mat-label>
                        <input
                            matInput
                            formControlName="name"
                            placeholder="Entrez le nom de l'inventaire"
                            required
                        />
                        <mat-error *ngIf="inventoryForm.get('name')?.invalid && inventoryForm.get('name')?.touched">
                            <span *ngIf="inventoryForm.get('name')?.errors?.['required']">Le nom est requis.</span>
                            <span *ngIf="inventoryForm.get('name')?.errors?.['minlength']">Le nom doit contenir au moins 2 caractères.</span>
                            <!-- Add more validation messages if needed -->
                        </mat-error>
                    </mat-form-field>

                    <!-- Status Dropdown Field -->
                    <mat-form-field class="w-full mt-4">
                        <mat-label>Statut</mat-label>
                        <mat-select
                            formControlName="status"
                            placeholder="Sélectionnez un statut"
                            required
                        >
                            <mat-option
                                *ngFor="let statusOption of statusOptions"
                                [value]="statusOption.value"
                            >
                                {{ statusOption.viewValue }}
                            </mat-option>
                        </mat-select>
                        <mat-error *ngIf="inventoryForm.get('status')?.invalid && inventoryForm.get('status')?.touched">
                            Le statut est requis.
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
                            [disabled]="inventoryForm.invalid || submitting"
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
    // Inline styles for the dialog component
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .mat-mdc-form-field {
            width: 100%; /* Ensure form fields take full width */
        }
        mat-progress-spinner {
            display: inline-block;
            vertical-align: middle;
        }
    `],
    // --- Crucial: Mark as standalone and import its dependencies ---
    standalone: true,
    imports: [
        // Angular Core
        CommonModule, // For *ngIf, *ngFor
        ReactiveFormsModule, // For [formGroup], form directives

        // Angular Material Modules needed for this component's template
        MatButtonModule,
        MatIconModule, // For mat-icon
        MatFormFieldModule, // For mat-form-field, mat-label
        MatInputModule,     // For matInput
        MatSelectModule,    // For mat-select, mat-option
        MatProgressSpinnerModule, // For mat-progress-spinner
    ]
    // --- End of standalone configuration ---
})
export class InventoryCreateComponent implements OnInit {
    inventoryForm: FormGroup;
    submitting: boolean = false;

    // Define status options to match your backend enum/values
    // Using an array of objects for better flexibility (value + display text)
    statusOptions = [
        { value: 'EnCours', viewValue: 'En Cours' },
        { value: 'Cloturé', viewValue: 'Clôturé' }
        // Add more status options here if your backend supports them
        // { value: 'Planifié', viewValue: 'Planifié' }
    ];

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _inventoryService: InventoryService, // Ensure this service is correctly injected and available
        public dialogRef: MatDialogRef<InventoryCreateComponent> // Inject MatDialogRef to control the dialog
        // If you passed data to the dialog, you'd inject it like this:
        // @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        // Initialize the form with controls matching the InventoryCreateDto
        // Based on your backend model and Swagger, the DTO likely has 'name' and 'status'
        this.inventoryForm = this._formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(2)]], // Matches 'Name' property
            status: ['EnCours', [Validators.required]] // Default to 'EnCours', matches 'Status' property
            // Add other fields here if InventoryCreateDto has them
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Initialization logic if needed
        // For example, if status options were fetched from an API, you'd do it here
        // Or if you passed initial data via MAT_DIALOG_DATA, you could patch the form here
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On form submit
     */
    onSubmit(): void {
        // Check if the form is valid
        if (this.inventoryForm.invalid) {
            // Mark all fields as touched to show validation errors
            this.inventoryForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        // Get the form data (this will match the structure expected by InventoryCreateDto)
        const formData = this.inventoryForm.value;
        // formData should now be like: { name: '...', status: '...' }

        // Call the service to create the inventory
        this._inventoryService.createInventory(formData) // Ensure this method calls the correct API endpoint
            .subscribe({
                next: (response) => {
                    console.log('Inventory created successfully:', response);
                    this.submitting = false;
                    // Close the dialog and pass a result back to the list component
                    // This tells the list component that creation was successful
                    this.dialogRef.close('created');
                    // You might want to use Fuse's notification service here if available
                    // e.g., this._fuseAlertService.showSuccess('Inventaire créé avec succès.');
                },
                error: (err) => {
                    console.error('Error creating inventory:', err);
                    this.submitting = false;
                    // Handle error (e.g., show error message in dialog or via notification)
                    // e.g., this._fuseAlertService.showError('Erreur lors de la création de l\'inventaire.');
                    // Optionally, keep the dialog open to show the error, or close with an error result
                    // this.dialogRef.close('error');
                }
            });
    }

    /**
     * On cancel button click
     */
    onCancel(): void {
        // Close the dialog without saving, passing a 'cancelled' result
        this.dialogRef.close('cancelled');
    }
}

// --- example.component.ts ---
// Assurez-vous que ces imports supplémentaires sont présents si ce n'est pas déjà le cas
// import { FormArray, Validators } from '@angular/forms'; // Ajout de FormArray et Validators

@Component({
  selector: 'app-inventory-edit-dialog',
  template: `
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <div class="text-lg font-medium">Modifier l'Inventaire (ID: {{ data?.inventoryData?.id }})</div>
        <button mat-icon-button (click)="onCancel()" [disabled]="submitting || creatingDetail">
          <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="dialog-content">
        <form [formGroup]="inventoryForm" (ngSubmit)="onSubmit()" class="flex flex-col">
          <!-- Inventory Name -->
          <mat-form-field class="w-full">
            <mat-label>Nom de l'Inventaire</mat-label>
            <input matInput formControlName="name" required placeholder="Entrez le nom de l'inventaire" />
            <mat-error *ngIf="inventoryForm.get('name')?.touched && inventoryForm.get('name')?.invalid">
              Le nom est requis et doit contenir au moins 2 caractères.
            </mat-error>
          </mat-form-field>

          <!-- Status -->
          <mat-form-field class="w-full mt-4">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="status" required>
              <mat-option *ngFor="let statusOption of statusOptions" [value]="statusOption.value">
                {{ statusOption.viewValue }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="inventoryForm.get('status')?.touched && inventoryForm.get('status')?.invalid">
              Le statut est requis.
            </mat-error>
          </mat-form-field>

          <!-- Existing Details -->
          <div class="mt-6 p-4 bg-gray-50 rounded">
                <h3 class="text-md font-semibold mb-2">Détails de l'Inventaire ({{ detailsOfThisInventory.length }})</h3>

                <!-- Affichage des détails existants OU message d'absence -->
                <div class="mb-4">
                  <div *ngIf="detailsOfThisInventory.length > 0; else noDetailsBlock">
                    <!-- Liste des détails existants -->
                    <ul class="list-disc pl-5 space-y-2">
                      <li *ngFor="let detail of detailsOfThisInventory; let i = index" class="p-2 border-b border-gray-200 last:border-0">
                        <div class="flex justify-between items-start">
                          <div>
                            <span class="font-medium">ID:</span> {{ detail.id }}
                            <span class="mx-2">|</span>
                            <span class="font-medium">US:</span> {{ detail.usCode || 'N/A' }}
                            <span class="mx-2">|</span>
                            <span class="font-medium">Article:</span> {{ detail.articleCode || 'N/A' }}
                            <span class="mx-2">|</span>
                            <span class="font-medium">Emplacement:</span> {{ detail.locationId }}
                            <span class="mx-2">|</span>
                            <span class="font-medium">Utilisateur:</span> {{ detail.userId }}
                            <span class="mx-2">|</span>
                            <span class="font-medium">SAP:</span> {{ detail.sapId }}
                            <!-- Ajoutez d'autres champs pertinents ici -->
                          </div>
                          <!-- Bouton "Modifier" pour chaque détail (optionnel pour plus tard) -->
                          <!--
                          <button mat-icon-button color="accent" aria-label="Modifier le détail">
                            <mat-icon>edit</mat-icon>
                          </button>
                          -->
                        </div>
                      </li>
                    </ul>
                  </div>

                  <!-- Bloc pour le cas où il n'y a pas de détails -->
                  <ng-template #noDetailsBlock>
                    <div class="text-center py-4 text-gray-500">
                      <p>Aucun détail trouvé pour cet inventaire.</p>
                      <!-- Bouton/Flèche pour afficher le formulaire -->
                      <button
                        mat-button
                        type="button"
                        (click)="toggleDetailForm()"
                        class="mt-2"
                        color="primary"
                      >
                        <mat-icon *ngIf="!isDetailFormVisible">expand_more</mat-icon>
                        <mat-icon *ngIf="isDetailFormVisible">expand_less</mat-icon>
                        {{ isDetailFormVisible ? 'Masquer le formulaire' : 'Ajouter un détail' }}
                      </button>
                    </div>
                  </ng-template>
                </div>

                <!-- Formulaire pour créer un NOUVEAU détail - Contrôlé par isDetailFormVisible -->
                <div class="mt-4 transition-all duration-300 ease-in-out"
                     [ngClass]="{ 'opacity-0 max-h-0 overflow-hidden': !isDetailFormVisible, 'opacity-100 max-h-screen': isDetailFormVisible }">
                  <div class="p-3 border border-dashed border-gray-300 rounded bg-white">
                    <h4 class="text-sm font-medium mb-2 flex justify-between items-center">
                      <span>Ajouter un Nouveau Détail</span>
                      <button mat-icon-button (click)="toggleDetailForm()" aria-label="Fermer le formulaire">
                        <mat-icon>close</mat-icon>
                      </button>
                    </h4>
                    <form [formGroup]="newDetailForm" (ngSubmit)="onCreateDetail()" class="space-y-3">

                      <mat-form-field class="w-full">
                        <mat-label>Code US</mat-label>
                        <input matInput formControlName="usCode" placeholder="Entrez le code US">
                      </mat-form-field>

                      <mat-form-field class="w-full">
                        <mat-label>Code Article</mat-label>
                        <input matInput formControlName="articleCode" placeholder="Entrez le code article" required>
                        <mat-error *ngIf="newDetailForm.get('articleCode')?.hasError('required') && newDetailForm.get('articleCode')?.touched">
                          Le code article est requis.
                        </mat-error>
                      </mat-form-field>

                      <!-- Sélection de l'Emplacement -->
                      <mat-form-field class="w-full">
                        <mat-label>Emplacement</mat-label>
                        <mat-select formControlName="locationId" placeholder="Sélectionnez un emplacement" required>
                          <mat-option *ngFor="let location of locationsList" [value]="location.id">
                            {{ location.code }}
                          </mat-option>
                        </mat-select>
                        <mat-error *ngIf="newDetailForm.get('locationId')?.hasError('required') && newDetailForm.get('locationId')?.touched">
                          L'emplacement est requis.
                        </mat-error>
                      </mat-form-field>

                      <!-- Affichage de l'Utilisateur Connecté (non éditable) -->
                      <mat-form-field class="w-full" *ngIf="currentUser">
                        <mat-label>Utilisateur</mat-label>
                        <input matInput [value]="currentUser?.name " readonly>
                      </mat-form-field>
                      <mat-error *ngIf="!currentUser" class="text-sm text-red-600">
                        Utilisateur non identifié. Impossible de créer le détail.
                      </mat-error>

                      <!-- Sélection de la donnée SAP -->
                      <mat-form-field class="w-full">
                        <mat-label>Donnée SAP</mat-label>
                        <mat-select formControlName="sapId" placeholder="Sélectionnez une donnée SAP" required>
                          <mat-option *ngFor="let sap of sapsList" [value]="sap.id">
                            {{ sap.article }} (ID: {{ sap.id }})
                          </mat-option>
                        </mat-select>
                        <mat-error *ngIf="newDetailForm.get('sapId')?.hasError('required') && newDetailForm.get('sapId')?.touched">
                          La donnée SAP est requise.
                        </mat-error>
                      </mat-form-field>

                      <div class="flex justify-end space-x-2">
                        <button
                          mat-stroked-button
                          type="button"
                          (click)="toggleDetailForm()" 
                          [disabled]="creatingDetail"
                        >
                          Annuler
                        </button>
                        <button
                          mat-flat-button
                          type="submit"
                          color="accent"
                          [disabled]="newDetailForm.invalid || creatingDetail || !currentUser"
                        >
                          <mat-progress-spinner
                            *ngIf="creatingDetail"
                            [diameter]="20"
                            [mode]="'indeterminate'"
                            class="mr-2"
                          >
                          </mat-progress-spinner>
                          <span *ngIf="!creatingDetail">Ajouter Détail</span>
                          <span *ngIf="creatingDetail">Ajout...</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <!-- Si des détails existent, afficher aussi le bouton pour ajouter un autre détail -->
                <div *ngIf="detailsOfThisInventory.length > 0" class="mt-4 text-center">
                  <button
                    mat-button
                    type="button"
                    (click)="toggleDetailForm()"
                    color="primary"
                  >
                    <mat-icon *ngIf="!isDetailFormVisible">add</mat-icon>
                    <mat-icon *ngIf="isDetailFormVisible">close</mat-icon>
                    
                  </button>
                </div>
              </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <button mat-stroked-button type="button" (click)="onCancel()" [disabled]="submitting || creatingDetail">
          Annuler
        </button>
        <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="inventoryForm.invalid || submitting || creatingDetail">
          <mat-progress-spinner *ngIf="submitting" diameter="20" mode="indeterminate" class="mr-2"></mat-progress-spinner>
          <span *ngIf="!submitting">Mettre à jour Inventaire</span>
          <span *ngIf="submitting">Mise à jour...</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 90vh;
    }
    .dialog-header, .dialog-footer {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #ddd;
      border-top: 1px solid #ddd;
      flex-shrink: 0;
      background-color: white;
      z-index: 1;
    }
    .dialog-content {
      overflow-y: auto;
      padding: 1.5rem;
      flex: 1 1 auto;
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
export class InventoryEditComponent implements OnInit {
    // Propriétés pour les données
      isDetailFormVisible: boolean = false;
    detailsOfThisInventory: any[] = [];
      locationsList: any[] = []; // Stockera les LocationReadDto
  sapsList: any[] = [];    
    inventoryForm: FormGroup;
    newDetailForm: FormGroup; // Nouveau formulaire pour créer un détail
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();
    // Indicateurs d'état
    submitting: boolean = false; // Pour la mise à jour de l'inventaire
    creatingDetail: boolean = false; // Pour la création d'un détail

    // Options de statut pour l'inventaire
    statusOptions = [
        { value: 'EnCours', viewValue: 'En Cours' },
        { value: 'Cloturé', viewValue: 'Clôturé' }
    ];

    /**
     * Constructor
     */
    constructor(
      private Userservice: UserService,
        private _formBuilder: FormBuilder,
        private _inventoryService: InventoryService,
        public dialogRef: MatDialogRef<InventoryEditComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { inventoryData: any }
    ) {
        // Initialiser le formulaire principal de l'inventaire
        this.inventoryForm = this._formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            status: ['', [Validators.required]]
        });

        // Initialiser le formulaire pour créer un nouveau détail
        // Les noms des contrôles correspondent à DetailInventoryCreateDto
         this.newDetailForm = this._formBuilder.group({
      usCode: [null],
      articleCode: [null, Validators.required], // Rendre articleCode obligatoire si nécessaire
      locationId: [null, Validators.required], // <-- Rendre locationId obligatoire
      // userId sera défini automatiquement, donc pas besoin de contrôle dans le formulaire
      sapId: [null, Validators.required]       // <-- Rendre sapId obligatoire
    });
  
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     * Remplit le formulaire avec les données reçues et charge les détails.
     */
    ngOnInit(): void {
        // 1. Remplir le formulaire principal de l'Inventaire avec les données passées

        if (this.data?.inventoryData) {
          this.Userservice.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null) => {
        this.currentUser = user;
        console.log('[ExampleComponent] Utilisateur courant:', this.currentUser);
        // Ici, this.currentUser aura la structure { id: string, name: string, email: string, ... }
        // et non la structure brute du backend.
      });
          
            console.log('Données d\'inventaire reçues pour édition:', this.data.inventoryData);
            this.inventoryForm.patchValue({
                name: this.data.inventoryData.name,
                status: this.data.inventoryData.status
            });

            // 2. Récupérer les détails de l'inventaire associés
            const inventoryId = this.data.inventoryData.id;
            if (inventoryId) {
                this._inventoryService.getDetailInventoriesByInventoryId(inventoryId, null)
          .pipe(takeUntil(this.destroy$)) // Ajout de takeUntil pour OnDestroy
          .subscribe({
            next: (details: any[]) => {
              console.log(`Détails de l'inventaire ID ${inventoryId} chargés avec succès:`, details);
              this.detailsOfThisInventory = details || [];
                        },
                        error: (err) => {
                            console.error(`Erreur lors du chargement des détails pour l'inventaire ID ${inventoryId}:`, err);
                            this.detailsOfThisInventory = [];
                        }
                    });
            } else {
                console.error('ID d\'inventaire manquant dans les données fournies.');
                this.dialogRef.close();
            }
        } else {
            console.error('Aucune donnée d\'inventaire fournie au dialogue de modification.');
            this.dialogRef.close();
        }

        this.loadSelectionLists();
    }

     private loadSelectionLists(): void {
    console.log('[InventoryEditComponent] Chargement des listes de sélection (Emplacements, SAP)...');

    // Charger les emplacements (actifs)
    this._inventoryService.getLocations(true)
      .pipe(takeUntil(this.destroy$)) // Nécessite un Subject destroy$ dans la classe
      .subscribe({
        next: (locations) => {
          console.log('[InventoryEditComponent] Emplacements chargés:', locations);
          this.locationsList = locations || [];
        },
        error: (err) => {
          console.error('[InventoryEditComponent] Erreur lors du chargement des emplacements:', err);
          this.locationsList = [];
          // Gérer l'erreur (afficher un message à l'utilisateur)
        }
      });

    // Charger les données SAP (actives)
    this._inventoryService.getSaps(true)
      .pipe(takeUntil(this.destroy$)) // Nécessite un Subject destroy$ dans la classe
      .subscribe({
        next: (saps) => {
          console.log('[InventoryEditComponent] Données SAP chargées:', saps);
          this.sapsList = saps || [];
        },
        error: (err) => {
          console.error('[InventoryEditComponent] Erreur lors du chargement des données SAP:', err);
          this.sapsList = [];
          // Gérer l'erreur
        }
      });
  }
    toggleDetailForm(): void {
    this.isDetailFormVisible = !this.isDetailFormVisible;
    // Optionnel : Réinitialiser le formulaire lorsqu'on l'affiche
    if (this.isDetailFormVisible) {
        this.resetNewDetailForm();
    }
  }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On form submit (for main inventory)
     * Met à jour l'inventaire principal.
     */
    onSubmit(): void {
        if (this.inventoryForm.invalid) {
            this.inventoryForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        const inventoryId = this.data?.inventoryData?.id;
        const formData = this.inventoryForm.value;

        if (inventoryId) {
            console.log(`[InventoryEditComponent] Appel du service pour mettre à jour l'inventaire ID ${inventoryId} avec:`, formData);
            this._inventoryService.updateInventory(inventoryId, formData)
                .subscribe({
                    next: (response) => {
                        console.log(`[InventoryEditComponent] Inventaire ID ${inventoryId} mis à jour avec succès.`, response);
                        this.submitting = false;
                        // Fermer le dialogue et indiquer que la mise à jour a réussi
                        this.dialogRef.close('updated');
                    },
                    error: (err) => {
                        console.error(`[InventoryEditComponent] Erreur lors de la mise à jour de l'inventaire ID ${inventoryId}:`, err);
                        this.submitting = false;
                        // Gérer l'erreur (afficher un message, etc.)
                    }
                });
        } else {
            this.submitting = false;
            console.error('[InventoryEditComponent] Impossible de mettre à jour : ID d\'inventaire manquant.');
        }
    }

    /**
     * On cancel button click
     * Ferme le dialogue sans sauvegarder.
     */
    onCancel(): void {
        this.dialogRef.close('cancelled');
    }

    // --- Nouvelles méthodes pour la gestion des détails ---

    /**
     * On create detail form submit
     * Crée un nouveau DetailInventory.
     */
    onCreateDetail(): void {
        // Vérifier si le formulaire du nouveau détail est valide
        if (this.newDetailForm.invalid) {
            this.newDetailForm.markAllAsTouched();
            return;
        }

        // Vérifier que l'ID de l'inventaire parent est disponible
        const inventoryId = this.data?.inventoryData?.id;
        if (!inventoryId) {
            console.error('[InventoryEditComponent] Impossible de créer un détail : ID d\'inventaire parent manquant.');
            // Afficher un message d'erreur à l'utilisateur
            return;
        }

        // Préparer les données pour la création
        // Il faut inclure l'ID de l'inventaire parent dans le DTO
        const detailData = {
            ...this.newDetailForm.value,
            inventoryId: inventoryId ,

        };
        const finalData ={
            UsCode: detailData.usCode ,
            ArticleCode : detailData.articleCode,
            LocationId: detailData.locationId,
            InventoryId:detailData.inventoryId,
            UserId:parseInt(this.currentUser.id),
            SapId:detailData.sapId,
        }

        
        // Indiquer que la création est en cours
        this.creatingDetail = true;

        console.log(finalData);
        
        // Appeler le service pour créer le nouveau détail
        this._inventoryService.createDetailInventory(finalData).subscribe({
            next: (response) => {
                console.log(`[InventoryEditComponent] Nouveau détail créé avec succès pour l'inventaire ID ${inventoryId}.`, response);
                this.creatingDetail = false;
                
                // Option 1: Ajouter le nouveau détail à la liste locale
                // Cela suppose que le backend retourne l'objet créé ou que vous avez son ID.
                // Si le backend ne retourne pas l'objet complet, vous devrez peut-être le récupérer.
                // Pour simplifier, on recharge la liste.
                // this.detailsOfThisInventory.push(response); // Si response contient le détail créé

                // Option 2: Recharger la liste des détails pour s'assurer qu'elle est à jour
                this.loadDetailsForCurrentInventory();
                
                // Réinitialiser le formulaire de création
                this.resetNewDetailForm();
                
                // Afficher un message de succès (optionnel)
                // Par exemple, en utilisant MatSnackBar ou un message dans le template
            },
            error: (err) => {
                console.error(`[InventoryEditComponent] Erreur lors de la création du détail pour l'inventaire ID ${inventoryId}:`, err);
                this.creatingDetail = false;
                // Gérer l'erreur (afficher un message à l'utilisateur)
                // Par exemple: this.detailCreationError = "Échec de la création du détail.";
            }
        });
    }

    /**
     * Réinitialise le formulaire de création de détail.
     */
    resetNewDetailForm(): void {
        this.newDetailForm.reset({
            usCode: null,
            articleCode: null,
            locationId: null,
            userId: null,
            sapId: null
        });
    }

    /**
     * (Privée) Recharge les détails de l'inventaire courant.
     * Utilisée après la création d'un nouveau détail.
     */
    private loadDetailsForCurrentInventory(): void {
        const inventoryId = this.data?.inventoryData?.id;
        if (inventoryId) {
            this._inventoryService.getDetailInventoriesByInventoryId(inventoryId)
                .subscribe({
                    next: (details: any[]) => {
                        console.log(`[InventoryEditComponent] Liste des détails rechargée pour l'inventaire ID ${inventoryId}.`);
                        this.detailsOfThisInventory = details || [];
                    },
                    error: (err) => {
                        console.error(`[InventoryEditComponent] Erreur lors du rechargement des détails pour l'inventaire ID ${inventoryId}:`, err);
                        // Ne pas vider this.detailsOfThisInventory ici, cela pourrait perdre les données existantes
                        // Afficher un message d'erreur à l'utilisateur si nécessaire
                    }
                });
        }
    }
}
// --- Fin du composant InventoryEditComponent ---
// --- Fin du composant InventoryEditComponent ---