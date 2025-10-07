
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth";
import { verifyOtp } from "@/lib/otp";
import pool from "@/lib/db";

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
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE phone_number = $1", [phoneNumber]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, phoneNumber: user.phone_number, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
