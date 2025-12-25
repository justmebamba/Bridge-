export interface Submission {
  id: string;
  tiktokUsername: string;
  phoneNumber?: string;
  verificationCode?: string;
  finalCode?: string;
  isVerified: boolean;
  createdAt: string; 
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
