import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LineService } from './line.service';
import { PicklistService } from '../picklist/picklist.service';
import { Observable } from 'rxjs';
import { CreateLineDialogComponent } from './create-line-dialog.component';

@Component({
  selector: 'app-line',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTooltipModule
  ],
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.scss']
})
export class LineComponent implements OnInit {
  displayedColumns: string[] = ['id', 'description', 'isActive', 'actions'];
  lines: any[] = [];
  lineForm = new FormGroup({
    description: new FormControl('', [Validators.required])
  });
  isEditMode = false;
  currentEditId: number | null = null;
  isSaving = false; // ✅ Prevent duplicate submissions

  constructor(
    private lineService: LineService,
    private picklistService: PicklistService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadLines();
  }

  loadLines() {
    this.lineService.getAll().subscribe({
      next: (lines) => {
        this.lines = lines;
      },
      error: (e) => {
        console.error('Erreur lors du chargement des lignes:', e);
        this.snackBar.open('Erreur lors du chargement des lignes', 'Erreur', { duration: 5000 });
      }
    });
  }

  openCreateLineDialog(): void {
    console.log('[LineComponent] + Nouvelle Ligne clicked');
    const dialogRef = this.dialog.open(CreateLineDialogComponent, {
      width: '480px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'created') {
        this.snackBar.open('Ligne créée avec succès', 'Succès', { duration: 3000 });
        this.loadLines();
      } else if (result?.errorMessage) {
        this.snackBar.open(result.errorMessage, 'Erreur', { duration: 5000 });
      }
    });
  }

  startEdit(line: any) {
    this.isEditMode = true;
    this.currentEditId = line.id;
    this.lineForm.setValue({ description: line.description });
  }

  submitForm() {
    if (this.lineForm.invalid) {
      this.snackBar.open('Veuillez entrer une description valide', 'Erreur', { duration: 5000 });
      return;
    }

    // ✅ Prevent duplicate submissions
    if (this.isSaving) {
      return;
    }
    this.isSaving = true;

    const formValue = this.lineForm.value;
    if (this.isEditMode && this.currentEditId) {
      this.lineService.update(this.currentEditId, formValue)
        .pipe(take(1)) // ✅ Ensure single execution
        .subscribe({
          next: () => {
            this.snackBar.open('Ligne mise à jour avec succès', 'Succès', { duration: 3000 });
            this.resetForm();
            this.loadLines();
            this.isSaving = false;
          },
          error: (e) => {
            console.error('Erreur lors de la mise à jour de la ligne:', e);
            this.snackBar.open('Erreur lors de la mise à jour de la ligne', 'Erreur', { duration: 5000 });
            this.isSaving = false;
          }
        });
    } else {
      this.lineService.create(formValue)
        .pipe(take(1)) // ✅ Ensure single execution
        .subscribe({
          next: () => {
            this.snackBar.open('Ligne créée avec succès', 'Succès', { duration: 3000 });
            this.resetForm();
            this.loadLines();
            this.isSaving = false;
          },
          error: (e) => {
            console.error('Erreur lors de la création de la ligne:', e);
            this.snackBar.open('Erreur lors de la création de la ligne', 'Erreur', { duration: 5000 });
            this.isSaving = false;
          }
        });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.currentEditId = null;
    this.lineForm.reset({ description: '' });
    this.isSaving = false; // ✅ Reset saving state
  }

  cancelEdit() {
    this.resetForm();
  }

  deleteLine(id: number) {
    const dialogRef = this.dialog.open(LineDeleteDialogComponent, {
      width: '400px',
      data: { id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lineService.delete(id).subscribe({
          next: () => {
            this.snackBar.open('Ligne supprimée avec succès', 'Succès', { duration: 3000 });
            this.loadLines();
          },
          error: (e) => {
            console.error('Erreur lors de la suppression de la ligne:', e);
            let errorMsg = 'Erreur lors de la suppression de la ligne';
            if (e.status === 404) {
              errorMsg = 'Ligne non trouvée';
            } else if (e.status === 409) {
              errorMsg = 'Impossible de supprimer la ligne (utilisée ailleurs)';
            }
            this.snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
          }
        });
      }
    });
  }

  toggleActiveStatus(id: number, currentStatus: boolean) {
    const newStatus = !currentStatus;
    this.lineService.setActive(id, newStatus).subscribe({
      next: () => {
        const line = this.lines.find(item => item.id === id);
        if (line) {
          line.isActive = newStatus;
        }
        this.snackBar.open(`Ligne ${newStatus ? 'activée' : 'désactivée'} avec succès`, 'Succès', { duration: 3000 });
      },
      error: (e) => {
        console.error('Erreur lors de la mise à jour du statut de la ligne:', e);
        this.snackBar.open('Erreur lors de la mise à jour du statut de la ligne', 'Erreur', { duration: 5000 });
      }
    });
  }

  assignPicklist(lineId: number) {
    this.dialog.open(LineAssignPicklistDialogComponent, {
      width: '600px',
      data: { lineId }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.lineService.assignPicklist(lineId, result.picklistId).subscribe({
          next: () => {
            this.snackBar.open('Picklist assignée avec succès', 'Succès', { duration: 3000 });
            this.loadLines();
          },
          error: (e) => {
            console.error('Erreur lors de l\'assignation de la picklist:', e);
            let errorMsg = 'Erreur lors de l\'assignation de la picklist';
            if (e.status === 404) {
              errorMsg = 'Ligne ou picklist non trouvée';
            } else if (e.status === 400) {
              errorMsg = 'Échec de l\'assignation de la picklist';
            }
            this.snackBar.open(errorMsg, 'Erreur', { duration: 5000 });
          }
        });
      }
    });
  }
}

@Component({
  selector: 'app-line-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h1 mat-dialog-title>Confirmer la suppression</h1>
    <div mat-dialog-content>
      <p>Êtes-vous sûr de vouloir supprimer cette ligne ?</p>
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
export class LineDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LineDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number }
  ) {}

  onClose(confirm: boolean): void {
    this.dialogRef.close(confirm);
  }
}

@Component({
  selector: 'app-line-assign-picklist-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatSelectModule, MatFormFieldModule, ReactiveFormsModule],
  template: `
    <h1 mat-dialog-title>Assigner une Picklist</h1>
    <div mat-dialog-content>
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Sélectionner une Picklist</mat-label>
        <mat-select [formControl]="picklistControl" required>
          <mat-option *ngFor="let picklist of picklists" [value]="picklist.id">
            {{ picklist.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div mat-dialog-actions class="flex justify-end p-4">
      <button mat-button (click)="onClose()">Annuler</button>
      <button mat-button color="primary" (click)="onAssign()" [disabled]="!picklistControl.value">Assigner</button>
    </div>
  `,
  styles: [`
    .flex { display: flex; }
    .justify-end { justify-content: flex-end; }
    .p-4 { padding: 1rem; }
    .w-full { width: 100%; }
  `]
})
export class LineAssignPicklistDialogComponent implements OnInit {
  picklists: any[] = [];
  picklistControl = new FormControl<number | null>(null, [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<LineAssignPicklistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lineId: number },
    private picklistService: PicklistService
  ) {}

  ngOnInit() {
    this.picklistService.getPicklists(true).subscribe({
      next: (picklists) => {
        this.picklists = picklists;
      },
      error: (e) => {
        console.error('Erreur lors du chargement des picklists:', e);
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  onAssign() {
    if (this.picklistControl.value) {
      this.dialogRef.close({ picklistId: this.picklistControl.value });
    }
  }
}
