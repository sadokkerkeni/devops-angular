import { NgIf } from '@angular/common';
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

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        NgIf,
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

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.signUpForm = this._formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            matricule: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            agreements: [false, Validators.requiredTrue],
        });
    }

signUp(): void {
    if (this.signUpForm.invalid) {
        // ... your existing validation logic is fine
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
