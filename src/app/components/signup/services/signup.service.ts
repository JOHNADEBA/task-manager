import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SignupRequest } from '../signup.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  signUp$(formData: FormData): Observable<SignupRequest> {
    return this.http.post<SignupRequest>(
      `${this.apiUrl}/auth/register`,
      formData
    );
  }
}
