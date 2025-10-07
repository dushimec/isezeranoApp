
export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string; // Optional for users that might still have it
  role: 'Singer' | 'Secretary' | 'Disciplinarian' | 'Admin' | 'Section Leader';
  isActive: boolean;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  };
  profileImageUrl?: string;
}

export interface OTP {
  id: string;
  phoneNumber: string;
  otpCode: string;
  expiresAt: Date;
  verified: boolean;
}
