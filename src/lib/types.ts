
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
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
