import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { nameValidator, emailValidator, passwordStrengthValidator, matriculeValidator } from 'app/core/validators/custom.validators';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        NgIf,
        NgFor,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Get password validation errors as array
     * Returns only the first error to avoid cluttering the UI
     */
    getPasswordErrors(): string[] {
        const passwordControl = this.signUpForm.get('password');
        if (!passwordControl?.errors?.['passwordWeak']) {
            return [];
        }

        const errors: string[] = [];
        const weakErrors = passwordControl.errors['passwordWeak'];

        // Afficher une seule erreur à la fois, dans l'ordre de priorité
        if (weakErrors['minLength']) {
            errors.push(weakErrors['minLength'].message);
        } else if (weakErrors['uppercase']) {
            errors.push(weakErrors['uppercase'].message);
        } else if (weakErrors['lowercase']) {
            errors.push(weakErrors['lowercase'].message);
        } else if (weakErrors['digit']) {
            errors.push(weakErrors['digit'].message);
        } else if (weakErrors['specialChar']) {
            errors.push(weakErrors['specialChar'].message);
        }

        return errors;
    }

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.signUpForm = this._formBuilder.group({
            firstName: ['', [Validators.required, nameValidator()]],
            lastName: ['', [Validators.required, nameValidator()]],
            matricule: ['', [Validators.required, matriculeValidator()]],
            email: ['', [Validators.required, emailValidator()]],
            password: ['', [Validators.required, passwordStrengthValidator()]],
            agreements: [false, Validators.requiredTrue],
        });
    }

signUp(): void {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    if (this.signUpForm.invalid) {
        Object.keys(this.signUpForm.controls).forEach(key => {
            const control = this.signUpForm.get(key);
            if (control) {
                control.markAsTouched();
                control.markAsDirty();
            }
        });
        
        // Trouver le premier champ invalide et le mettre en focus
        const firstInvalidField = Object.keys(this.signUpForm.controls).find(key => {
            const control = this.signUpForm.get(key);
            return control && control.invalid;
        });
        
        if (firstInvalidField) {
            const element = document.getElementById(firstInvalidField);
            if (element) {
                element.focus();
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        return;
    }

    this.signUpForm.disable();
    this.showAlert = false;

    // Build payload matching backend RegisterRequest (exclude agreements)
    const { firstName, lastName, matricule, email, password } = this.signUpForm.getRawValue();
    const payload = { firstName, lastName, matricule, email, password };

    // Send the correctly structured payload
    this._authService.signUp(payload).subscribe(
        () => {
            // SUCCESS! Now navigate the user away.
            console.log('Sign-up successful!');
            // For example, navigate to the sign-in page with a success message
            this._router.navigateByUrl('/sign-in');
        },
        (error) => {
            // ... your existing error handling is fine
            console.error('Sign-up failed', error); // Log the actual error
            this.signUpForm.enable();
            this.signUpForm.reset();
            this.alert = {
                type: 'error',
                message: 'Something went wrong, please try again.',
            };
            this.showAlert = true;
        }
    );
}

}
