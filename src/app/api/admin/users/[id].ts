
import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import { withAuth } from "@/lib/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT * FROM users WHERE id = $1", [id]);
      client.release();
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PATCH") {
    const { fullName, phoneNumber, role } = req.body;
    try {
      const client = await pool.connect();
      const result = await client.query(
        "UPDATE users SET full_name = $1, phone_number = $2, role = $3 WHERE id = $4 RETURNING *",
        [fullName, phoneNumber, role, id]
      );
      client.release();
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: `User ${id} updated`, user: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      const client = await pool.connect();
      const result = await client.query("DELETE FROM users WHERE id = $1", [id]);
      client.release();
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: `User ${id} deactivated` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

export default withAuth(handler);
