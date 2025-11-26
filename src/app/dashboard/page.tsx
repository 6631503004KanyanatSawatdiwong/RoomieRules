'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HouseManagement } from '@/components/HouseManagement';
import { LogOut, Home, User, Receipt, DollarSign, TrendingUp, Calendar, Users, Search } from 'lucide-react';

interface Analytics {
  bills: {
    total: number;
    active: number;
    totalAmount: number;
    activeAmount: number;
  };
  currentMonth: {
    bills: Array<{ type: string; total: number; count: number }>;
    total: number;
    count: number;
  };
  lastMonth: {
    total: number;
    count: number;
  };
  userPayments: {
    total: number;
    totalOwed: number;
    totalPaid: number;
    totalPending: number;
  };
  recentActivity: Array<{
    id: number;
    title: string;
    amount: number;
    type: string;
    created_at: string;
    created_by_name: string;
    user_payment_status: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  houseInfo: {
    memberCount: number;
  };
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [houseInfo, setHouseInfo] = useState<any>(null);
  const [loadingHouse, setLoadingHouse] = useState(false);

  useEffect(() => {
    if (user?.house_id) {
      loadAnalytics();
      loadHouseInfo();
    }
  }, [user?.house_id]);

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadHouseInfo = async () => {
    try {
      setLoadingHouse(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/houses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.data.house) {
        setHouseInfo(data.data.house);
      }
    } catch (error) {
      console.error('Failed to load house info:', error);
    } finally {
      setLoadingHouse(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const handleHouseDeleted = () => {
    // Refresh page or redirect to force re-authentication
    window.location.reload();
  };

  const handleHouseUpdated = () => {
    loadHouseInfo();
    if (user?.house_id) {
      loadAnalytics();
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-lg mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Home className="w-6 h-6 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              </div>
              <button
                onClick={handleLogout}
                className="touch-target flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Welcome Card */}
            <div className="card">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Welcome, {user?.name}!
                  </h2>
                  <p className="text-sm text-gray-600 capitalize">
                    {user?.role} • {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            {user?.house_id && analytics && (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card">
                    <div className="flex items-center space-x-2 mb-2">
                      <Receipt className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Bills</h4>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {analytics.bills.active}
                    </div>
                    <div className="text-sm text-gray-600">Active bills</div>
                  </div>
                  
                  <div className="card">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-gray-900">Pending</h4>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.userPayments.totalPending)}
                    </div>
                    <div className="text-sm text-gray-600">Your obligations</div>
                  </div>
                </div>

                {/* Monthly Comparison */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">This Month</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(analytics.currentMonth.total)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {analytics.currentMonth.count} bills
                      </div>
                    </div>
                  </div>
                  
                  {analytics.lastMonth.total > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-medium ${
                        getChangePercentage(analytics.currentMonth.total, analytics.lastMonth.total) > 0
                          ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {getChangePercentage(analytics.currentMonth.total, analytics.lastMonth.total) > 0 ? '↑' : '↓'}
                        {Math.abs(getChangePercentage(analytics.currentMonth.total, analytics.lastMonth.total)).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">vs last month</div>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                {analytics.recentActivity.length > 0 && (
                  <div className="card">
                    <div className="flex items-center space-x-2 mb-4">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="space-y-3">
                      {analytics.recentActivity.slice(0, 3).map((bill) => (
                        <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{bill.title}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(bill.created_at)} • {bill.created_by_name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(bill.amount)}
                            </div>
                            {bill.user_payment_status && (
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                bill.user_payment_status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {bill.user_payment_status}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => router.push('/bills')}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View all bills →
                    </button>
                  </div>
                )}

                {/* House Info */}
                <div className="card">
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">House Info</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">House Members</span>
                      <span className="font-medium text-gray-900">
                        {analytics.houseInfo.memberCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Bills</span>
                      <span className="font-medium text-gray-900">
                        {analytics.bills.total}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(analytics.bills.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>


              </>
            )}

            {/* Loading Analytics */}
            {user?.house_id && !analytics && loadingAnalytics && (
              <div className="card text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analytics...</p>
              </div>
            )}

            {/* Loading House Info for Hosts */}
            {user?.role === 'host' && user?.house_id && !houseInfo && loadingHouse && (
              <div className="card text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading house information...</p>
              </div>
            )}

            {/* Status Card */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Role</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {user?.role}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">House Status</span>
                  <span className="font-medium text-gray-900">
                    {user?.house_id ? 'Joined' : 'Not joined'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-medium text-gray-900">
                    {user?.role === 'host' ? 'House Owner' : 'House Member'}
                  </span>
                </div>
              </div>
            </div>



            {/* Quick Actions */}
            {user?.house_id && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => router.push('/bills')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Receipt className="w-6 h-6 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">View Bills</span>
                  </button>
                  <button
                    onClick={() => router.push('/payments')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">My Payments</span>
                  </button>
                  <button
                    onClick={() => router.push('/search')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Search className="w-6 h-6 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Search</span>
                  </button>
                  <button
                    onClick={() => router.push('/rules')}
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Home className="w-6 h-6 text-indigo-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">House Rules</span>
                  </button>
                </div>
              </div>
            )}

            {/* House Management Section - Only for hosts */}
            {user?.role === 'host' && user?.house_id && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  House Management
                </h3>
                {loadingHouse ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading house information...</p>
                  </div>
                ) : houseInfo ? (
                  <HouseManagement 
                    house={houseInfo}
                    onHouseDeleted={handleHouseDeleted}
                    onHouseUpdated={handleHouseUpdated}
                  />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-red-600">Failed to load house information</p>
                    <button 
                      onClick={loadHouseInfo}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Next Steps */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Next Steps
              </h3>
              <div className="space-y-3">
                {user?.role === 'host' ? (
                  !user?.house_id ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">
                        As a host, you can create a house for your roommates to join.
                      </p>
                      <a href="/house/create" className="btn btn-primary">
                        Create House
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">
                        Your house is ready! Start creating bills for your roommates.
                      </p>
                      <button className="btn btn-primary">
                        Create Bill
                      </button>
                    </div>
                  )
                ) : (
                  !user?.house_id ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">
                        Join an existing house using the code provided by your host.
                      </p>
                      <a href="/house/join" className="btn btn-primary">
                        Join House
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">
                        Welcome to your house! You can now view bills and create shared expenses.
                      </p>
                      <button className="btn btn-primary">
                        View Bills
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>


          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
