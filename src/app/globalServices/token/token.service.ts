import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UtilService } from '../utils/util.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private accessToken = new BehaviorSubject<string | null>(null);
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private utilService: UtilService) {
    this.initializeToken();
  }

  private initializeToken() {
    if (this.utilService.isBrowser()) {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedAccessToken && storedRefreshToken) {
        this.accessToken.next(storedAccessToken);
        this.startTokenRefresh(); // Optionally refresh token on app load
      }
    }
  }

  hasValidTokens(): boolean {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    return !!storedAccessToken && !!storedRefreshToken;
  }

  setTokens(tokens: {
    accessToken: string;
    refreshToken: string;
    userId: string;
  }) {
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('userId', tokens.userId);
    this.accessToken.next(tokens.accessToken);
  }

  refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log(refreshToken);

    if (refreshToken) {
      this.http
        .post<{ accessToken: string; refreshToken: string }>(
          `${this.apiUrl}/auth/refresh-token`,
          { refreshToken }
        )
        .subscribe({
          next: (tokens) =>
            this.setTokens({
              ...tokens,
              userId: localStorage.getItem('userId') || '',
            }),
          error: (error) => {
            console.log(error);

            this.clearTokens();
          },
        });
    }
  }

  startTokenRefresh() {
    setInterval(() => this.refreshAccessToken(), 14 * 60 * 1000); // Refresh every 14 minutes
  }

  getAccessToken() {
    return this.accessToken.asObservable();
  }

  clearTokens() {
    if (this.utilService.isBrowser()) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
    }
    this.accessToken.next(null);
  }

  getAccessTokenSync(): string | null {
    return this.accessToken.getValue();
  }
}
