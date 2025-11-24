import { NextRequest, NextResponse } from 'next/server';
import { getHouseByCode, updateUserHouse, getUserById } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
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

    const user = getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    if (user.role !== 'roommate') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Only roommates can join houses'
      }, { status: 403 });
    }

    if (user.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You have already joined a house'
      }, { status: 400 });
    }

    const body = await request.json();
    const { house_code } = body;

    if (!house_code) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'House code is required'
      }, { status: 400 });
    }

    // Find house by code
    const house = getHouseByCode(house_code.toUpperCase());
    if (!house) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid house code'
      }, { status: 404 });
    }

    // Update user's house_id
    updateUserHouse(user.id, house.id);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { house }
    });

  } catch (error) {
    console.error('Join house error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while joining the house'
    }, { status: 500 });
  }
}
