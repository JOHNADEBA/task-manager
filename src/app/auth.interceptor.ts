import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from './globalServices/token/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  const accessToken = tokenService.getAccessTokenSync(); // Get the token

  // Clone the request and add the Authorization header if the token exists
  const authReq = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : req;

  // Pass the cloned request to the next handler
  return next(authReq);
};
