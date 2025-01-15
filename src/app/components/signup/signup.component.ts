import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignupService } from './services/signup.service';
import { UtilService } from '../../globalServices/utils/util.service';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  signUpForm!: FormGroup;
  httpError: string = '';
  profilePicture: File | null = null;

  constructor(
    private fb: FormBuilder,
    private utilService: UtilService,
    private signupService: SignupService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          this.utilService.fullNameValidator(),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      agreeTerms: [false, Validators.requiredTrue],
      isPromotionalEmails: [false],
    });
  }

  get email() {
    return this.signUpForm.get('email');
  }
  get fullName() {
    return this.signUpForm.get('fullName');
  }
  get password() {
    return this.signUpForm.get('password');
  }
  get agreeTerms() {
    return this.signUpForm.get('agreeTerms');
  }
  get isPromotionalEmails() {
    return this.signUpForm.get('isPromotionalEmails');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.profilePicture = input.files[0];
    }
  }

  onSubmit() {
    if (!this.signUpForm.valid) {
      return;
    }
    const { agreeTerms, ...userData } = this.signUpForm.value;

    const formData = new FormData();
    formData.append('data', JSON.stringify(userData));

    if (this.profilePicture) {
      formData.append('picture', this.profilePicture);
    }

    this.signupService.signUp$(formData).subscribe({
      next: (response) => {
        this.httpError = '';
        this.router.navigate(['/login']);
        this.signUpForm.reset();
      },
      error: (err) => {
        this.httpError = err.error.message.message;
      },
      complete: () => {},
    });
  }
}
