'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Receipt, ArrowLeft, DollarSign, Calendar, FileText } from 'lucide-react';

export default function CreateBillPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'grocery' as 'housing' | 'grocery' | 'eat-out' | 'other',
    due_date: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user doesn't have a house
    if (user && !user.house_id) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/bills');
      } else {
        setError(data.error || 'Failed to create bill');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const billTypes = [
    { value: 'grocery', label: 'Grocery & Food', available: true },
    { value: 'eat-out', label: 'Restaurants & Takeout', available: true },
    { value: 'other', label: 'Other Shared Expenses', available: true },
    { value: 'housing', label: 'Housing (Rent, Utilities)', available: user?.role === 'host' },
  ];

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
              <h1 className="text-lg font-semibold text-gray-900">Create Bill</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Intro Card */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                New Shared Bill
              </h2>
              <p className="text-gray-600">
                Create a bill that will be shared with your housemates.
                {user?.role === 'host' && ' As a host, you can create housing bills that auto-split among all members.'}
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
                  <label htmlFor="title" className="form-label">
                    Bill Title
                  </label>
                  <div className="relative">
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="form-input pl-12"
                      placeholder="e.g. Grocery shopping, Electricity bill"
                    />
                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="form-label">
                    Bill Type
                  </label>
                  <div className="relative">
                    <select
                      id="type"
                      name="type"
                      required
                      value={formData.type}
                      onChange={handleChange}
                      className="form-input pl-12 appearance-none"
                    >
                      {billTypes.map(type => (
                        type.available && (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        )
                      ))}
                    </select>
                    <Receipt className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {formData.type === 'housing' && (
                    <p className="mt-2 text-sm text-blue-600">
                      Housing bills will be automatically split equally among all house members.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="amount" className="form-label">
                    Total Amount
                  </label>
                  <div className="relative">
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formData.amount}
                      onChange={handleChange}
                      className="form-input pl-12"
                      placeholder="0.00"
                    />
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="form-label">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Additional details about this bill..."
                  />
                </div>

                <div>
                  <label htmlFor="due_date" className="form-label">
                    Due Date (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="due_date"
                      name="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={handleChange}
                      className="form-input pl-12"
                    />
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Bill...
                    </div>
                  ) : (
                    'Create Bill'
                  )}
                </button>
              </form>
            </div>

            {/* Help Card */}
            {user?.role === 'roommate' && (
              <div className="card bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Note for Roommates
                </h3>
                <p className="text-sm text-blue-700">
                  You can create bills for groceries, dining out, and other shared expenses. 
                  Only your host can create housing bills like rent and utilities.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
