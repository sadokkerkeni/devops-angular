import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoleService } from './user-role.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PaginationComponent, PaginationEvent } from 'app/shared/components/pagination/pagination.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-role',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationComponent
  ],
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss']
})
export class UserRoleComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  // Users data
  users: any[] = [];
  displayedUsers: any[] = [];
  
  // Roles data
  roles: any[] = [];
  
  // Search & Filters
  searchQuery: string = '';
  roleFilterPills = [
    { label: 'Tous', value: 'all' },
    { label: 'Administrateur', value: 'Administrateur' },
    { label: 'User', value: 'User' },
    { label: 'Magasinier', value: 'Magasinier' },
    { label: 'Opérateur', value: 'Opérateur' },
    { label: 'Chef de ligne', value: 'Chef de ligne' },
    { label: 'Appro-ligne', value: 'Appro-ligne' },
    { label: 'Contrôle qualité', value: 'Contrôle qualité' },
  ];
  activeRoleFilter: string = 'all';
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];
  
  // Selected user for role management
  selectedUser: any = null;
  currentUserRoleIds: number[] = [];
  
  // Loading states
  loadingUsers = false;
  loadingRoles = false;
  assigningRoles = false;
  invitingUser = false;
  
  // Invite user to company
  showInviteUser = false;
  inviteForm: FormGroup;
  currentCompanyId: number | null = null;

  // Edit user dialog
  showEditDialog = false;
  selectedUserForEdit: any = null;
  editUserForm: FormGroup;
  savingUser = false;
  userDialogError = '';
  loadingEditUser = false;

  // Status toggle
  togglingUserId: number | null = null;
  currentAdminId: number | null = null;

  // Columns for the user table
  displayedUserColumns: string[] = ['id', 'fullName', 'matricule', 'email', 'roles', 'actions'];

  constructor(
    private userRoleService: UserRoleService,
    private snackBar: MatSnackBar,
    private _userService: UserService,
    private _authService: AuthService,
    private _formBuilder: FormBuilder
  ) {
    // Initialize invite form with validation
    this.inviteForm = this._formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      matricule: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['User', Validators.required]
    });
    this.resetInviteForm();

    this.editUserForm = this._formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      matricule: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      state: [true]
    });
  }

  ngOnInit(): void {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.currentAdminId = user?.id ?? null;
      });

    this.loadSavedFilters();
    this.loadUsers();
    this.loadRoles();
    this.getCurrentCompanyId();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * TrackBy to optimize ngFor rendering
   */
  trackById(index: number, item: any): number | string {
    return item?.id ?? index;
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.userRoleService.getAllUsers().subscribe({
      next: (data) => {
        console.log('[UserRoleComponent] Loaded users:', data);
        this.users = data || [];
        this.applyFilters();
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('❌ Erreur lors du chargement des utilisateurs', 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loadingUsers = false;
        this.users = [];
        this.displayedUsers = [];
      }
    });
  }

  // ============================================
  // FILTERING & SEARCH
  // ============================================
  
  applyFilters(): void {
    let filtered = [...this.users];

    // Apply role filters
    if (this.activeRoleFilter !== 'all') {
      filtered = filtered.filter(u => {
        return u.roles && u.roles.some((r: any) => 
          r.name?.toLowerCase() === this.activeRoleFilter.toLowerCase()
        );
      });
    }

    // Apply search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(u => {
        const nameMatch = String(u.fullName || '').toLowerCase().includes(query);
        const emailMatch = String(u.email || '').toLowerCase().includes(query);
        const matriculeMatch = String(u.matricule || '').toLowerCase().includes(query);
        const idMatch = String(u.id || '').includes(query);
        return nameMatch || emailMatch || matriculeMatch || idMatch;
      });
    }

    this.displayedUsers = filtered;
    this.currentPage = 0; // Reset to first page when filters change
    this.saveFiltersToStorage();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.activeRoleFilter = 'all';
    this.currentPage = 0;
    this.applyFilters();
    this.snackBar.open('🔄 Filtres réinitialisés', '', { 
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  setRoleFilter(value: string): void {
    this.activeRoleFilter = value;
    this.applyFilters();
  }

  isRoleFilterActive(value: string): boolean {
    return this.activeRoleFilter === value;
  }

  hasActiveFilters(): boolean {
    return this.searchQuery.trim() !== '' || this.activeRoleFilter !== 'all';
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    if (this.activeRoleFilter !== 'all') count++;
    return count;
  }

  getUserCountLabel(): string {
    const count = this.displayedUsers.length;
    return `${count || 0} ${count > 1 ? 'utilisateurs' : 'utilisateur'}`;
  }

  getRoleBadgeClass(roleName: string): string {
    const normalized = (roleName || '').toLowerCase();
    const palette: Record<string, string> = {
      administrateur: 'badge-admin',
      admin: 'badge-admin',
      user: 'badge-user',
      utilisateur: 'badge-user',
      magasinier: 'badge-magasinier',
      opérateur: 'badge-operator',
      operateur: 'badge-operator',
      'chef de ligne': 'badge-chef',
      'appro-ligne': 'badge-appro',
      'contrôle qualité': 'badge-quality',
      'controle qualite': 'badge-quality'
    };
    return palette[normalized] || 'badge-default';
  }

  // ============================================
  // PAGINATION
  // ============================================
  
  paginatedUsers(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.displayedUsers.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.saveFiltersToStorage();
  }

  // ============================================
  // PERSISTENCE (localStorage)
  // ============================================
  
  saveFiltersToStorage(): void {
    const filters = {
      searchQuery: this.searchQuery,
      activeRoleFilter: this.activeRoleFilter,
      pageSize: this.pageSize,
      currentPage: this.currentPage
    };
    localStorage.setItem('user_role_filters', JSON.stringify(filters));
  }

  loadSavedFilters(): void {
    const saved = localStorage.getItem('user_role_filters');
    if (saved) {
      try {
        const filters = JSON.parse(saved);
        this.searchQuery = filters.searchQuery || '';
        this.activeRoleFilter = filters.activeRoleFilter || 'all';
        this.pageSize = filters.pageSize || 10;
        this.currentPage = 0; // Always start at page 0
      } catch (e) {
        console.error('Error loading saved filters:', e);
      }
    }
  }

  loadRoles(): void {
    this.loadingRoles = true;
    this.userRoleService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.loadingRoles = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.snackBar.open('Erreur lors du chargement des rôles', 'Fermer', {
          duration: 5000,
        });
        this.loadingRoles = false;
      }
    });
  }

  getCurrentCompanyId(): void {
    this.currentCompanyId = this._authService.getCompanyId();
  }

  onEditUser(user: any): void {
    if (!user) return;

    this.selectedUserForEdit = user;
    this.showEditDialog = true;
    this.userDialogError = '';
    this.savingUser = false;
    this.loadingEditUser = true;
    this.patchEditUserForm(user);

    this.userRoleService.getUserDetails(user.id)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (details) => {
          this.loadingEditUser = false;
          this.patchEditUserForm(details);
        },
        error: (error) => {
          this.loadingEditUser = false;
          console.error('Error loading user details:', error);
          this.userDialogError = error.error?.message || 'Impossible de charger les informations de cet utilisateur';
        }
      });
  }

  onManageRoles(user: any): void {
    this.manageRoles(user);
    this.scrollRolesPanelIntoView();
  }

  onToggleStatus(user: any): void {
    if (this.togglingUserId) {
      return;
    }

    if (this.isCurrentUser(user)) {
      this.snackBar.open('Vous ne pouvez pas changer votre propre statut', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const action = user?.state === false ? 'activer' : 'désactiver';
    const confirmation = confirm(`Voulez-vous ${action} ${user?.fullName || 'cet utilisateur'} ?`);
    if (!confirmation) {
      return;
    }

    this.togglingUserId = user.id;
    this.userRoleService.toggleUserState(user.id)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.snackBar.open(response?.message || 'Statut mis à jour ✅', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.togglingUserId = null;
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error toggling user state:', error);
          this.snackBar.open(error.error?.message || 'Erreur lors de la mise à jour du statut', 'Fermer', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
          this.togglingUserId = null;
        }
      });
  }

  onSelectUser(user: any): void {
    this.selectedUser = user;

    
    // Initialize currentUserRoleIds with the IDs of the roles the user currently has
    // user.roles is now an array of objects like [{id: 1, name: "Admin"}, ...]
    this.currentUserRoleIds = user.roles.map((role: any) => role.id);
  }

  deselectUser(): void {
    this.selectedUser = null;
    this.currentUserRoleIds = [];
  }

  manageRoles(user: any): void {
    this.onSelectUser(user);
  }

  private scrollRolesPanelIntoView(): void {
    setTimeout(() => {
      const panel = document.getElementById('rolesManagementPanel');
      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  // Check if a specific role ID is assigned to the selected user
  isRoleAssigned(roleId: number): boolean {
    return this.currentUserRoleIds.includes(roleId);
  }

  // Toggle the assignment status of a role for the selected user
  toggleRole(roleId: number): void {
    if (!this.selectedUser) return;

    const index = this.currentUserRoleIds.indexOf(roleId);
    if (index > -1) {
      // Role is currently assigned, remove it
      this.currentUserRoleIds.splice(index, 1);
    } else {
      // Role is not assigned, add it
      this.currentUserRoleIds.push(roleId);
    }
  }

  private getCurrentUserId(): number | null {
    return this.currentAdminId;
  }



  // Save all role assignments for the selected user
    saveRoles(): void {
    if (!this.selectedUser) return;
    
    const currentAdminId = this.getCurrentUserId();
    console.log(currentAdminId);
    if (currentAdminId === null) {
      console.log(currentAdminId);
      
      
      this.snackBar.open('Impossible de déterminer l\'ID de l\'administrateur', 'Fermer', {
        duration: 5000,
      });
      console.error('Current admin user ID could not be determined.');
      return;
    }

    this.assigningRoles = true;
    
    if (this.currentUserRoleIds.length === 0){
       this.assigningRoles = false; // Stop the process immediately
    this.snackBar.open("Veuillez sélectionner au moins un rôle, ou annuler l'opération.", 'Fermer', {
        duration: 5000, // Show for longer
        // Optionally, change the color to indicate warning
        // panelClass: ['warning-snackbar'] // Define this class in your global styles if needed
    });
    console.log("Save cancelled: No roles selected for user", this.selectedUser.id);
    return; 
    }
    // Structure the request body to match AssignRolesRequest DTO
    const assignRolesRequest = {
      
      roleIds: this.currentUserRoleIds,
      assignedById: currentAdminId, // ID of the admin performing the action
      note: `Rôles assignés par l'administrateur (ID: ${currentAdminId}) via l'interface` // Optional note
    };

    // API expects POST /api/users/admin-assign-roles/{id} with body matching AssignRolesRequest
    this.userRoleService.assignRolesToUser(this.selectedUser.id, assignRolesRequest).subscribe({
      next: (response) => { // Handle the response
        this.assigningRoles = false;
        console.log('Roles assigned successfully:', response); // Log success response
        this.snackBar.open(response.message || 'Rôles mis à jour avec succès', 'Fermer', {
          duration: 3000,
        });
        // Reload users to reflect the change
        this.loadUsers();
        // Optionally deselect the user after successful assignment
        // this.deselectUser();
      },
      error: (error) => {
        console.error('Error assigning roles:', error);
        this.assigningRoles = false;
        // Check if it's a specific error message from the backend
        let errorMessage = 'Erreur lors de la mise à jour des rôles';
        // Handle different error structures (e.g., error.error or error.message)
        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
        });
      }
    });
  }

  toggleInviteUser(): void {
    this.showInviteUser = !this.showInviteUser;
    if (this.showInviteUser) {
      this.getCurrentCompanyId();
    }
    this.resetInviteForm();
  }

  inviteUser(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      this.snackBar.open('⚠️ Veuillez remplir correctement tous les champs', 'Fermer', { 
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.currentCompanyId) {
      this.snackBar.open('❌ ID de l\'entreprise introuvable', 'Fermer', { 
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.invitingUser = true;
    const payload = {
      ...this.inviteForm.value,
      companyId: this.currentCompanyId
    };
    
    this.userRoleService.inviteUserToCompany(payload).subscribe({
      next: (response) => {
        this.invitingUser = false;
        this.snackBar.open('✅ Utilisateur invité avec succès !', 'Fermer', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.showInviteUser = false;
        this.resetInviteForm();
        this.loadUsers();
      },
      error: (err) => {
        this.invitingUser = false;
        console.error('Error inviting user', err);
        
        let errorMsg = '❌ Erreur lors de l\'invitation';
        if (err.status === 409) {
          errorMsg = '❌ Cet email est déjà utilisé';
        } else if (err.status === 400) {
          errorMsg = '❌ Données invalides';
        }
        
        this.snackBar.open(errorMsg, 'Fermer', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Helper method to get form control errors
  getErrorMessage(fieldName: string): string {
    const control = this.inviteForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) return 'Ce champ est requis';
    if (control.hasError('email')) return 'Email invalide';
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `Minimum ${minLength} caractères`;
    }
    return '';
  }

  private resetInviteForm(): void {
    this.inviteForm.reset({
      firstName: '',
      lastName: '',
      matricule: '',
      email: '',
      password: '',
      role: 'User'
    });
    this.inviteForm.markAsPristine();
    this.inviteForm.markAsUntouched();
    this.inviteForm.updateValueAndValidity();
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
    this.selectedUserForEdit = null;
    this.userDialogError = '';
    this.loadingEditUser = false;
    this.editUserForm.reset({
      firstName: '',
      lastName: '',
      matricule: '',
      email: '',
      state: true
    });
  }

  saveUser(): void {
    if (this.editUserForm.invalid || !this.selectedUserForEdit) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    this.savingUser = true;
    const payload = {
      ...this.editUserForm.value
    };

    this.userRoleService.updateUser(this.selectedUserForEdit.id, payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: () => {
          this.savingUser = false;
          this.snackBar.open('Utilisateur mis à jour ✅', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.closeEditDialog();
          this.loadUsers();
        },
        error: (error) => {
          this.savingUser = false;
          console.error('Error updating user:', error);
          this.userDialogError = error.error?.message || 'Erreur lors de la mise à jour utilisateur';
          this.snackBar.open(this.userDialogError, 'Fermer', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  isCurrentUser(user: any): boolean {
    if (!user) return false;
    return Number(user.id) === Number(this.currentAdminId);
  }

  isTogglingUser(user: any): boolean {
    return this.togglingUserId === user?.id;
  }

  private patchEditUserForm(user: any): void {
    if (!user) return;
    const fullName = user.fullName || '';
    const [firstFromFull, ...rest] = fullName.split(' ');
    const lastFromFull = rest.join(' ');

    this.editUserForm.patchValue({
      firstName: user.firstName || firstFromFull || '',
      lastName: user.lastName || lastFromFull || '',
      matricule: user.matricule || '',
      email: user.email || '',
      state: user.state !== false
    });
  }
}