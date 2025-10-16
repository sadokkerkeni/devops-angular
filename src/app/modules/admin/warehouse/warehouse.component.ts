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

@Component({
  selector: 'app-warehouse',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule, MatDialogModule,MatFormFieldModule, FormsModule,MatTooltipModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WarehouseComponent implements OnInit, OnDestroy {
  warehouses: any[] = [];
  loading = false;
  filterMode: 'all' | 'active' | 'inactive' = 'active';

  private destroy$ = new Subject<void>();

  constructor(
    private _snackBar: MatSnackBar,
    private WarehouseService: WarehouseService,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {
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

  loadWarehouses(): void {
    this.loading = true;
    this.WarehouseService.getWarehouses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log(data);
          
          switch (this.filterMode) {
            case 'active':
              this.warehouses = data.filter(w => w.isActive);
              break;
            case 'inactive':
              this.warehouses = data.filter(w => !w.isActive);
              break;
            default:
              this.warehouses = data;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading warehouses:', err);
          this._snackBar.open('Erreur lors du chargement des magasins.', 'Erreur', { duration: 5000 });
          this.loading = false;
        },
      });
  }

  cycleFilterMode(): void {
    if (this.filterMode === 'active') this.filterMode = 'inactive';
    else if (this.filterMode === 'inactive') this.filterMode = 'all';
    else this.filterMode = 'active';
    this.loadWarehouses();
  }

  onCreate(): void {
    const dialogRef = this._dialog.open(CreateWarehouseDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'created') {
        this._snackBar.open('Magasin créé avec succès.', '', { duration: 3000 });
        this.loadWarehouses();
      }
    });
  }

  onEdit(warehouse: any): void {
    const dialogRef = this._dialog.open(EditWarehouseDialogComponent, {
      width: '400px',
      data: warehouse
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this._snackBar.open('Magasin mis à jour.', '', { duration: 3000 });
        this.loadWarehouses();
      }
    });
  }

  toggleActivation(warehouse: any): void {
    const newStatus = !warehouse.isActive;
    this.WarehouseService.setActiveStatus(warehouse.id, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          warehouse.isActive = newStatus;
          this._snackBar.open(`Magasin ${newStatus ? 'activé' : 'désactivé'} avec succès.`, '', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error toggling activation:', err);
          this._snackBar.open('Erreur lors de la mise à jour de l\'état.', 'Erreur', { duration: 5000 });
        }
      });
  }
}












@Component({
  selector: 'app-create-warehouse-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatCardModule,MatDialogModule],
  template: `
    <h2 mat-dialog-title>Créer un nouveau magasin</h2>
    <mat-dialog-content>
      <form>
        <mat-form-field class="full-width">
          <input matInput placeholder="Nom" [(ngModel)]="name" name="name" required />
        </mat-form-field>
        <mat-form-field class="full-width">
          <textarea matInput placeholder="Description" [(ngModel)]="description" name="description"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button color="primary" (click)="create()" [disabled]="!name">Créer</button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; }'],
})
export class CreateWarehouseDialogComponent {
  name = '';
  description = '';

  constructor(
    public dialogRef: MatDialogRef<CreateWarehouseDialogComponent>,
    private warehouseService: WarehouseService,
    private _snackBar: MatSnackBar
  ) {}

  create(): void {
    this.warehouseService.createWarehouse({ name: this.name, description: this.description }).subscribe({
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
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule,MatDialogModule],
  template: `
    <h2 mat-dialog-title>Modifier le magasin</h2>
    <mat-dialog-content>
      <form>
        <mat-form-field class="full-width">
          <input matInput placeholder="Nom" [(ngModel)]="name" name="name" required />
        </mat-form-field>
        <mat-form-field class="full-width">
          <textarea matInput placeholder="Description" [(ngModel)]="description" name="description"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Annuler</button>
      <button mat-flat-button color="primary" (click)="update()" [disabled]="!name">Mettre à jour</button>
    </mat-dialog-actions>
  `,
  styles: ['.full-width { width: 100%; }'],
})
export class EditWarehouseDialogComponent {
  name: string;
  description: string;

  constructor(
    public dialogRef: MatDialogRef<EditWarehouseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private warehouseService: WarehouseService,
    private _snackBar: MatSnackBar
  ) {
    this.name = data.name;
    this.description = data.description;
  }

  update(): void {
    this.warehouseService.updateWarehouse(this.data.id, { name: this.name, description: this.description }).subscribe({
      next: () => {
        this.dialogRef.close('updated');
      },
      error: () => {
        this._snackBar.open('Erreur lors de la mise à jour du magasin.', 'Erreur', { duration: 3000 });
      }
    });
  }
}







