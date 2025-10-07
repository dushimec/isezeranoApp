
import { NextApiRequest, NextApiResponse } from "next";
import { generateOtp, storeOtp } from "@/lib/otp";
import { sendOtp as sendOtpViaTwilio } from "@/lib/twilio";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const otp = generateOtp();
  storeOtp(phoneNumber, otp);

  const result = await sendOtpViaTwilio(phoneNumber, otp);

  if (result.success) {
    res.status(200).json({ message: "OTP sent successfully" });
  } else {
    res.status(500).json({ message: result.error });
  }
}
