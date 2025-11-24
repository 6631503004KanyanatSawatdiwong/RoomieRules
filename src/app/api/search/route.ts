import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';
import db from '@/lib/db';

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
        error: 'User must be in a house to search'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const type = searchParams.get('type'); // 'bills', 'payments', 'members', or undefined for all

    if (!query) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { 
          bills: [],
          payments: [],
          members: [],
          total: 0
        }
      });
    }

    const results = {
      bills: [] as any[],
      payments: [] as any[],
      members: [] as any[],
      total: 0
    };

    // Search bills if type is 'bills' or undefined
    if (!type || type === 'bills') {
      const billResults = db.prepare(`
        SELECT 
          b.id,
          b.title,
          b.description,
          b.amount,
          b.type,
          b.status,
          b.created_at,
          u.name as created_by_name,
          'bill' as result_type
        FROM bills b
        LEFT JOIN users u ON b.created_by = u.id
        WHERE b.house_id = ? 
          AND (
            LOWER(b.title) LIKE LOWER(?) 
            OR LOWER(b.description) LIKE LOWER(?)
            OR LOWER(b.type) LIKE LOWER(?)
          )
        ORDER BY b.created_at DESC
        LIMIT 20
      `).all(user.house_id, `%${query}%`, `%${query}%`, `%${query}%`);
      
      results.bills = billResults;
    }

    // Search payments if type is 'payments' or undefined
    if (!type || type === 'payments') {
      const paymentResults = db.prepare(`
        SELECT 
          bp.id,
          bp.amount_owed,
          bp.status,
          bp.paid_at,
          bp.created_at,
          b.title as bill_title,
          b.amount as bill_amount,
          b.type as bill_type,
          u.name as user_name,
          'payment' as result_type
        FROM bill_payments bp
        JOIN bills b ON bp.bill_id = b.id
        LEFT JOIN users u ON bp.user_id = u.id
        WHERE b.house_id = ? 
          AND bp.user_id = ?
          AND (
            LOWER(b.title) LIKE LOWER(?)
            OR LOWER(b.type) LIKE LOWER(?)
            OR LOWER(bp.status) LIKE LOWER(?)
          )
        ORDER BY bp.created_at DESC
        LIMIT 20
      `).all(user.house_id, user.id, `%${query}%`, `%${query}%`, `%${query}%`);
      
      results.payments = paymentResults;
    }

    // Search house members if type is 'members' or undefined
    if (!type || type === 'members') {
      const memberResults = db.prepare(`
        SELECT 
          u.id,
          u.name,
          u.email,
          uh.role,
          u.created_at,
          'member' as result_type
        FROM users u
        JOIN user_houses uh ON u.id = uh.user_id
        WHERE uh.house_id = ? 
          AND (
            LOWER(u.name) LIKE LOWER(?)
            OR LOWER(u.email) LIKE LOWER(?)
            OR LOWER(uh.role) LIKE LOWER(?)
          )
        ORDER BY u.name ASC
        LIMIT 10
      `).all(user.house_id, `%${query}%`, `%${query}%`, `%${query}%`);
      
      results.members = memberResults;
    }

    results.total = results.bills.length + results.payments.length + results.members.length;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while searching'
    }, { status: 500 });
  }
}
