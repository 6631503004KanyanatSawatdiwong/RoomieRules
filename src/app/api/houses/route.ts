import { NextRequest, NextResponse } from 'next/server';
import { createHouse, updateUserHouse, getHouseByCode, getUserById, getHouseById } from '@/lib/models';
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

    // Get house information from models
    const { getHouseById, getHouseMemberCount } = require('@/lib/models');
    const house = getHouseById(user.house_id);
    
    if (!house) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'House not found'
      }, { status: 404 });
    }

    const memberCount = getHouseMemberCount(user.house_id);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { 
        house: {
          id: house.id,
          name: house.name,
          house_code: house.house_code,
          host_id: house.host_id,
          member_count: memberCount,
          is_host: user.id === house.host_id
        }
      }
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

// PUT - Update house name (Host only)
export async function PUT(request: NextRequest) {
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
        error: 'Only hosts can update house details'
      }, { status: 403 });
    }

    if (!user.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You do not have a house to update'
      }, { status: 400 });
    }

    const house = getHouseById(user.house_id);
    if (!house || house.host_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You can only update your own house'
      }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'House name is required'
      }, { status: 400 });
    }

    // Update house name
    const db = require('@/lib/db').default;
    const updateStmt = db.prepare('UPDATE houses SET name = ? WHERE id = ?');
    updateStmt.run(name.trim(), user.house_id);

    // Get updated house info
    const { getHouseMemberCount } = require('@/lib/models');
    const updatedHouse = getHouseById(user.house_id);
    
    if (!updatedHouse) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'House not found after update'
      }, { status: 404 });
    }
    
    const memberCount = getHouseMemberCount(user.house_id);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { 
        house: {
          id: updatedHouse.id,
          name: updatedHouse.name,
          house_code: updatedHouse.house_code,
          host_id: updatedHouse.host_id,
          member_count: memberCount,
          is_host: true
        }
      }
    });

  } catch (error) {
    console.error('Update house error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while updating the house'
    }, { status: 500 });
  }
}

// DELETE - Delete house (Host only)
export async function DELETE(request: NextRequest) {
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
        error: 'Only hosts can delete houses'
      }, { status: 403 });
    }

    if (!user.house_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You do not have a house to delete'
      }, { status: 400 });
    }

    const house = getHouseById(user.house_id);
    if (!house || house.host_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You can only delete your own house'
      }, { status: 403 });
    }

    const db = require('@/lib/db').default;
    
    // Start transaction
    db.prepare('BEGIN').run();
    
    try {
      // Remove house_id from all users in this house
      const removeHouseStmt = db.prepare('UPDATE users SET house_id = NULL WHERE house_id = ?');
      removeHouseStmt.run(user.house_id);
      
      // Delete all bill payments for bills in this house
      const deleteBillPaymentsStmt = db.prepare(`
        DELETE FROM bill_payments 
        WHERE bill_id IN (SELECT id FROM bills WHERE house_id = ?)
      `);
      deleteBillPaymentsStmt.run(user.house_id);
      
      // Delete all bills for this house
      const deleteBillsStmt = db.prepare('DELETE FROM bills WHERE house_id = ?');
      deleteBillsStmt.run(user.house_id);
      
      // Delete all house rules for this house
      const deleteRulesStmt = db.prepare('DELETE FROM house_rules WHERE house_id = ?');
      deleteRulesStmt.run(user.house_id);
      
      // Delete the house itself
      const deleteHouseStmt = db.prepare('DELETE FROM houses WHERE id = ?');
      deleteHouseStmt.run(user.house_id);
      
      // Commit transaction
      db.prepare('COMMIT').run();
      
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { message: 'House deleted successfully' }
      });
      
    } catch (error) {
      // Rollback transaction on error
      db.prepare('ROLLBACK').run();
      throw error;
    }

  } catch (error) {
    console.error('Delete house error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'An error occurred while deleting the house'
    }, { status: 500 });
  }
}
