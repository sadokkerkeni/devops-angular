import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  user: User;
  profileForm: FormGroup;
  isEditing = false;
  isAdmin = false;
  loading = false;
  saving = false;

  constructor(
    private _httpClient: HttpClient,
    private _userService: UserService,
    private _authService: AuthService,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) {
    this.profileForm = this._fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      matricule: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Subscribe to user changes
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: User) => {
        this.user = user;
        
        // Check if user is admin
        this.isAdmin = user && user.roles && (
          user.roles.includes('Administrateur') || 
          user.roles.includes('Admin')
        );

        // Load profile data
        if (user) {
          this.loadProfile();
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadProfile(): void {
    this.loading = true;
    const token = this._authService.accessToken;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this._httpClient.get<any>('http://localhost:5288/api/users/user-profile', { headers })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (profile) => {
          console.log('[ProfileComponent] Profile loaded:', profile);
          
          // Populate form with profile data
          this.profileForm.patchValue({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            matricule: profile.matricule || '',
            email: profile.email || ''
          });

          // Disable form if not in edit mode
          if (!this.isEditing) {
            this.profileForm.disable();
          }

          // Update user object with full profile data (including roles)
          if (this.user) {
            this.user = {
              ...this.user,
              name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
              roles: profile.roles || []
            };
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('[ProfileComponent] Error loading profile:', error);
          this._snackBar.open('Erreur lors du chargement du profil', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
        }
      });
  }

  toggleEdit(): void {
    // MODIFIED: All users can edit their profile
    this.isEditing = !this.isEditing;
    
    if (this.isEditing) {
      // Enable form fields for editing
      this.profileForm.enable();
    } else {
      // Disable form fields and reset to original values
      this.profileForm.disable();
      this.loadProfile();
    }
  }

  saveProfile(): void {
    // MODIFIED: All users can save their profile (removed isAdmin check)
    if (!this.profileForm.valid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      this._snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.saving = true;
    const token = this._authService.accessToken;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Ensure all required fields are present and not empty
    const formValue = this.profileForm.value;
    
    // Validate that all required fields are not empty after trimming
    const trimmedMatricule = formValue.matricule?.trim();
    if (!trimmedMatricule) {
      this._snackBar.open('Le matricule est requis et ne peut pas être vide', 'Fermer', {
        duration: 3000
      });
      this.saving = false;
      this.profileForm.get('matricule')?.markAsTouched();
      this.profileForm.get('matricule')?.setErrors({ required: true });
      return;
    }

    const updateData = {
      firstName: formValue.firstName?.trim() || '',
      lastName: formValue.lastName?.trim() || '',
      matricule: trimmedMatricule,
      email: formValue.email?.trim() || ''
    };

    this._httpClient.put('http://localhost:5288/api/users/user-update-profile', updateData, { headers })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response: any) => {
          console.log('[ProfileComponent] Profile updated:', response);
          
          // Reload profile data from backend
          this._httpClient.get<any>('http://localhost:5288/api/users/user-profile', { headers })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (updatedProfile) => {
                console.log('[ProfileComponent] Reloaded profile:', updatedProfile);
                
                // Update UserService with new profile data
                const updatedUser: User = {
                  id: updatedProfile.id != null ? updatedProfile.id.toString() : '',
                  name: `${updatedProfile.firstName || ''} ${updatedProfile.lastName || ''}`.trim(),
                  email: updatedProfile.email || '',
                  companyId: this._authService.getCompanyId(),
                  roles: updatedProfile.roles || []
                };
                
                // Update UserService to trigger sidebar update
                this._userService.user = updatedUser;
                
                // Update local user object
                this.user = updatedUser;
                
                // Update form with new values
                this.profileForm.patchValue({
                  firstName: updatedProfile.firstName || '',
                  lastName: updatedProfile.lastName || '',
                  matricule: updatedProfile.matricule || '',
                  email: updatedProfile.email || ''
                });
                
                this.isEditing = false;
                this.saving = false;
                this.profileForm.disable(); // Disable form after saving
                
                this._snackBar.open('Profil mis à jour avec succès ✅', 'Fermer', {
                  duration: 3000
                });
              },
              error: (reloadError) => {
                console.error('[ProfileComponent] Error reloading profile:', reloadError);
                this.isEditing = false;
                this.saving = false;
                this.profileForm.disable();
                
                // Still show success since update worked, just couldn't reload
                this._snackBar.open('Profil mis à jour ✅ (rechargement en cours...)', 'Fermer', {
                  duration: 3000
                });
              }
            });
        },
        error: (error) => {
          console.error('[ProfileComponent] Error updating profile:', error);
          this._snackBar.open('Erreur lors de la mise à jour du profil', 'Fermer', {
            duration: 3000
          });
          this.saving = false;
        }
      });
  }
}

