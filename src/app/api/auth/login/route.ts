import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIdEmail, password, role } = body;

    // Validate required fields
    if (!userIdEmail || !password || !role) {
      return NextResponse.json(
        { error: 'User ID/Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['student', 'admin', 'staff', 'security'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Find user by email or ID (assuming ID format for students like CS21B1001)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userIdEmail },
          { email: userIdEmail.includes('@') ? userIdEmail : `${userIdEmail}@iith.ac.in` }
        ],
        role: role
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials or user not found' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token and set cookie
    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', generateTokenCookie(userPayload));

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
