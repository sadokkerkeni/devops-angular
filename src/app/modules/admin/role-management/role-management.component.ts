import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RoleService } from './role.service';
import { UserRoleService } from '../user-role/user-role.service';
import { Subject, takeUntil } from 'rxjs';
import { ViewEncapsulation } from '@angular/core';

export interface Role {
  id: number;
  name: string;
  state?: boolean;
  creationDate?: string;
  updateDate?: string;
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSlideToggleModule
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RoleManagementComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  // Roles management
  roles: Role[] = [];
  loadingRoles = false;
  searchQuery = '';
  
  // Table columns
  displayedColumns: string[] = ['id', 'name', 'state', 'actions'];
  userDisplayedColumns: string[] = ['id', 'fullName', 'matricule', 'email', 'roles', 'actions'];
  
  // Dialog state
  showCreateDialog = false;
  showEditDialog = false;
  showEditUserDialog = false;
  selectedRole: Role | null = null;
  savingRole = false;
  roleDialogError = '';
  
  // Form data
  roleForm = {
    name: '',
    state: true
  };
  
  // Users and role assignment
  users: any[] = [];
  selectedUser: any = null;
  currentUserRoleIds: number[] = [];
  loadingUsers = false;
  assigningRoles = false;
  showInviteUser = false;
  inviteUserPayload: any = {
    firstName: '',
    lastName: '',
    matricule: '',
    email: '',
    password: '',
    role: 'User'
  };
  selectedUserForEdit: any = null;
  editUserForm = {
    fullName: '',
    email: '',
    matricule: '',
    roles: [] as number[]
  };

  constructor(
    private roleService: RoleService,
    private userRoleService: UserRoleService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // ============================================
  // ROLE MANAGEMENT METHODS
  // ============================================

  loadRoles(): void {
    this.loadingRoles = true;
    this.roleService.getAllRoles()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
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

  onCreateRole(): void {
    this.roleForm = { name: '', state: true };
    this.roleDialogError = '';
    this.showCreateDialog = true;
  }

  onEditRole(role: Role): void {
    this.selectedRole = role;
    this.roleForm = {
      name: role.name,
      state: role.state ?? true
    };
    this.roleDialogError = '';
    this.showEditDialog = true;
  }

  saveRole(): void {
    if (!this.roleForm.name.trim()) {
      this.snackBar.open('Le nom du rôle est requis', 'Fermer', {
        duration: 3000,
      });
      return;
    }

    if (this.showCreateDialog) {
      this.createRole();
    } else if (this.showEditDialog && this.selectedRole) {
      this.updateRole();
    }
  }

  createRole(): void {
    this.savingRole = true;
    this.roleService.createRole({ name: this.roleForm.name })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.savingRole = false;
          this.snackBar.open('Rôle créé avec succès ✅', 'Fermer', {
            duration: 3000,
          });
          this.showCreateDialog = false;
          this.loadRoles();
        },
        error: (error) => {
          this.savingRole = false;
          console.error('Error creating role:', error);
          const errorMsg = error.error?.message || 'Erreur lors de la création du rôle';
          this.roleDialogError = errorMsg;
          this.snackBar.open(errorMsg, 'Fermer', {
            duration: 5000,
          });
        }
      });
  }

  updateRole(): void {
    if (!this.selectedRole) return;

    this.savingRole = true;
    this.roleService.updateRole(this.selectedRole.id, { name: this.roleForm.name })
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.savingRole = false;
          this.snackBar.open('Rôle modifié avec succès ✅', 'Fermer', {
            duration: 3000,
          });
          this.showEditDialog = false;
          this.selectedRole = null;
          this.loadRoles();
        },
        error: (error) => {
          this.savingRole = false;
          console.error('Error updating role:', error);
          const errorMsg = error.error?.message || 'Erreur lors de la modification du rôle';
          this.roleDialogError = errorMsg;
          this.snackBar.open(errorMsg, 'Fermer', {
            duration: 5000,
          });
        }
      });
  }

  deleteRole(role: Role): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) {
      return;
    }

    this.roleService.deleteRole(role.id)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.snackBar.open('Rôle supprimé avec succès ✅', 'Fermer', {
            duration: 3000,
          });
          this.loadRoles();
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          const errorMsg = error.error?.message || 'Erreur lors de la suppression du rôle';
          this.snackBar.open(errorMsg, 'Fermer', {
            duration: 5000,
          });
        }
      });
  }

  closeDialogs(): void {
    this.showCreateDialog = false;
    this.showEditDialog = false;
    this.selectedRole = null;
    this.savingRole = false;
    this.roleDialogError = '';
    this.roleForm = { name: '', state: true };
  }

  getFilteredRoles(): Role[] {
    if (!this.searchQuery.trim()) {
      return this.roles;
    }
    const query = this.searchQuery.toLowerCase();
    return this.roles.filter(role =>
      role.name.toLowerCase().includes(query) ||
      role.id.toString().includes(query)
    );
  }

  // ============================================
  // USER ROLE ASSIGNMENT METHODS
  // ============================================

  loadUsers(): void {
    this.loadingUsers = true;
    this.userRoleService.getAllUsers()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.users = data;
          this.loadingUsers = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.snackBar.open('Erreur lors du chargement des utilisateurs', 'Fermer', {
            duration: 5000,
          });
          this.loadingUsers = false;
        }
      });
  }

  onSelectUser(user: any): void {
    this.selectedUser = user;
    this.currentUserRoleIds = user.roles?.map((role: any) => role.id) || [];
  }

  deselectUser(): void {
    this.selectedUser = null;
    this.currentUserRoleIds = [];
  }

  isRoleAssigned(roleId: number): boolean {
    return this.currentUserRoleIds.includes(roleId);
  }

  toggleRole(roleId: number): void {
    const index = this.currentUserRoleIds.indexOf(roleId);
    if (index > -1) {
      this.currentUserRoleIds.splice(index, 1);
    } else {
      this.currentUserRoleIds.push(roleId);
    }
  }

  saveRoles(): void {
    if (!this.selectedUser) return;
    
    if (this.currentUserRoleIds.length === 0) {
      this.snackBar.open("Veuillez sélectionner au moins un rôle", 'Fermer', {
        duration: 5000,
      });
      return;
    }

    this.assigningRoles = true;
    const assignRolesRequest = {
      roleIds: this.currentUserRoleIds,
      assignedById: parseInt(this.selectedUser.id) || 1,
      note: 'Rôles assignés via l\'interface de gestion'
    };

    this.userRoleService.assignRolesToUser(this.selectedUser.id, assignRolesRequest)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          this.assigningRoles = false;
          this.snackBar.open(response.message || 'Rôles mis à jour avec succès ✅', 'Fermer', {
            duration: 3000,
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error assigning roles:', error);
          this.assigningRoles = false;
          const errorMsg = error.error?.message || 'Erreur lors de la mise à jour des rôles';
          this.snackBar.open(errorMsg, 'Fermer', {
            duration: 5000,
          });
        }
      });
  }

  trackById(index: number, item: any): any {
    return item.id;
  }

  trackUserById(index: number, item: any): any {
    return item.id;
  }

  getRoleBadgeClass(roleName: string): string {
    const roleMap: Record<string, string> = {
      'Administrateur': 'badge-error',
      'Admin': 'badge-error',
      'Magasinier': 'badge-info',
      'Opérateur': 'badge-success',
      'Chef de ligne': 'badge-warning',
      'Appro-ligne': 'badge-success',
      'Contrôle qualité': 'badge-warning',
      'User': 'badge-neutral'
    };
    return roleMap[roleName] || 'badge-neutral';
  }
}

