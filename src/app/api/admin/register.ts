
import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { withAuth } from "@/lib/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fullName, phoneNumber, role } = req.body;

  if (!fullName || !phoneNumber || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO users (full_name, phone_number, role) VALUES ($1, $2, $3) RETURNING *",
      [fullName, phoneNumber, role]
    );
    client.release();
    res.status(201).json({ message: "User created successfully", user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default withAuth(handler);
