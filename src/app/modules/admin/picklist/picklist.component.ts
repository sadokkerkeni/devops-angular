
import { Component, Inject, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PicklistService } from './picklist.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-picklist',
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
  templateUrl: './picklist.component.html',
  styleUrls: ['./picklist.component.scss'],
   encapsulation: ViewEncapsulation.None, 
})
export class PicklistComponent implements OnInit {

picklists: any[] = [];
displayedPicklists: any[] = [];
loading: boolean = false;
filter: 'all' | 'active' | 'inactive' = 'all';
  warehouses: any[] = [];
  lines: any[] = [];

  private destroy$ = new Subject<void>();

  selectedWarehouseId: number | null = null;
  selectedLineId: number | null = null;

  displayedColumns = ['id', 'name', 'status', 'actions'];

  constructor(
      private _snackBar: MatSnackBar,
      private picklistService: PicklistService,
      private _dialog: MatDialog,
        private router: Router
    ) {}

  ngOnInit() {
    this.selectedWarehouseId = null;
    this.selectedLineId =null;
    this.loadpicklists();
    this.loadmagasin();
    this.loadline();
  }

  filteredPicklists(): any[] {
    return this.picklists.filter(p =>
      (!this.selectedWarehouseId || p.warehouseId === this.selectedWarehouseId) &&
      (!this.selectedLineId || p.lineId === this.selectedLineId)
    );
       
  }
  goToPicklistDetails(picklistId: number) {
  this.router.navigate(['/picklist', picklistId]);
}
  openCreateDialog() {
    const dialogRef = this._dialog.open(CreatePicklistDialogComponent, {
      width: '800px',
  maxHeight: '90vh', // this is critical
        disableClose: false,
        autoFocus: true,
      data: { warehouses: this.warehouses, lines: this.lines }
    });

   dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.picklistService.createPicklist(result)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this._snackBar.open('Pickliste créée avec succès.', '', { duration: 3000 });
            this.loadpicklists(); // Reload after successful creation
          },
          error: (err) => {
            console.error('Erreur lors de la création de la pickliste:', err);
            this._snackBar.open('Erreur lors de la création de la pickliste.', 'Erreur', {
              duration: 5000,
            });
          }
        });
    }
    });
  }

   editPicklist(picklist: any) {
    const dialogRef = this._dialog.open(EditPicklistDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: { 
        picklistData: picklist, 
        warehouses: this.warehouses, 
        lines: this.lines 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this._snackBar.open('Pickliste mise à jour avec succès.', '', { duration: 3000 });
        this.loadpicklists(); // Recharger la liste
      } else if (result === 'error') {
        // Gérer l'erreur si nécessaire, le message est déjà affiché dans le dialogue
      }
      // 'cancelled' ou autre : ne rien faire
    });
  }

  deletePicklist(picklist: any) {
    this.picklists = this.picklists.filter(p => p.id !== picklist.id);
  }

  loadmagasin(){
    this.picklistService.getWarehouses().pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        console.log(data);
        
        this.warehouses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des warehouses:', err);
        this._snackBar.open('Erreur lors du chargement des warehouses.', 'Erreur', {
          duration: 5000,
        });
        this.loading = false;
      }
    });
   
    
  }
  loadline(){

    this.picklistService.getlines().pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.lines = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des lines:', err);
        this._snackBar.open('Erreur lors du chargement des lines.', 'Erreur', {
          duration: 5000,
        });
        this.loading = false;
      }
    });

   
    
  }

 loadpicklists(): void {
  this.loading = true;

  this.picklistService.getPicklists(undefined) // fetch all (no filter)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.picklists = data;
        console.log(this.picklists);
        
        
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des picklistes:', err);
        this._snackBar.open('Erreur lors du chargement des picklistes.', 'Erreur', {
          duration: 5000,
        });
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
  if (this.filter === 'active') {
    this.displayedPicklists = this.picklists.filter(p => p.isActive);
  } else if (this.filter === 'inactive') {
    this.displayedPicklists = this.picklists.filter(p => !p.isActive);
  } else {
    this.displayedPicklists = [...this.picklists];
  }
}

  // Transition handlers
  onMarkReady(p: any): void {
    // Load details and check availability first for safety
    this.picklistService.loadDetailPicklists(p.id).subscribe({
      next: (details) => {
        const payload = details.map((d: any) => ({
          id: d.id,
          detailPicklistId: d.id,
          article: d.article,
          status: d.status,
          emplacement: d.emplacement,
          quantite: d.quantite,
          picklistId: d.picklistId,
          isActive: d.isActive
        }));
        this.picklistService.checkInventoryAvailability(payload).subscribe({
          next: (res) => {
            const allOk = res.every(r => r.isAvailable === true);
            if (!allOk) {
              this._snackBar.open('Disponibilité insuffisante pour au moins un article', '', { duration: 4000 });
              return;
            }
            this.picklistService.markReady(p.id).subscribe({
              next: () => { this._snackBar.open('Pickliste marquée Prête', '', { duration: 3000 }); this.loadpicklists(); },
              error: (e) => { console.error(e); this._snackBar.open('Erreur marquage Prête', 'Erreur', { duration: 4000 }); }
            });
          },
          error: (err) => { console.error(err); this._snackBar.open('Erreur vérification disponibilité', 'Erreur', { duration: 4000 }); }
        });
      },
      error: (err) => { console.error(err); this._snackBar.open('Erreur chargement détails', 'Erreur', { duration: 4000 }); }
    });
  }

  onStartShipping(p: any): void {
    this.picklistService.startShipping(p.id).subscribe({
      next: () => { this._snackBar.open('Expédition démarrée', '', { duration: 3000 }); this.loadpicklists(); },
      error: (e) => { console.error(e); this._snackBar.open('Erreur démarrage expédition', 'Erreur', { duration: 4000 }); }
    });
  }

  onComplete(p: any): void {
    this.picklistService.complete(p.id).subscribe({
      next: () => { this._snackBar.open('Pickliste terminée', '', { duration: 3000 }); this.loadpicklists(); },
      error: (e) => { console.error(e); this._snackBar.open('Erreur terminaison', 'Erreur', { duration: 4000 }); }
    });
  }

  onCheckAvailability(p: any): void {
    this.picklistService.loadDetailPicklists(p.id).subscribe({
      next: (details) => {
        const payload = details.map((d: any) => ({
          id: d.id,
          detailPicklistId: d.id,
          article: d.article,
          status: d.status,
          emplacement: d.emplacement,
          quantite: d.quantite,
          picklistId: d.picklistId,
          isActive: d.isActive
        }));
        this.picklistService.checkInventoryAvailability(payload).subscribe({
          next: (res) => {
            const ok = res.filter(r => r.isAvailable);
            const ko = res.filter(r => !r.isAvailable);
            this._snackBar.open(`Disponibles: ${ok.length}, Indisponibles: ${ko.length}`, '', { duration: 4000 });
          },
          error: (e) => { console.error(e); this._snackBar.open('Erreur vérification disponibilité', 'Erreur', { duration: 4000 }); }
        });
      },
      error: (e) => { console.error(e); this._snackBar.open('Erreur chargement détails', 'Erreur', { duration: 4000 }); }
    });
  }
}









@Component({
  selector: 'app-create-picklist-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Créer une Pickliste</h2>
    <div mat-dialog-content class="flex flex-col gap-4">

      <mat-form-field appearance="fill">
        <mat-label>Nom</mat-label>
        <input matInput [(ngModel)]="picklist.name" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Type</mat-label>
        <input matInput [(ngModel)]="picklist.type" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Quantité</mat-label>
        <input matInput [(ngModel)]="picklist.quantity" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Magasin</mat-label>
        <mat-select [(ngModel)]="picklist.warehouseId">
          <mat-option [value]="null">select one</mat-option>
          <mat-option *ngFor="let w of data.warehouses" [value]="w.id">
            {{ w.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Ligne</mat-label>
        <mat-select [(ngModel)]="picklist.lineId">
          <mat-option *ngFor="let l of data.lines" [value]="l.id">
            {{ l.description }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="fill">
  <mat-label>Statut</mat-label>
  <mat-select [(ngModel)]="picklist.statusId">
    <mat-option *ngFor="let s of status" [value]="s.id">
      {{ s.description }}
    </mat-option>
  </mat-select>
</mat-form-field>

    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Annuler</button>
      <button mat-flat-button color="primary" (click)="create()" [disabled]="!isValid()">Créer</button>
    </div>
  `
})
export class CreatePicklistDialogComponent implements OnInit{
  picklist = {
    name: '',
    type: '',
    quantity: '',
    lineId: null,
    warehouseId: null,
    statusId: null // default status if needed
  };
  status :any[]=[]

  constructor(
    private dialogRef: MatDialogRef<CreatePicklistDialogComponent>,
    private picklistService : PicklistService,
    @Inject(MAT_DIALOG_DATA) public data: { warehouses: any[]; lines: any[] }
  ) {}

  ngOnInit(): void {
     this.picklistService.getstatus().pipe()
    .subscribe({
      next: (data) => {
       this.status=data
      },
      error: (err) => {
        console.error('Erreur lors du chargement des warehouses:', err);
       
      }
    });
  }
  cancel() {
    this.dialogRef.close();
  }

  create() {
    this.dialogRef.close(this.picklist);
  }

 isValid() {
  return this.picklist.name &&
         this.picklist.type &&
         this.picklist.quantity &&
         this.picklist.lineId &&
         this.picklist.warehouseId &&
         this.picklist.statusId;
}
}










@Component({
  selector: 'app-edit-picklist-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Modifier la Pickliste</h2>
    <div mat-dialog-content class="flex flex-col gap-4">

      <mat-form-field appearance="fill">
        <mat-label>Nom</mat-label>
        <input matInput [(ngModel)]="picklist.name" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Type</mat-label>
        <input matInput [(ngModel)]="picklist.type" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Quantité</mat-label>
        <input matInput [(ngModel)]="picklist.quantity" />
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Magasin</mat-label>
        <mat-select [(ngModel)]="picklist.warehouseId">
          <mat-option *ngFor="let w of data.warehouses" [value]="w.id">{{ w.name }}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Ligne</mat-label>
        <mat-select [(ngModel)]="picklist.lineId">
          <mat-option *ngFor="let l of data.lines" [value]="l.id">{{ l.description }}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Statut</mat-label>
        <mat-select [(ngModel)]="picklist.status.id">
          <mat-option *ngFor="let s of status" [value]="s.id">{{ s.description }}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Annuler</button>
      <button mat-flat-button color="primary" (click)="update()" [disabled]="!isValid()">Mettre à jour</button>
    </div>
  `
})
export class EditPicklistDialogComponent implements OnInit {
  picklist: any = {};
  status: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<EditPicklistDialogComponent>,
    private picklistService: PicklistService,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: { picklistData: any; warehouses: any[]; lines: any[] }
  ) {}

  ngOnInit(): void {
    this.picklist = { ...this.data.picklistData };

    this.picklistService.getstatus().subscribe({
      next: (data) => {
        this.status = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statuts:', err);
      }
    });
  }

  cancel(): void {
    this.dialogRef.close('cancelled');
  }

  update(): void {
    const finalpicklis ={ 
      name : this.picklist.name,
      type : this.picklist.type,
      quantity: this.picklist.quantity ,
      lineId: this.picklist.lineId ,
      warehouseId: this.picklist.warehouseId ,
      statusId: this.picklist.status.id,
    }
  
    
    this.picklistService.updatePicklist(this.picklist.id, finalpicklis).subscribe({
      next: () => {
        this._snackBar.open('Pickliste mise à jour avec succès.', '', { duration: 3000 });
        this.dialogRef.close('updated');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la pickliste:', err);
        this._snackBar.open('Erreur lors de la mise à jour.', 'Erreur', { duration: 5000 });
        this.dialogRef.close('error');
      }
    });
  }

  isValid(): boolean {
    return this.picklist.name &&
           this.picklist.type &&
           this.picklist.quantity &&
           this.picklist.lineId &&
           this.picklist.warehouseId &&
           this.picklist.status.id;
  }
}