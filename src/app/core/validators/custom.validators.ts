import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validators with regex patterns
 */

/**
 * Validator for names (first name, last name)
 * - Only letters (including accents)
 * - Minimum 2 characters
 * - Maximum 50 characters
 * - No numbers or special characters
 */
export function nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null; // Let required validator handle empty values
        }

        const value = control.value.trim();
        
        // Regex: Only letters (including French accents), spaces, hyphens, apostrophes
        // Min 2, Max 50 characters
        const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;

        if (!nameRegex.test(value)) {
            return {
                nameInvalid: {
                    message: 'Le nom doit contenir uniquement des lettres (2-50 caractères)'
                }
            };
        }

        return null;
    };
}

/**
 * Validator for email
 * - Standard email format
 * - More strict than Angular's default email validator
 */
export function emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null; // Let required validator handle empty values
        }

        const value = control.value.trim().toLowerCase();
        
        // Regex: Standard email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(value)) {
            return {
                emailInvalid: {
                    message: 'Format d\'email invalide (exemple: nom@domaine.com)'
                }
            };
        }

        return null;
    };
}

/**
 * Validator for password strength
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
 */
export function passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null; // Let required validator handle empty values
        }

        const value = control.value;
        const errors: any = {};

        // Minimum 8 characters
        if (value.length < 8) {
            errors.minLength = {
                message: 'Le mot de passe doit contenir au moins 8 caractères'
            };
        }

        // At least one uppercase letter
        if (!/[A-Z]/.test(value)) {
            errors.uppercase = {
                message: 'Le mot de passe doit contenir au moins une majuscule'
            };
        }

        // At least one lowercase letter
        if (!/[a-z]/.test(value)) {
            errors.lowercase = {
                message: 'Le mot de passe doit contenir au moins une minuscule'
            };
        }

        // At least one digit
        if (!/[0-9]/.test(value)) {
            errors.digit = {
                message: 'Le mot de passe doit contenir au moins un chiffre'
            };
        }

        // At least one special character
        if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value)) {
            errors.specialChar = {
                message: 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)'
            };
        }

        // If any errors, return them
        if (Object.keys(errors).length > 0) {
            return {
                passwordWeak: errors
            };
        }

        return null;
    };
}

/**
 * Validator for matricule
 * - Alphanumeric characters
 * - Minimum 3 characters
 * - Maximum 20 characters
 * - Can include hyphens and underscores
 */
export function matriculeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null; // Let required validator handle empty values
        }

        const value = control.value.trim();
        
        // Regex: Alphanumeric, hyphens, underscores
        // Min 3, Max 20 characters
        const matriculeRegex = /^[a-zA-Z0-9_-]{3,20}$/;

        if (!matriculeRegex.test(value)) {
            return {
                matriculeInvalid: {
                    message: 'Le matricule doit contenir 3-20 caractères alphanumériques (lettres, chiffres, tirets, underscores)'
                }
            };
        }

        return null;
    };
}

/**
 * Validator for phone number (optional, if needed)
 * - International format
 * - Optional + prefix
 */
export function phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null; // Optional field
        }

        const value = control.value.trim();
        
        // Regex: International phone format
        const phoneRegex = /^(\+?[1-9]\d{1,14}|0[1-9]\d{8,9})$/;

        if (!phoneRegex.test(value)) {
            return {
                phoneInvalid: {
                    message: 'Format de téléphone invalide'
                }
            };
        }

        return null;
    };
}

