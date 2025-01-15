export interface SettingsRequest {
  currentPassword?: string;
  fullName: string;
  isDarkMode: boolean;
  isPromotionalEmails: boolean;
  lang: string;
  newPassword?: string;
}
