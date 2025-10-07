
export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: "SINGER" | "SECRETARY" | "DISCIPLINARIAN" | "ADMIN";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OTP {
  id: string;
  phoneNumber: string;
  otpCode: string;
  expiresAt: Date;
  verified: boolean;
}
