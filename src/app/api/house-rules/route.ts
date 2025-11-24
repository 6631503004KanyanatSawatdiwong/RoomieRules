import { NextRequest, NextResponse } from 'next/server';
import { getHouseRules, createHouseRule, getUserById } from '@/lib/models';
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

    const user = getUserById(decoded.userId);
    if (!user || !user.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User must be in a house to view rules'
      }, { status: 403 });
    }

    const rules = getHouseRules(user.house_id);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { rules }
    });

  } catch (error) {
    console.error('Get house rules error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while getting house rules'
    }, { status: 500 });
  }
}

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

    // Only hosts can create rules
    if (user.role !== 'host' || !user.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Only house hosts can create rules'
      }, { status: 403 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Rule title is required'
      }, { status: 400 });
    }

    const rule = createHouseRule(user.house_id, user.id, title.trim(), description?.trim() || undefined);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { rule }
    }, { status: 201 });

  } catch (error) {
    console.error('Create house rule error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while creating the house rule'
    }, { status: 500 });
  }
}
