import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
} from '../../components/login/login.interface';
import { Router } from '@angular/router';
import { UtilService } from '../utils/util.service';
import { environment } from '../../../environments/environment';
import { TokenService } from '../token/token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInState = new BehaviorSubject<boolean>(false);
  loggedIn$: Observable<boolean> = this.loggedInState.asObservable();

  private userState = new BehaviorSubject<LoginResponse | null>(null);
  private apiUrl = environment.apiUrl;

  constructor(
    private utilService: UtilService,
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.initializeState();
  }

  private initializeState() {
    if (this.utilService.isBrowser()) {
      const storedUserId = localStorage.getItem('userId');

      if (this.tokenService.hasValidTokens() && storedUserId) {
        this.loggedInState.next(true);
        this.fetchUserById(storedUserId);
        this.tokenService.refreshAccessToken();
      } else {
        this.loggedInState.next(false);
      }
    }
  }

  fetchUserById(userId: string) {
    this.http.get<LoginResponse>(`${this.apiUrl}/auth/${userId}`).subscribe({
      next: (user) => {
        this.userState.next(user);
        this.toggleDarkMode(user.isDarkMode);
      },
      error: (error) => {
        console.log(error);

        this.logout();
      },
    });
  }

  toggleDarkMode(isDarkMode: boolean): void {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  isLoggedIn(): boolean {
    return this.loggedInState.value;
  }

  loginManually$(user: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, user)
      .pipe(
        tap((response) => this.handleLoginSuccess(response)),
        catchError((err) => {
          // Re-throw the error or handle it as needed
          return throwError(() => err);
        })
      );
  }

  // loginWithGoogle() {
  //   if (this.utilService.isBrowser()) {
  //     window.location.href = 'http://localhost:3000/auth/google';
  //   }
  // }

  loginWithGoogle() {
    if (this.utilService.isBrowser()) {
      const authWindow = window.open(
        'http://localhost:3000/auth/google',
        '_blank',
        'width=500,height=600'
      );

      // Listen for postMessage from the popup
      window.addEventListener('message', (event) => {
        if (event.origin === 'http://localhost:3000') {
          const userData = event.data;

          // Handle the tokens (e.g., store them in localStorage)
          if (userData && userData.accessToken) {
            this.handleLoginSuccess(userData);
          }

          // Close the popup window if necessary
          authWindow?.close();
        }
      });
    }
  }

  // To be implemented later
  // loginWithMicrosoft() {
  //   if (this.utilService.isBrowser()) {
  //     window.location.href = 'http://localhost:3000/auth/microsoft';
  //   }
  // }

  getUser$() {
    return this.userState.asObservable();
  }

  logout() {
    this.loggedInState.next(false);
    this.userState.next(null);
    this.tokenService.clearTokens();
  }

  private handleLoginSuccess(userData: any): void {
    this.loggedInState.next(true);
    this.userState.next(userData);
    this.toggleDarkMode(userData.isDarkMode);
    this.tokenService.setTokens({
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      userId: userData.id.toString(),
    });
    this.router.navigate(['/tasks']);
  }
}
