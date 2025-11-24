import { NextRequest, NextResponse } from 'next/server';
import { getHouseMembers, getUserById } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const houseId = parseInt(params.id);
    if (isNaN(houseId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid house ID'
      }, { status: 400 });
    }

    // Check if user belongs to this house
    if (user.house_id !== houseId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    const members = getHouseMembers(houseId);
    
    // Remove passwords from member data
    const membersWithoutPasswords = members.map(member => {
      const { password, ...memberWithoutPassword } = member;
      return memberWithoutPassword;
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { members: membersWithoutPasswords }
    });

  } catch (error) {
    console.error('Get house members error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while getting house members'
    }, { status: 500 });
  }
}
