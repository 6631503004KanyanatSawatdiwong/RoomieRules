'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  DollarSign, 
  Receipt, 
  Clock, 
  Check, 
  Upload, 
  Calendar, 
  Filter,
  Plus,
  ArrowRight 
} from 'lucide-react';

interface PaymentWithBill {
  id: number;
  bill_id: number;
  user_id: number;
  amount_owed: number;
  receipt_url?: string;
  status: 'pending' | 'paid';
  paid_at?: string;
  created_at: string;
  bill_title: string;
  bill_type: string;
  bill_amount: number;
}

interface PaymentTotals {
  pending: number;
  paid: number;
  total: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithBill[]>([]);
  const [totals, setTotals] = useState<PaymentTotals>({ pending: 0, paid: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const statusParam = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      
      const response = await fetch(`/api/payments${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data.payments || []);
        setTotals(data.data.totals || { pending: 0, paid: 0, total: 0 });
      } else {
        setError(data.error || 'Failed to load payments');
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

  const getBillTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      housing: 'bg-purple-100 text-purple-800',
      grocery: 'bg-green-100 text-green-800',
      'eat-out': 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
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

  const filteredPayments = payments.filter(payment => {
    if (statusFilter === 'all') return true;
    return payment.status === statusFilter;
  });

  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <ProtectedRoute>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-lg mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-6 h-6 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">My Payments</h1>
              </div>
              <button
                onClick={() => router.push('/bills/create')}
                className="touch-target p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(totals.pending)}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {pendingPayments.length} bills
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totals.paid)}
                  </div>
                  <div className="text-sm text-gray-600">Paid</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {payments.filter(p => p.status === 'paid').length} bills
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions for Pending Payments */}
            {pendingPayments.length > 0 && (
              <div className="card bg-red-50 border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">
                      {pendingPayments.length} Pending Payment{pendingPayments.length !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div className="text-lg font-bold text-red-900">
                    {formatCurrency(totals.pending)}
                  </div>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  You have outstanding payments that need to be settled.
                </p>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className="text-sm text-red-700 hover:text-red-900 font-medium flex items-center space-x-1"
                >
                  <span>View pending payments</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'paid', label: 'Paid' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key as typeof statusFilter)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    statusFilter === key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Payments List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="card text-center">
                <div className="text-red-600 mb-2">Error loading payments</div>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                  onClick={loadPayments}
                  className="btn btn-secondary"
                >
                  Try Again
                </button>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="card text-center">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {statusFilter === 'all' ? 'No payments found' : `No ${statusFilter} payments`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {statusFilter === 'all' 
                    ? "You haven't been assigned any bill payments yet."
                    : `You have no ${statusFilter} payments at the moment.`
                  }
                </p>
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="btn btn-secondary mr-3"
                  >
                    View All
                  </button>
                )}
                <button
                  onClick={() => router.push('/bills')}
                  className="btn btn-primary"
                >
                  View Bills
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    onClick={() => router.push(`/bills/${payment.bill_id}`)}
                    className="card cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {payment.bill_title}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillTypeColor(payment.bill_type)}`}>
                            {getBillTypeLabel(payment.bill_type)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {payment.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Bill: {formatCurrency(payment.bill_amount)}</span>
                          </div>
                          {payment.paid_at && (
                            <div className="flex items-center space-x-1">
                              <Check className="w-4 h-4" />
                              <span>Paid {formatDate(payment.paid_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(payment.amount_owed)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Your share
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        {payment.status === 'paid' ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Payment recorded</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Payment due</span>
                          </div>
                        )}
                      </div>
                      {payment.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/payments/${payment.bill_id}/pay`);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload Receipt</span>
                        </button>
                      )}
                      {payment.receipt_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(payment.receipt_url, '_blank');
                          }}
                          className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center space-x-1"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>View Receipt</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
