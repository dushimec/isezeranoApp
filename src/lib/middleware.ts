
import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "./auth";
import pool from "./db";

export const withRole = (roles: string[]) => {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => void) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Authorization header is missing" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Token is missing" });
      }

      const decoded = verifyToken(token) as { id: string; role: string };
      if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const client = await pool.connect();
      const result = await client.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      (req as any).user = result.rows[0];

      return handler(req, res);
    };
  };
};
