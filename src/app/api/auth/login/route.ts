import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/models';
import { verifyPassword, generateToken, validateEmail } from '@/lib/auth';
import { ApiResponse, LoginForm } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginForm = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Please enter a valid email address'
      }, { status: 400 });
    }

    // Find user by email
    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Return user data and token (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { 
        user: userWithoutPassword, 
        token 
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred during login'
    }, { status: 500 });
  }
}
