
export interface Submission {
  id: string; // Corresponds to tiktok username (without @)
  tiktokUsername: string;
  tiktokUsernameStatus: 'pending' | 'approved' | 'rejected';
  verificationCode?: string | null;
  verificationCodeStatus: 'pending' | 'approved' | 'rejected';
  phoneNumber?: string | null;
  phoneNumberStatus: 'pending' | 'approved' | 'rejected';
  finalCode?: string | null;
  finalCodeStatus: 'pending' | 'approved' | 'rejected';
  isVerified: boolean; // Final approval status
  createdAt: string | Date;
  rejectionReason?: string | null; // Reason for the last rejection
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
  passwordHash: string; // Store hashed password instead of plain text
  isVerified: boolean;
  isMainAdmin: boolean;
  createdAt: string | Date;
}

// This is for client-side session tracking.
// It simply stores the user's ID (their tiktok username)
// to fetch their latest submission status from the server.
export interface AuthUser {
    id: string;
}
