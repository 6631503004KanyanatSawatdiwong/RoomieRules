'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Home, CreditCard, ArrowLeft, Copy, CheckCircle } from 'lucide-react';

export default function CreateHousePage() {
  const [formData, setFormData] = useState({
    name: '',
    bank_account: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdHouse, setCreatedHouse] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

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
      const response = await fetch('/api/houses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setCreatedHouse(data.data.house);
      } else {
        setError(data.error || 'Failed to create house');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const copyHouseCode = async () => {
    if (createdHouse?.house_code) {
      try {
        await navigator.clipboard.writeText(createdHouse.house_code);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = createdHouse.house_code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (createdHouse) {
    return (
      <ProtectedRoute requireRole="host">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-lg mx-auto px-6 py-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h1 className="text-lg font-semibold text-gray-900">House Created!</h1>
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
                    House "{createdHouse.name}" Created Successfully!
                  </h2>
                  <p className="text-green-700">
                    Your house is ready for roommates to join.
                  </p>
                </div>
              </div>

              {/* House Code Card */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Share This Code
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">House Code</p>
                    <div className="text-3xl font-bold text-blue-600 tracking-wider">
                      {createdHouse.house_code}
                    </div>
                  </div>
                  
                  <button
                    onClick={copyHouseCode}
                    className="btn btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions Card */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Next Steps
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">1</span>
                    </div>
                    <p>Share the house code <strong>{createdHouse.house_code}</strong> with your roommates</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">2</span>
                    </div>
                    <p>They can join by entering this code in the "Join House" page</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">3</span>
                    </div>
                    <p>Once roommates join, you can start creating and managing bills</p>
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
    <ProtectedRoute requireRole="host">
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
              <h1 className="text-lg font-semibold text-gray-900">Create House</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Intro Card */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Set up your house
              </h2>
              <p className="text-gray-600">
                Create a house for your roommates to join. You'll get a unique code to share with them.
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
                  <label htmlFor="name" className="form-label">
                    House Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input pl-12"
                      placeholder="e.g. Sunset Apartment, Downtown House"
                    />
                    <Home className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="bank_account" className="form-label">
                    Bank Account Number
                  </label>
                  <div className="relative">
                    <input
                      id="bank_account"
                      name="bank_account"
                      type="text"
                      required
                      value={formData.bank_account}
                      onChange={handleChange}
                      className="form-input pl-12"
                      placeholder="Your bank account for housing bill payments"
                    />
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Roommates will see this account number when paying housing bills like rent and utilities.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating House...
                    </div>
                  ) : (
                    'Create House'
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
