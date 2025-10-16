import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoleService } from './user-role.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { UserService } from 'app/core/user/user.service';
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
    FormsModule
  ],
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss']
})
export class UserRoleComponent implements OnInit {
      private _unsubscribeAll: Subject<any> = new Subject<any>();
  // Expected structure for users: { id, matricule, firstName, lastName, fullName, email, roles: [{id, name}, ...] }
  users: any[] = [];
  // Expected structure for roles: { id, name }
  roles: any[] = [];
  selectedUser: any = null;
  // Store the current role IDs for the selected user
  currentUserRoleIds: number[] = [];
  loadingUsers = false;
  loadingRoles = false;
  assigningRoles = false;
  
  // Admin create user
  showCreateUser = false;
  companies: any[] = [];
  createUserPayload: any = { firstName: '', lastName: '', matricule: '', email: '', password: '' };

  // Columns for the user table
  displayedUserColumns: string[] = ['id', 'fullName', 'matricule', 'email', 'roles', 'actions'];

  constructor(
    private userRoleService: UserRoleService,
    private snackBar: MatSnackBar,
    private _userService :UserService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadCompanies();
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.userRoleService.getAllUsers().subscribe({
      next: (data) => {
        console.log(data);
        
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

  loadCompanies(): void {
    this.userRoleService.getCompanies().subscribe({
      next: (data) => {
        this.companies = data;
      },
      error: (err) => {
        console.error('Error loading companies', err);
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
    var userIdStr = null;
     this._userService.user$
                .pipe((takeUntil(this._unsubscribeAll)))
                .subscribe((user: any) =>
                { console.log(user);
                
                  userIdStr = user.id
                });
    if (userIdStr) {
      
      return userIdStr
    }
    return null;
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

  toggleCreateUser(): void {
    this.showCreateUser = !this.showCreateUser;
  }

  createUser(): void {
    const p = this.createUserPayload;
    if (!p.firstName || !p.lastName || !p.email || !p.password || !p.matricule) {
      this.snackBar.open('Veuillez remplir tous les champs', 'Fermer', { duration: 4000 });
      return;
    }
    this.userRoleService.adminCreateUser(p).subscribe({
      next: () => {
        this.snackBar.open('Utilisateur créé. Assignez un rôle pour activer la connexion.', 'Fermer', { duration: 4000 });
        this.showCreateUser = false;
        const createdEmail = p.email;
        this.createUserPayload = { firstName: '', lastName: '', matricule: '', email: '', password: '' };
        // Reload and auto-open role assignment for the new user
        this.userRoleService.getAllUsers().subscribe({
          next: (data) => {
            this.users = data;
            const justCreated = this.users.find(u => (u.email || '').toLowerCase() === createdEmail.toLowerCase());
            if (justCreated) {
              this.manageRoles(justCreated);
              this.snackBar.open('Sélection automatique de l\'utilisateur créé pour l\'assignation des rôles.', 'Fermer', { duration: 4000 });
            }
          },
          error: () => {
            // fallback to simple reload
            this.loadUsers();
          }
        });
      },
      error: (err) => {
        console.error('Error creating user', err);
        this.snackBar.open('Erreur lors de la création de l\'utilisateur', 'Fermer', { duration: 5000 });
      }
    });
  }
}