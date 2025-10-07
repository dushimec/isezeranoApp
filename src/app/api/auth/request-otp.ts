
import { NextApiRequest, NextApiResponse } from "next";
import { users } from "@/lib/mock-data";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const user = users.find((user) => user.phoneNumber === phoneNumber);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // TODO: Generate and send OTP

  res.status(200).json({ message: "OTP sent successfully" });
}
