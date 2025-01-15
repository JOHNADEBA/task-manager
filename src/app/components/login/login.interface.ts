export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  createdAt: string; // ISO date string
  email: string;
  fullName: string;
  id: number;
  isDarkMode: boolean;
  lang: string;
  isActive: boolean;
  isPromotionalEmails: boolean;
  picture: string | null; // Can be null if no picture is provided
  refreshToken: string;
  updatedAt: string; // ISO date string
}
