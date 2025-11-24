'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LogOut, Home, User } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
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

            {/* Debug Info (for development) */}
            <div className="card bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Debug Info (Development)
              </h3>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
