'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Receipt, ArrowLeft, DollarSign, Calendar, User, Check, Clock, CreditCard } from 'lucide-react';

interface Bill {
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

interface BillPayment {
  id: number;
  bill_id: number;
  user_id: number;
  amount_owed: number;
  receipt_url?: string;
  status: 'pending' | 'paid';
  paid_at?: string;
  created_at: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  role: 'host' | 'roommate';
  bank_account?: string;
}

export default function BillDetailPage({ params }: { params: { id: string } }) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const router = useRouter();
  const billId = params.id;

  useEffect(() => {
    if (billId) {
      loadBillDetails();
    }
  }, [billId]);

  const loadBillDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/bills/${billId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setBill(data.data.bill);
        setPayments(data.data.payments || []);
        setMembers(data.data.members || []);
      } else {
        setError(data.error || 'Failed to load bill details');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBillTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      housing: 'Housing',
      grocery: 'Grocery',
      'eat-out': 'Eat Out',
      other: 'Other'
    };
    return types[type] || type;
  };

  const getBillTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      housing: 'bg-purple-100 text-purple-800',
      grocery: 'bg-green-100 text-green-800',
      'eat-out': 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  const getMemberById = (id: number) => {
    return members.find(member => member.id === id);
  };

  const getPaymentForUser = (userId: number) => {
    return payments.find(payment => payment.user_id === userId);
  };

  const getHostBankAccount = () => {
    const host = members.find(member => member.role === 'host');
    return host?.bank_account;
  };

  const userPayment = user ? getPaymentForUser(user.id) : null;
  const isCreator = user?.id === bill?.created_by;
  const hostBankAccount = getHostBankAccount();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bill details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !bill) {
    return (
      <ProtectedRoute>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="card text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Bill not found'}
            </h2>
            <p className="text-gray-600 mb-4">
              The bill you're looking for doesn't exist or you don't have access to it.
            </p>
            <button
              onClick={() => router.push('/bills')}
              className="btn btn-primary"
            >
              Back to Bills
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-lg mx-auto px-6 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="touch-target -ml-2 p-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Receipt className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Bill Details</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Bill Info Card */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {bill.title}
                  </h2>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillTypeColor(bill.type)}`}>
                      {getBillTypeLabel(bill.type)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bill.status === 'active' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(bill.amount)}
                  </div>
                  {bill.split_amount && (
                    <div className="text-sm text-gray-600">
                      {formatCurrency(bill.split_amount)} per person
                    </div>
                  )}
                </div>
              </div>

              {bill.description && (
                <p className="text-gray-600 mb-4 p-4 bg-gray-50 rounded-lg">
                  {bill.description}
                </p>
              )}

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created by</span>
                  <span className="font-medium">
                    {isCreator ? 'You' : getMemberById(bill.created_by)?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created on</span>
                  <span className="font-medium">{formatDate(bill.created_at)}</span>
                </div>
                {bill.due_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Due date</span>
                    <span className="font-medium">{formatDate(bill.due_date)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Housing Bill Bank Account */}
            {bill.type === 'housing' && hostBankAccount && (
              <div className="card bg-purple-50 border-purple-200">
                <div className="flex items-center space-x-3 mb-3">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Payment Information</h3>
                </div>
                <p className="text-sm text-purple-700 mb-2">
                  Make payments to the host's bank account:
                </p>
                <div className="bg-white rounded-lg p-3 font-mono text-lg text-purple-900 border border-purple-200">
                  {hostBankAccount}
                </div>
              </div>
            )}

            {/* User's Payment Status */}
            {userPayment && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Your Payment</span>
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      Amount Owed: {formatCurrency(userPayment.amount_owed)}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center space-x-1">
                      {userPayment.status === 'paid' ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Paid on {userPayment.paid_at && formatDate(userPayment.paid_at)}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span>Payment pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userPayment.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {userPayment.status === 'paid' ? 'Paid' : 'Pending'}
                  </div>
                </div>
                {userPayment.status === 'pending' && (
                  <div className="mt-4">
                    <button
                      onClick={() => router.push(`/payments/${bill.id}/pay`)}
                      className="btn btn-primary w-full"
                    >
                      Upload Payment Receipt
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Payment Status for All Members */}
            {payments.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Status</h3>
                <div className="space-y-3">
                  {payments.map((payment) => {
                    const member = getMemberById(payment.user_id);
                    const isCurrentUser = payment.user_id === user?.id;
                    
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {payment.status === 'paid' ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {isCurrentUser ? 'You' : member?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatCurrency(payment.amount_owed)}
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {payment.status === 'paid' ? 'Paid' : 'Pending'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/bills')}
                className="btn btn-secondary w-full"
              >
                Back to Bills
              </button>
              
              {isCreator && bill.status === 'active' && (
                <button
                  onClick={() => alert('Bill editing coming soon!')}
                  className="btn btn-primary w-full"
                  disabled
                >
                  Edit Bill (Coming Soon)
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
