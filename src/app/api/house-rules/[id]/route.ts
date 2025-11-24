import { NextRequest, NextResponse } from 'next/server';
import { getHouseRuleById, updateHouseRule, deleteHouseRule, getUserById } from '@/lib/models';
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

    const ruleId = parseInt(params.id);
    if (isNaN(ruleId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid rule ID'
      }, { status: 400 });
    }

    const rule = getHouseRuleById(ruleId);
    if (!rule) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'House rule not found'
      }, { status: 404 });
    }

    const user = getUserById(decoded.userId);
    if (!user || user.house_id !== rule.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { rule }
    });

  } catch (error) {
    console.error('Get house rule error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while getting the house rule'
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

    const ruleId = parseInt(params.id);
    if (isNaN(ruleId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid rule ID'
      }, { status: 400 });
    }

    const rule = getHouseRuleById(ruleId);
    if (!rule) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'House rule not found'
      }, { status: 404 });
    }

    const user = getUserById(decoded.userId);
    if (!user || user.role !== 'host' || user.house_id !== rule.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Only the house host can update rules'
      }, { status: 403 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (title !== undefined && title.trim() === '') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Rule title cannot be empty'
      }, { status: 400 });
    }

    const updatedRule = updateHouseRule(ruleId, {
      title: title?.trim(),
      description: description?.trim()
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { rule: updatedRule }
    });

  } catch (error) {
    console.error('Update house rule error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while updating the house rule'
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

    const ruleId = parseInt(params.id);
    if (isNaN(ruleId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid rule ID'
      }, { status: 400 });
    }

    const rule = getHouseRuleById(ruleId);
    if (!rule) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'House rule not found'
      }, { status: 404 });
    }

    const user = getUserById(decoded.userId);
    if (!user || user.role !== 'host' || user.house_id !== rule.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Only the house host can delete rules'
      }, { status: 403 });
    }

    deleteHouseRule(ruleId);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: 'House rule deleted successfully' }
    });

  } catch (error) {
    console.error('Delete house rule error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while deleting the house rule'
    }, { status: 500 });
  }
}
