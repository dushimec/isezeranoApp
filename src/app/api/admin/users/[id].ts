import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          profileImage: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PATCH") {
    const { firstName, lastName, username, email, role, isActive } = req.body;
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          username,
          email,
          role,
          isActive,
        },
      });

      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json({ message: `User ${id} updated`, user: userWithoutPassword });

    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: "User not found" });
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ message: "Email or username already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.user.delete({
        where: { id },
      });
      res.status(200).json({ message: `User ${id} deactivated` });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "User not found" });
        }
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

export default withAuth(handler);
