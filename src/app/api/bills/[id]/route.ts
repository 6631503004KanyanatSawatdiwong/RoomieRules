import { NextRequest, NextResponse } from 'next/server';
import { getBillById, getUserById, getBillPaymentsByBill, getHouseMembers } from '@/lib/models';
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

    const billId = parseInt(params.id);
    if (isNaN(billId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid bill ID'
      }, { status: 400 });
    }

    const bill = getBillById(billId);
    if (!bill) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Bill not found'
      }, { status: 404 });
    }

    // Check if user belongs to the same house as the bill
    if (user.house_id !== bill.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    // Get bill payments
    const payments = getBillPaymentsByBill(billId);
    
    // Get house members for additional context
    const members = getHouseMembers(bill.house_id);
    
    // Remove passwords from member data
    const membersWithoutPasswords = members.map(member => {
      const { password, ...memberWithoutPassword } = member;
      return memberWithoutPassword;
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { 
        bill, 
        payments,
        members: membersWithoutPasswords 
      }
    });

  } catch (error) {
    console.error('Get bill error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while getting bill details'
    }, { status: 500 });
  }
}

export async function PUT(
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

    const billId = parseInt(params.id);
    if (isNaN(billId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid bill ID'
      }, { status: 400 });
    }

    const bill = getBillById(billId);
    if (!bill) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Bill not found'
      }, { status: 404 });
    }

    // Only the bill creator can update it
    if (bill.created_by !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Only the bill creator can update this bill'
      }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, amount, due_date, status } = body;

    // Update bill (basic implementation)
    const db = require('@/lib/db').default;
    const stmt = db.prepare(`
      UPDATE bills 
      SET title = ?, description = ?, amount = ?, due_date = ?, status = ?
      WHERE id = ?
    `);
    
    stmt.run(
      title || bill.title,
      description !== undefined ? description : bill.description,
      amount ? parseFloat(amount) : bill.amount,
      due_date !== undefined ? due_date : bill.due_date,
      status || bill.status,
      billId
    );

    // Get updated bill
    const updatedBill = getBillById(billId);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { bill: updatedBill }
    });

  } catch (error) {
    console.error('Update bill error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while updating the bill'
    }, { status: 500 });
  }
}

export async function DELETE(
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

    const billId = parseInt(params.id);
    if (isNaN(billId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid bill ID'
      }, { status: 400 });
    }

    const bill = getBillById(billId);
    if (!bill) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Bill not found'
      }, { status: 404 });
    }

    // Only the bill creator can delete it
    if (bill.created_by !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Only the bill creator can delete this bill'
      }, { status: 403 });
    }

    // Delete bill and related payments
    const db = require('@/lib/db').default;
    
    // Delete payments first (foreign key constraint)
    db.prepare('DELETE FROM bill_payments WHERE bill_id = ?').run(billId);
    
    // Delete bill
    db.prepare('DELETE FROM bills WHERE id = ?').run(billId);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: 'Bill deleted successfully' }
    });

  } catch (error) {
    console.error('Delete bill error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while deleting the bill'
    }, { status: 500 });
  }
}
