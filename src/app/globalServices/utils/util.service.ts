import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Category } from '../../globalInterfaces';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  private categories: Category[] = [
    { value: 'Work', label: 'Work' },
    { value: 'Personal', label: 'Personal' },
    { value: 'Home', label: 'Home' },
  ];
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  getCategories() {
    return this.categories;
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  isBrowser(): boolean {
    // First check for Angular Universal (SSR) environment
    if (isPlatformBrowser(this.platformId)) {
      return true;
    }

    // Fallback check for client-side app in non-SSR environment
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Custom Validator Function
  fullNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null; // Don't return an error if the value is empty, required validator will handle this
      } // Split the name by spaces
      const names = value.trim().split(' ');
      if (names.length < 2) {
        return { invalidFullName: true }; // Must contain at least two names
      } // Check each name part has at least 3 characters and contains only letters
      const valid = names.every((name: string) => /^[A-Za-z]{3,}$/.test(name));
      return valid ? null : { invalidFullName: true };
    };
  }
}
