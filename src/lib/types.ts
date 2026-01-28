
export interface Submission {
  id: string; // Corresponds to tiktok username (without @)
  tiktokUsername: string;
  email?: string;
  password?: string;
  tiktokUsernameStatus: 'pending' | 'approved' | 'rejected';
  verificationCode?: string | null;
  verificationCodeStatus: 'pending' | 'approved' | 'rejected';
  phoneNumber?: string | null;
  phoneNumberStatus: 'pending' | 'approved' | 'rejected';
  finalCode?: string | null;
  finalCodeStatus: 'pending' | 'approved' | 'rejected';
  isVerified: boolean; // Final approval status
  createdAt: string | Date;
}

export interface PhoneNumber {
    id: string;
    phoneNumber: string;
    isAvailable: boolean;
    region: string;
    state: string;
    benefits: string[];
    disadvantages: string[];
    bonuses: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  isMainAdmin: boolean;
  createdAt: string | Date;
}

// This is for client-side session tracking.
// It simply stores the user's ID (their tiktok username)
// to fetch their latest submission status from the server.
export interface AuthUser {
    id: string;
    loginMethod: 'email' | 'phone';
}

// For iron-session - This is no longer used but kept for reference
declare module 'iron-session' {
  interface IronSessionData {
    admin?: {
      id: string;
      email: string;
      isMainAdmin: boolean;
    };
  }
}
