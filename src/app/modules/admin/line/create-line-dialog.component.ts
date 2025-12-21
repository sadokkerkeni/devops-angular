import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LineService } from './line.service';

@Component({
  selector: 'app-create-line-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h1 mat-dialog-title>
      <mat-icon>add_box</mat-icon>
      Créer une nouvelle ligne
    </h1>
    <div mat-dialog-content>
      <form [formGroup]="lineForm" class="line-create-form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-icon matPrefix>notes</mat-icon>
          <mat-label>Description</mat-label>
          <input matInput formControlName="description" placeholder="Entrez la description de la ligne" required>
          <mat-error *ngIf="lineForm.get('description')?.hasError('required')">
            La description est obligatoire
          </mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-flat-button color="primary" type="submit" (click)="onCreate()" [disabled]="isSaving || lineForm.invalid">
        <mat-icon *ngIf="!isSaving">add</mat-icon>
        <mat-progress-spinner *ngIf="isSaving" diameter="20" mode="indeterminate"></mat-progress-spinner>
        <span>{{ isSaving ? 'Création...' : 'Créer' }}</span>
      </button>
    </div>
  `,
  styles: [`
    .line-create-form {
      min-width: 300px;
    }
    .w-full {
      width: 100%;
    }
    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class CreateLineDialogComponent implements OnInit {
  lineForm = new FormGroup({
    description: new FormControl('', [Validators.required])
  });
  isSaving = false;

  constructor(
    public dialogRef: MatDialogRef<CreateLineDialogComponent>,
    private lineService: LineService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  onCreate(): void {
    if (this.lineForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    const payload = this.lineForm.value;

    this.lineService.create(payload).subscribe({
      next: () => {
        this.snackBar.open('Ligne créée avec succès', 'Succès', { duration: 3000 });
        this.dialogRef.close('created');
      },
      error: (e) => {
        console.error('Erreur lors de la création de la ligne:', e);
        const msg = e.error?.message ?? 'Erreur lors de la création de la ligne';
        this.snackBar.open(msg, 'Erreur', { duration: 5000 });
        this.isSaving = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
