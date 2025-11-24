import { NextRequest, NextResponse } from 'next/server';
import { createHouse, updateUserHouse, getHouseByCode, getUserById } from '@/lib/models';
import { verifyToken, generateHouseCode } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';

// GET - Get user's house information
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
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    if (!user.house_id) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { house: null }
      });
    }

    // Get house information - this will be implemented when we need it
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { house: { id: user.house_id } }
    });

  } catch (error) {
    console.error('Get house error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while getting house data'
    }, { status: 500 });
  }
}

// POST - Create a new house (Host only)
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

    if (user.role !== 'host') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Only hosts can create houses'
      }, { status: 403 });
    }

    if (user.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You have already created a house'
      }, { status: 400 });
    }

    const body = await request.json();
    const { name, bank_account } = body;

    if (!name || !bank_account) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'House name and bank account are required'
      }, { status: 400 });
    }

    // Generate unique house code
    let houseCode: string;
    let attempts = 0;
    do {
      houseCode = generateHouseCode();
      attempts++;
      if (attempts > 10) {
        throw new Error('Could not generate unique house code');
      }
    } while (getHouseByCode(houseCode));

    // Create house
    const house = createHouse({
      name,
      house_code: houseCode,
      host_id: user.id
    });

    // Update user's house_id and bank_account
    updateUserHouse(user.id, house.id);
    
    // Update user's bank account
    const db = require('@/lib/db').default;
    const stmt = db.prepare('UPDATE users SET bank_account = ? WHERE id = ?');
    stmt.run(bank_account, user.id);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { house }
    }, { status: 201 });

  } catch (error) {
    console.error('Create house error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while creating the house'
    }, { status: 500 });
  }
}
