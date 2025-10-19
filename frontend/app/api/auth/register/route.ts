import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use real database
const users: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    if (users.some((u) => u.email === email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Create user (in production, hash password)
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password, // Never store plain passwords in production!
      createdAt: new Date(),
    }

    users.push(user)

    // Generate token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
