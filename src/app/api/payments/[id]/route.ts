import { NextRequest, NextResponse } from 'next/server';
import { getBillPaymentById, updateBillPayment } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { ApiResponse } from '@/lib/types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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

    const paymentId = parseInt(params.id);
    if (isNaN(paymentId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid payment ID'
      }, { status: 400 });
    }

    const payment = getBillPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Payment not found'
      }, { status: 404 });
    }

    // Only the user who owes the payment can mark it as paid
    if (payment.user_id !== decoded.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You can only mark your own payments as paid'
      }, { status: 403 });
    }

    // Handle form data (multipart/form-data for file upload)
    const formData = await request.formData();
    const receiptFile = formData.get('receipt') as File;
    
    if (!receiptFile) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Receipt file is required'
      }, { status: 400 });
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(receiptFile.type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Only image files (JPEG, PNG, WebP) are allowed'
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (receiptFile.size > maxSize) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'File size must be less than 5MB'
      }, { status: 400 });
    }

    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts');
      await mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const fileExtension = receiptFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = join(uploadsDir, fileName);

      // Save file
      const bytes = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Update payment record
      const receiptUrl = `/uploads/receipts/${fileName}`;
      updateBillPayment(payment.bill_id, payment.user_id, {
        status: 'paid',
        receipt_url: receiptUrl,
        paid_at: new Date().toISOString()
      });

      // Get updated payment
      const updatedPayment = getBillPaymentById(paymentId);

      return NextResponse.json<ApiResponse>({
        success: true,
        data: { payment: updatedPayment }
      });

    } catch (fileError) {
      console.error('File upload error:', fileError);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to upload receipt'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while updating payment'
    }, { status: 500 });
  }
}

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

    const paymentId = parseInt(params.id);
    if (isNaN(paymentId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid payment ID'
      }, { status: 400 });
    }

    const payment = getBillPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Payment not found'
      }, { status: 404 });
    }

    // Users can only view payments in their house
    // This check would need house validation - for now allow all authenticated users
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { payment }
    });

  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while getting payment details'
    }, { status: 500 });
  }
}
