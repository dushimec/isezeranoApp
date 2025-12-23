
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth";
import { verifyOtp } from "@/lib/otp";
import clientPromise from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { phoneNumber, otpCode } = req.body;

  if (!phoneNumber || !otpCode) {
    return res.status(400).json({ message: "Phone number and OTP are required" });
  }

  if (!verifyOtp(phoneNumber, otpCode)) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id.toHexString(), phoneNumber: user.phoneNumber || phoneNumber, role: (user.role as string) || 'SINGER' }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
