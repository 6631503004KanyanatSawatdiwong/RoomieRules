import { NextRequest, NextResponse } from 'next/server';
import { getUserPayments } from '@/lib/models';
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

    // Get URL search params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'paid', or null for all
    const limit = searchParams.get('limit');

    const payments = getUserPayments(decoded.userId, {
      status: status as 'pending' | 'paid' | undefined,
      limit: limit ? parseInt(limit) : undefined
    });

    // Calculate totals
    const totals = {
      pending: payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount_owed, 0),
      paid: payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount_owed, 0),
      total: payments.reduce((sum, p) => sum + p.amount_owed, 0)
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { 
        payments,
        totals
      }
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while getting payments'
    }, { status: 500 });
  }
}
