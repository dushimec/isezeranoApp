import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default withAuth(handler);
