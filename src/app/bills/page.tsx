'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Receipt, Plus, Filter, DollarSign, Calendar, User } from 'lucide-react';

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

export default function BillsListPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user doesn't have a house
    if (user && !user.house_id) {
      router.push('/dashboard');
      return;
    }

    loadBills();
  }, [user, router]);

  const loadBills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/bills', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setBills(data.data.bills || []);
      } else {
        setError(data.error || 'Failed to load bills');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    if (filterType !== 'all' && bill.type !== filterType) {
      return false;
    }
    if (filterStatus !== 'all' && bill.status !== filterStatus) {
      return false;
    }
    return true;
  });

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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bills...</p>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Receipt className="w-6 h-6 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">Bills</h1>
              </div>
              <button
                onClick={() => router.push('/bills/create')}
                className="touch-target flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Filters */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Filters</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="form-input py-2 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="housing">Housing</option>
                    <option value="grocery">Grocery</option>
                    <option value="eat-out">Eat Out</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-input py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bills List */}
            <div className="space-y-4">
              {filteredBills.length === 0 ? (
                <div className="card text-center py-12">
                  <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {bills.length === 0 ? 'No bills yet' : 'No bills match your filters'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {bills.length === 0 
                      ? 'Create your first shared bill to get started.'
                      : 'Try adjusting your filters to see more bills.'
                    }
                  </p>
                  {bills.length === 0 && (
                    <button
                      onClick={() => router.push('/bills/create')}
                      className="btn btn-primary"
                    >
                      Create First Bill
                    </button>
                  )}
                </div>
              ) : (
                filteredBills.map((bill) => (
                  <div
                    key={bill.id}
                    onClick={() => router.push(`/bills/${bill.id}`)}
                    className="card cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {bill.title}
                        </h3>
                        <div className="flex items-center space-x-2">
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
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(bill.amount)}
                        </div>
                        {bill.split_amount && (
                          <div className="text-sm text-gray-600">
                            {formatCurrency(bill.split_amount)} each
                          </div>
                        )}
                      </div>
                    </div>

                    {bill.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {bill.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>
                            {bill.created_by === user?.id ? 'You' : 'Housemate'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(bill.created_at)}</span>
                        </div>
                      </div>
                      {bill.due_date && (
                        <div className="flex items-center space-x-1">
                          <span>Due: {formatDate(bill.due_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
