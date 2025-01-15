import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { SettingsRequest } from '../settings.interface';
import { LoginResponse } from '../../login/login.interface';
import { AuthService } from '../../../globalServices/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private apiUrl = environment.apiUrl;
  private id!: number;
  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.getUser$().subscribe((user) => {
      if (user) {
        this.id = user.id;
      }
    });
  }

  saveSettings(data: SettingsRequest) {
    return this.http
      .patch<LoginResponse>(`${this.apiUrl}/auth/${this.id}`, data)
      .pipe(
        tap((response) => {
          this.authService.fetchUserById(this.id.toString());
        }),
        catchError((err) => {
          // Re-throw the error or handle it as needed
          return throwError(() => err);
        })
      );
  }

  deactivateAccount() {
    return this.http.patch<LoginResponse>(
      `${this.apiUrl}/auth/deactivate/${this.id}`,
      {
        id: this.id,
      }
    );
  }
}
