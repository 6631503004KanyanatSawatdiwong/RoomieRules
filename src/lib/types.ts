export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'host' | 'roommate';
  house_id?: number;
  bank_account?: string;
  created_at: string;
}

export interface House {
  id: number;
  name: string;
  house_code: string;
  host_id: number;
  created_at: string;
}

export interface Bill {
  id: number;
  title: string;
  description?: string;
  amount: number;
  type: 'housing' | 'grocery' | 'eat-out' | 'other';
  house_id: number;
  created_by: number;
  split_amount?: number;
  due_date?: string;
  status: 'active' | 'closed';
  created_at: string;
}

export interface BillPayment {
  id: number;
  bill_id: number;
  user_id: number;
  amount_owed: number;
  receipt_url?: string;
  status: 'pending' | 'paid';
  paid_at?: string;
  created_at: string;
}

export interface HouseRule {
  id: number;
  house_id: number;
  title: string;
  description?: string;
  created_by: number;
  created_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth types
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'host' | 'roommate';
  house_id?: number;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'host' | 'roommate';
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: 'host' | 'roommate';
  phone?: string;
}

export interface CreateHouseForm {
  name: string;
  bank_account: string;
}

export interface JoinHouseForm {
  house_code: string;
}

export interface CreateBillForm {
  title: string;
  description?: string;
  amount: number;
  type: 'housing' | 'grocery' | 'eat-out' | 'other';
  due_date?: string;
}
