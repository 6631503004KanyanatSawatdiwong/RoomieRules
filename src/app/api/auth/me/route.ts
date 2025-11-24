import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authorization token required'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid or expired token'
      }, { status: 401 });
    }

    // Get current user data
    const user = getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { user: userWithoutPassword }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while getting user data'
    }, { status: 500 });
  }
}
