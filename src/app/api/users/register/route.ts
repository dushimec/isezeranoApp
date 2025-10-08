
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, role } = await req.json();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // TODO: Implement MongoDB user creation
    console.log(`Creating user with email: ${email}...`);

    // Placeholder data
    const newUser = {
      id: '1',
      email,
      fullName,
      role,
    };

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
