
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'Admin' | 'Secretary' | 'Disciplinarian' | 'Singer';
  isActive: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  profileImageUrl?: string;
}

export interface OTP {
  id: string;
  phoneNumber: string;
  otpCode: string;
  expiresAt: Date;
  verified: boolean;
}
