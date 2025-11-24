import { NextRequest, NextResponse } from 'next/server';
import { createBill, getBillsByHouse, getUserById } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';

// GET - Get all bills for user's house
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
        success: false,
        error: 'User is not part of any house'
      }, { status: 400 });
    }

    const bills = getBillsByHouse(user.house_id);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { bills }
    });

  } catch (error) {
    console.error('Get bills error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while getting bills'
    }, { status: 500 });
  }
}

// POST - Create a new bill
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

    if (!user.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User is not part of any house'
      }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, amount, type, due_date } = body;

    // Validation
    if (!title || !amount || !type) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Title, amount, and type are required'
      }, { status: 400 });
    }

    if (!['housing', 'grocery', 'eat-out', 'other'].includes(type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid bill type'
      }, { status: 400 });
    }

    // Only hosts can create housing bills
    if (type === 'housing' && user.role !== 'host') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Only hosts can create housing bills'
      }, { status: 403 });
    }

    if (amount <= 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Amount must be greater than 0'
      }, { status: 400 });
    }

    let billData: any = {
      title,
      description,
      amount: parseFloat(amount),
      type,
      house_id: user.house_id,
      created_by: user.id,
      due_date
    };

    // Handle housing bill auto-split logic
    if (type === 'housing') {
      const { getHouseMemberCount, createBillPayment, getHouseMembers } = require('@/lib/models');
      
      const memberCount = getHouseMemberCount(user.house_id);
      if (memberCount === 0) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'No members found in house'
        }, { status: 400 });
      }

      const splitAmount = parseFloat(amount) / memberCount;
      billData.split_amount = splitAmount;
    }

    // Create bill
    const bill = createBill(billData);

    // Create payment records for housing bills
    if (type === 'housing') {
      const { createBillPayment, getHouseMembers } = require('@/lib/models');
      const members = getHouseMembers(user.house_id);
      
      for (const member of members) {
        createBillPayment({
          bill_id: bill.id,
          user_id: member.id,
          amount_owed: bill.split_amount!
        });
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { bill }
    }, { status: 201 });

  } catch (error) {
    console.error('Create bill error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while creating the bill'
    }, { status: 500 });
  }
}
