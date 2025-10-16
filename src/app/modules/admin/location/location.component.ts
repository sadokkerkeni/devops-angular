import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LocationService } from './location.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatDialogModule,
    FormsModule,
    NgIf
    , MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    NgFor,
  ],
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LocationComponent implements OnInit, OnDestroy {
  locations: any[] = [];
  loading: boolean = false;
filterMode: 'all' | 'active' | 'inactive' = 'active';

  private destroy$ = new Subject<void>();

  constructor(
    private _snackBar: MatSnackBar,
    private locationService: LocationService,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadLocations();
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

loadLocations(): void {
  this.loading = true;
  this.locationService
    .getLocations()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        switch (this.filterMode) {
          case 'active':
            this.locations = data.filter((l) => l.isActive);
            break;
          case 'inactive':
            this.locations = data.filter((l) => !l.isActive);
            break;
          default: // 'all'
            this.locations = data;
        }
        this.loading = false;
        console.log(this.locations);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des emplacements:', err);
        this._snackBar.open('Erreur lors du chargement des emplacements.', 'Erreur', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
        this.loading = false;
      },
    });
}


  onCreate(): void {
    const dialogRef = this._dialog.open(CreateLocationDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created') {
        this._snackBar.open('Emplacement créé avec succès.', '', {
          duration: 3000,
        });
        this.loadLocations();
      }
    });
  }

  onEdit(location: any): void {
    const dialogRef = this._dialog.open(EditLocationDialogComponent, {
      width: '400px',
      data: location,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'updated') {
        this._snackBar.open('Emplacement mis à jour.', '', {
          duration: 3000,
        });
        this.loadLocations();
      }
    });
  }

toggleActivation(location: any): void {
  const newStatus = !location.isActive;

  this.locationService.setActiveStatus(location.id, newStatus)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        location.isActive = newStatus; // update UI immediately
        this._snackBar.open(
          `Emplacement ${newStatus ? 'activé' : 'désactivé'} avec succès.`,
          '',
          { duration: 3000 }
        );
      },
      error: (err) => {
        console.error('Erreur activation:', err);
        this._snackBar.open('Erreur lors de la mise à jour de l\'état.', 'Erreur', {
          duration: 5000,
        });
      }
    });
}



  toggleActiveFilter(): void {
  if (this.filterMode === 'active') {
    this.filterMode = 'inactive';
  } else if (this.filterMode === 'inactive') {
    this.filterMode = 'all';
  } else {
    this.filterMode = 'active';
  }
  this.loadLocations();


  }
}














@Component({
  selector: 'app-create-location-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Créer un nouvel emplacement</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" required />
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Description</mat-label>
          <input matInput formControlName="description" />
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Entrepôt</mat-label>
          <mat-select formControlName="warehouseId" required>
            <mat-option *ngFor="let warehouse of warehouses" [value]="warehouse.id">
              {{ warehouse.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button color="primary" (click)="create()" [disabled]="form.invalid">
        Créer
      </button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; }'],
})
export class CreateLocationDialogComponent implements OnInit {
  form: FormGroup;
  warehouses: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<CreateLocationDialogComponent>,
    private locationService: LocationService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      description: [''],
      warehouseId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.locationService.getWarehouses(null).subscribe({
      next: (data) => {
        this.warehouses = data;
      },
      error: () => {
        this._snackBar.open("Erreur lors du chargement des entrepôts", "Erreur", { duration: 3000 });
      }
    });
  }

  create(): void {
    if (this.form.invalid) return;

    this.locationService.createLocation(this.form.value).subscribe({
      next: () => {
        this.dialogRef.close('created');
      },
      error: () => {
        this._snackBar.open('Erreur lors de la création.', 'Erreur', {
          duration: 3000,
        });
      }
    });
  }
}










@Component({
  selector: 'app-edit-location-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Modifier l'emplacement</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" required />
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Description</mat-label>
          <input matInput formControlName="description" />
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Entrepôt</mat-label>
          <mat-select formControlName="warehouseId" required>
            <mat-option *ngFor="let warehouse of warehouses" [value]="warehouse.id">
              {{ warehouse.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button color="primary" (click)="update()" [disabled]="form.invalid">
        Mettre à jour
      </button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; }'],
})
export class EditLocationDialogComponent implements OnInit {
  form: FormGroup;
  warehouses: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditLocationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private locationService: LocationService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      code: [data.code || '', Validators.required],
      description: [data.description || ''],
      warehouseId: [data.warehouseId || null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.locationService.getWarehouses().subscribe({
      next: (data) => {
        this.warehouses = data;
      },
      error: () => {
        this._snackBar.open("Erreur lors du chargement des entrepôts", "Erreur", {
          duration: 3000,
        });
      }
    });
  }

  update(): void {
    if (this.form.invalid) return;

    this.locationService.updateLocation(this.data.id, this.form.value).subscribe({
      next: () => {
        this.dialogRef.close('updated');
      },
      error: () => {
        this._snackBar.open('Erreur lors de la mise à jour.', 'Erreur', {
          duration: 3000,
        });
      }
    });
  }
}


