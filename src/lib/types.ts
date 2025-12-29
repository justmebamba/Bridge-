
export interface Submission {
  id: string; // Corresponds to user UID
  tiktokUsername: string;
  tiktokUsernameStatus: 'pending' | 'approved' | 'rejected';
  verificationCode?: string;
  verificationCodeStatus: 'pending' | 'approved' | 'rejected';
  phoneNumber?: string;
  phoneNumberStatus: 'pending' | 'approved' | 'rejected';
  finalCode?: string;
  finalCodeStatus: 'pending' | 'approved' | 'rejected';
  isVerified: boolean; // Final approval status
  createdAt: string;
  rejectionReason?: string; // Reason for the last rejection
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
  isVerified: boolean;
  isMainAdmin: boolean;
  createdAt: string;
}
