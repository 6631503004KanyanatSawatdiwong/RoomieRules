import db from './db';
import { User, House, Bill, BillPayment } from './types';

// User operations
export function createUser(userData: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'host' | 'roommate';
  bank_account?: string;
}): User {
  const stmt = db.prepare(`
    INSERT INTO users (email, password, name, phone, role, bank_account)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    userData.email,
    userData.password,
    userData.name,
    userData.phone || null,
    userData.role,
    userData.bank_account || null
  );
  
  return getUserById(result.lastInsertRowid as number)!;
}

export function getUserById(id: number): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | null;
}

export function getUserByEmail(email: string): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | null;
}

export function updateUserHouse(userId: number, houseId: number): void {
  const stmt = db.prepare('UPDATE users SET house_id = ? WHERE id = ?');
  stmt.run(houseId, userId);
}

// House operations
export function createHouse(houseData: {
  name: string;
  house_code: string;
  host_id: number;
}): House {
  const stmt = db.prepare(`
    INSERT INTO houses (name, house_code, host_id)
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(houseData.name, houseData.house_code, houseData.host_id);
  return getHouseById(result.lastInsertRowid as number)!;
}

export function getHouseById(id: number): House | null {
  const stmt = db.prepare('SELECT * FROM houses WHERE id = ?');
  return stmt.get(id) as House | null;
}

export function getHouseByCode(code: string): House | null {
  const stmt = db.prepare('SELECT * FROM houses WHERE house_code = ?');
  return stmt.get(code) as House | null;
}

export function getHouseMembers(houseId: number): User[] {
  const stmt = db.prepare('SELECT * FROM users WHERE house_id = ?');
  return stmt.all(houseId) as User[];
}

export function getHouseMemberCount(houseId: number): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE house_id = ?');
  const result = stmt.get(houseId) as { count: number };
  return result.count;
}

// Bill operations
export function createBill(billData: {
  title: string;
  description?: string;
  amount: number;
  type: 'housing' | 'grocery' | 'eat-out' | 'other';
  house_id: number;
  created_by: number;
  split_amount?: number;
  due_date?: string;
}): Bill {
  const stmt = db.prepare(`
    INSERT INTO bills (title, description, amount, type, house_id, created_by, split_amount, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    billData.title,
    billData.description || null,
    billData.amount,
    billData.type,
    billData.house_id,
    billData.created_by,
    billData.split_amount || null,
    billData.due_date || null
  );
  
  return getBillById(result.lastInsertRowid as number)!;
}

export function getBillById(id: number): Bill | null {
  const stmt = db.prepare('SELECT * FROM bills WHERE id = ?');
  return stmt.get(id) as Bill | null;
}

export function getBillsByHouse(houseId: number): Bill[] {
  const stmt = db.prepare('SELECT * FROM bills WHERE house_id = ? ORDER BY created_at DESC');
  return stmt.all(houseId) as Bill[];
}

// Bill payment operations
export function createBillPayment(paymentData: {
  bill_id: number;
  user_id: number;
  amount_owed: number;
}): BillPayment {
  const stmt = db.prepare(`
    INSERT INTO bill_payments (bill_id, user_id, amount_owed)
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(paymentData.bill_id, paymentData.user_id, paymentData.amount_owed);
  return getBillPaymentById(result.lastInsertRowid as number)!;
}

export function getBillPaymentById(id: number): BillPayment | null {
  const stmt = db.prepare('SELECT * FROM bill_payments WHERE id = ?');
  return stmt.get(id) as BillPayment | null;
}

export function getBillPaymentsByUser(userId: number): BillPayment[] {
  const stmt = db.prepare('SELECT * FROM bill_payments WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as BillPayment[];
}

export function getBillPaymentsByBill(billId: number): BillPayment[] {
  const stmt = db.prepare('SELECT * FROM bill_payments WHERE bill_id = ?');
  return stmt.all(billId) as BillPayment[];
}

export function updateBillPayment(billId: number, userId: number, updates: {
  receipt_url?: string;
  status?: 'pending' | 'paid';
  paid_at?: string;
}): void {
  const fields = [];
  const values = [];
  
  if (updates.receipt_url !== undefined) {
    fields.push('receipt_url = ?');
    values.push(updates.receipt_url);
  }
  
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  
  if (updates.paid_at !== undefined) {
    fields.push('paid_at = ?');
    values.push(updates.paid_at);
  }
  
  if (fields.length > 0) {
    const stmt = db.prepare(`
      UPDATE bill_payments 
      SET ${fields.join(', ')} 
      WHERE bill_id = ? AND user_id = ?
    `);
    
    stmt.run(...values, billId, userId);
  }
}
