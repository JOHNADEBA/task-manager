import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from '../../globalServices/auth/auth.service';
import { CommonModule } from '@angular/common';
import { UtilService } from '../../globalServices/utils/util.service';
import { SettingsService } from './services/settings.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  showPasswordFields: boolean = false;
  initialFormValues: any;
  httpError!: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    protected authService: AuthService,
    private utilService: UtilService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group(
      {
        isDarkMode: [false],
        isPromotionalEmails: [false],
        fullName: [
          '',
          [Validators.minLength(3), this.utilService.fullNameValidator()],
        ],
        currentPassword: [''],
        newPassword: [''],
        confirmPassword: [''],
        lang: ['en'],
      },
      {
        validators: this.passwordMatchValidator(
          'newPassword',
          'confirmPassword'
        ),
      }
    );
    let id;
    this.authService.getUser$().subscribe((user) => {
      if (user) {
        id = user.id;
        const { fullName, isDarkMode, isPromotionalEmails, lang } = user;
        this.settingsForm.patchValue({
          fullName,
          isDarkMode,
          isPromotionalEmails,
          lang,
        });
        // this.toggleDarkMode();
      }
    });

    // Save initial values to detect changes
    this.initialFormValues = this.settingsForm.value;
  }

  // Custom Validator Function
  passwordMatchValidator(
    newPasswordKey: string,
    confirmPasswordKey: string
  ): ValidatorFn {
    return (group: AbstractControl) => {
      const newPassword = group.get(newPasswordKey)?.value;
      const confirmPassword = group.get(confirmPasswordKey)?.value;

      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;

    if (!this.showPasswordFields) {
      this.settingsForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      this.settingsForm.get('currentPassword')?.clearValidators();
      this.settingsForm.get('newPassword')?.clearValidators();
      this.settingsForm.get('confirmPassword')?.clearValidators();
    } else {
      this.settingsForm
        .get('currentPassword')
        ?.setValidators(Validators.required);
      this.settingsForm
        .get('newPassword')
        ?.setValidators([Validators.required, Validators.minLength(6)]);
      this.settingsForm
        .get('confirmPassword')
        ?.setValidators([Validators.required, Validators.minLength(6)]);
    }

    this.settingsForm.get('currentPassword')?.updateValueAndValidity();
    this.settingsForm.get('newPassword')?.updateValueAndValidity();
    this.settingsForm.get('confirmPassword')?.updateValueAndValidity();
  }

  // Check if save button should be disabled
  isSaveButtonDisabled(): boolean {
    const currentFormValues = this.settingsForm.value;

    // Compare only relevant fields (excluding passwords if not showing)
    const {
      currentPassword: _,
      newPassword: np,
      confirmPassword: cp,
      ...formValuesToCompare
    } = currentFormValues;

    // Create an object with the same properties from the initial form values
    const {
      currentPassword,
      newPassword,
      confirmPassword,
      ...initialFormValuesToCompare
    } = this.initialFormValues;

    // Check if all password fields are filled
    const passwordFieldsFilled =
      currentFormValues.currentPassword &&
      currentFormValues.newPassword &&
      currentFormValues.confirmPassword;

    return (
      this.settingsForm.invalid ||
      (JSON.stringify(formValuesToCompare) ===
        JSON.stringify(initialFormValuesToCompare) &&
        !this.showPasswordFields) ||
      (this.showPasswordFields && !passwordFieldsFilled)
    );
  }

  toggleDarkMode(): void {
    this.authService.toggleDarkMode(this.settingsForm.get('isDarkMode')?.value);
  }

  saveSettings(): void {
    if (!this.settingsForm.valid) {
      return;
    }

    // Clone the current form values for further processing
    const currentFormValues = { ...this.settingsForm.value };

    // Remove the confirmPassword field from the values
    const { confirmPassword, ...filteredValues } = currentFormValues;

    // Exclude password fields if not showing them
    let finalValues;
    if (!this.showPasswordFields) {
      const { newPassword, currentPassword, ...valuesWithoutPasswords } =
        filteredValues;
      finalValues = valuesWithoutPasswords;
    } else {
      finalValues = filteredValues;
    }

    // Construct an object with only changed values
    const changedValues = this.getChangedValues(
      this.initialFormValues,
      finalValues
    );

    if (Object.keys(changedValues).length > 0) {
      this.settingsService.saveSettings(changedValues).subscribe({
        next: () => {
          // Update initial form values with the latest saved values
          this.initialFormValues = { ...this.settingsForm.value };

          // Reset the form to the latest initial values
          this.settingsForm.reset(this.initialFormValues);

          if (this.showPasswordFields) {
            this.togglePasswordFields();
          }

          this.httpError = '';
        },
        error: (err) => {
          this.httpError = err.error.message.message;
        },
      });
    }
  }

  // Function to get only changed values
  getChangedValues(initialValues: any, currentValues: any): any {
    const changedValues: any = {};
    Object.keys(currentValues).forEach((key) => {
      if (initialValues[key] !== currentValues[key]) {
        changedValues[key] = currentValues[key];
      }
    });
    return changedValues;
  }

  cancelSettings(): void {
    this.settingsForm.reset(this.initialFormValues);
    this.showPasswordFields = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  deleteAccount(): void {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (confirmDelete) {
      this.settingsService.deactivateAccount().subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/sign-up']);
        },
        error: (err) => {
          alert(
            'An error occurred while trying to delete your account. Please try again later.'
          );
        },
      });
    }
  }
}
