// src/app/modules/admin/apps/logistics/articles/article.component.ts
import { Component, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { Subject, takeUntil } from 'rxjs';
import { ArticleService } from './article.service';
import { MatDividerModule } from '@angular/material/divider';

// --- Article List Component ---
@Component({
  selector: 'app-article',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  ],
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  articles: any[] = [];
  loading: boolean = false;
  isActiveFilter: boolean = true;
  displayedColumns: string[] = ['id', 'codeProduit', 'designation', 'dateAjout', 'isActive', 'actions'];

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _formBuilder: FormBuilder,
    private _articleService: ArticleService,
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadArticles();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadArticles(): void {
    this.loading = true;
    this._articleService.getAll(this.isActiveFilter)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.articles = data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('[ArticleComponent] Erreur lors du chargement des articles:', err);
          this._snackBar.open('Erreur lors du chargement des articles.', 'Erreur', { duration: 5000 });
          this.loading = false;
          this.articles = [];
        }
      });
  }

  toggleActiveFilter(): void {
    this.isActiveFilter = !this.isActiveFilter;
    this.loadArticles();
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
    this._articleService.setActiveStatus(id, !currentStatus)
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
            <input matInput formControlName="designation" placeholder="Entrez la désignation" required>
            <mat-error *ngIf="articleForm.get('designation')?.invalid && articleForm.get('designation')?.touched">
              <span *ngIf="articleForm.get('designation')?.errors?.['required']">La désignation est requise.</span>
            </mat-error>
          </mat-form-field>

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

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formData = this.articleForm.value;

    this._articleService.create(formData)
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
          let errorMsg = 'Erreur lors de la création de l\'article.';
          if (err.status === 400) {
            errorMsg = 'Données d\'article invalides.';
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
            <input matInput formControlName="designation" placeholder="Entrez la désignation" required>
            <mat-error *ngIf="articleForm.get('designation')?.invalid && articleForm.get('designation')?.touched">
              <span *ngIf="articleForm.get('designation')?.errors?.['required']">La désignation est requise.</span>
            </mat-error>
          </mat-form-field>

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
      this.loadingData = false;
    } else {
      console.error('[ArticleEditComponent] Aucune donnée d\'article fournie.');
      this.loadingData = false;
      this.dialogRef.close();
    }
  }

  onSubmit(): void {
    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const articleId = this.data?.articleData?.id;
    const formData = this.articleForm.value;

    if (articleId) {
      this._articleService.update(articleId, formData)
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
            let errorMsg = 'Erreur lors de la mise à jour de l\'article.';
            if (err.status === 400) {
              errorMsg = 'Données d\'article invalides.';
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
  ) {}

  onCancel(): void {
    this.dialogRef.close('cancelled');
  }
}
// --- Fin du composant ArticleViewComponent ---