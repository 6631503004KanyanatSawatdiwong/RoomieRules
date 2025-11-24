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
        error: 'User must be in a house to view analytics'
      }, { status: 403 });
    }

    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Bills summary
    const billsStats = db.prepare(`
      SELECT 
        COUNT(*) as total_bills,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_bills,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END) as active_amount
      FROM bills 
      WHERE house_id = ?
    `).get(user.house_id) as any;

    // Current month bills
    const currentMonthBills = db.prepare(`
      SELECT 
        COUNT(*) as count,
        SUM(amount) as total,
        type
      FROM bills 
      WHERE house_id = ? 
        AND strftime('%m', created_at) = ? 
        AND strftime('%Y', created_at) = ?
      GROUP BY type
    `).all(user.house_id, currentMonth.toString().padStart(2, '0'), currentYear.toString());

    // Last month bills for comparison
    const lastMonthBills = db.prepare(`
      SELECT 
        COUNT(*) as count,
        SUM(amount) as total
      FROM bills 
      WHERE house_id = ? 
        AND strftime('%m', created_at) = ? 
        AND strftime('%Y', created_at) = ?
    `).get(user.house_id, lastMonth.toString().padStart(2, '0'), lastMonthYear.toString()) as any;

    // Personal payment stats
    const userPaymentStats = db.prepare(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount_owed) as total_owed,
        SUM(CASE WHEN status = 'paid' THEN amount_owed ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'pending' THEN amount_owed ELSE 0 END) as total_pending
      FROM bill_payments bp
      JOIN bills b ON bp.bill_id = b.id
      WHERE bp.user_id = ? AND b.house_id = ?
    `).get(user.id, user.house_id) as any;

    // Recent activity (last 5 bills)
    const recentBills = db.prepare(`
      SELECT 
        b.id,
        b.title,
        b.amount,
        b.type,
        b.created_at,
        u.name as created_by_name,
        bp.status as user_payment_status
      FROM bills b
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN bill_payments bp ON b.id = bp.bill_id AND bp.user_id = ?
      WHERE b.house_id = ?
      ORDER BY b.created_at DESC
      LIMIT 5
    `).all(user.id, user.house_id);

    // Monthly expense trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const monthData = db.prepare(`
        SELECT 
          SUM(amount) as total,
          COUNT(*) as count
        FROM bills 
        WHERE house_id = ? 
          AND strftime('%m', created_at) = ? 
          AND strftime('%Y', created_at) = ?
      `).get(user.house_id, month.toString().padStart(2, '0'), year.toString()) as any;
      
      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthData?.total || 0,
        count: monthData?.count || 0
      });
    }

    // House member count
    const memberCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM users 
      WHERE house_id = ?
    `).get(user.house_id) as any;

    const analytics = {
      bills: {
        total: billsStats?.total_bills || 0,
        active: billsStats?.active_bills || 0,
        totalAmount: billsStats?.total_amount || 0,
        activeAmount: billsStats?.active_amount || 0
      },
      currentMonth: {
        bills: currentMonthBills,
        total: currentMonthBills.reduce((sum: number, bill: any) => sum + (bill.total || 0), 0),
        count: currentMonthBills.reduce((sum: number, bill: any) => sum + (bill.count || 0), 0)
      },
      lastMonth: {
        total: lastMonthBills?.total || 0,
        count: lastMonthBills?.count || 0
      },
      userPayments: {
        total: userPaymentStats?.total_payments || 0,
        totalOwed: userPaymentStats?.total_owed || 0,
        totalPaid: userPaymentStats?.total_paid || 0,
        totalPending: userPaymentStats?.total_pending || 0
      },
      recentActivity: recentBills,
      monthlyTrend,
      houseInfo: {
        memberCount: memberCount?.count || 0
      }
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while getting analytics'
    }, { status: 500 });
  }
}
