import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/models';
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth';
import { ApiResponse, RegisterForm } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterForm = await request.json();
    const { name, email, password, role, phone } = body;

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name, email, password, and role are required'
      }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Please enter a valid email address'
      }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    if (!['host', 'roommate'].includes(role)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Role must be either "host" or "roommate"'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'An account with this email already exists'
      }, { status: 400 });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = createUser({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { user: userWithoutPassword }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred during registration'
    }, { status: 500 });
  }
}
