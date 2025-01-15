export interface SignupRequest {
    email: string;
    fullName: string;
    password: string;
    promotionalEmails?: Boolean
  }