'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Home, ArrowLeft, CheckCircle, Hash } from 'lucide-react';

export default function JoinHousePage() {
  const [formData, setFormData] = useState({
    house_code: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinedHouse, setJoinedHouse] = useState<any>(null);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user already has a house
    if (user?.house_id) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/houses/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          house_code: formData.house_code.toUpperCase().trim()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setJoinedHouse(data.data.house);
      } else {
        setError(data.error || 'Failed to join house');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase and limit to 6 characters
    const value = e.target.value.toUpperCase().slice(0, 6);
    setFormData(prev => ({
      ...prev,
      house_code: value
    }));
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (joinedHouse) {
    return (
      <ProtectedRoute requireRole="roommate">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-lg mx-auto px-6 py-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h1 className="text-lg font-semibold text-gray-900">Successfully Joined!</h1>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 px-6 py-8">
            <div className="max-w-lg mx-auto space-y-6">
              {/* Success Card */}
              <div className="card bg-green-50 border-green-200">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-green-900 mb-2">
                    Welcome to "{joinedHouse.name}"!
                  </h2>
                  <p className="text-green-700">
                    You've successfully joined the house.
                  </p>
                </div>
              </div>

              {/* House Info Card */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  House Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">House Name</span>
                    <span className="font-medium text-gray-900">
                      {joinedHouse.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">House Code</span>
                    <span className="font-medium text-gray-900 font-mono">
                      {joinedHouse.house_code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">Your Role</span>
                    <span className="font-medium text-gray-900 capitalize">
                      Roommate
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps Card */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What's Next?
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">1</span>
                    </div>
                    <p>You can now view and pay bills created by your host and other roommates</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">2</span>
                    </div>
                    <p>Create your own bills for shared expenses like groceries and outings</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">3</span>
                    </div>
                    <p>Upload payment receipts to keep track of your contributions</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={goToDashboard}
                className="btn btn-primary w-full"
              >
                Go to Dashboard
              </button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireRole="roommate">
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
              <Home className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Join House</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Intro Card */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Join an existing house
              </h2>
              <p className="text-gray-600">
                Enter the 6-character house code provided by your host to join their house.
              </p>
            </div>

            {/* Form Card */}
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="house_code" className="form-label">
                    House Code
                  </label>
                  <div className="relative">
                    <input
                      id="house_code"
                      name="house_code"
                      type="text"
                      required
                      value={formData.house_code}
                      onChange={handleChange}
                      className="form-input pl-12 font-mono text-lg tracking-wider uppercase text-center"
                      placeholder="ABC123"
                      maxLength={6}
                      autoComplete="off"
                    />
                    <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Ask your host for the 6-character house code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || formData.house_code.length !== 6}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Joining House...
                    </div>
                  ) : (
                    'Join House'
                  )}
                </button>

                {formData.house_code.length > 0 && formData.house_code.length < 6 && (
                  <p className="text-sm text-amber-600 text-center">
                    Code must be exactly 6 characters ({6 - formData.house_code.length} more needed)
                  </p>
                )}
              </form>
            </div>

            {/* Help Card */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Need help?
              </h3>
              <p className="text-sm text-blue-700">
                If you don't have a house code, ask the person who invited you to provide it. 
                Only they can create the house and generate the code for you to join.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
