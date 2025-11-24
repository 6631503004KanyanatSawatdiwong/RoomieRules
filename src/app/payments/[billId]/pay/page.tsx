'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Upload, ArrowLeft, DollarSign, Receipt, Check, AlertCircle } from 'lucide-react';

interface Bill {
  id: number;
  title: string;
  amount: number;
  type: string;
  split_amount?: number;
}

interface BillPayment {
  id: number;
  bill_id: number;
  user_id: number;
  amount_owed: number;
  status: 'pending' | 'paid';
}

export default function PaymentUploadPage({ params }: { params: { billId: string } }) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [payment, setPayment] = useState<BillPayment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const router = useRouter();
  const billId = parseInt(params.billId);

  useEffect(() => {
    if (billId && user) {
      loadBillAndPayment();
    }
  }, [billId, user]);

  const loadBillAndPayment = async () => {
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
        // Find current user's payment
        const userPayment = data.data.payments?.find((p: BillPayment) => p.user_id === user?.id);
        setPayment(userPayment || null);
        
        if (!userPayment) {
          setError('Payment not found for this bill');
        } else if (userPayment.status === 'paid') {
          setSuccess(true);
        }
      } else {
        setError(data.error || 'Failed to load bill details');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only image files (JPEG, PNG, WebP) are allowed');
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !payment) {
      setError('Please select a receipt image');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setPayment({ ...payment, status: 'paid' });
        
        // Redirect back to bill details after a short delay
        setTimeout(() => {
          router.push(`/bills/${billId}`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to upload receipt');
      }
    } catch (error) {
      setError('Network error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !bill) {
    return (
      <ProtectedRoute>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="card text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/bills')}
              className="btn btn-secondary"
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
              <Upload className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Upload Receipt</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Recorded!</h2>
                <p className="text-gray-600 mb-6">
                  Your payment receipt has been uploaded successfully. You'll be redirected back to the bill details.
                </p>
                <button
                  onClick={() => router.push(`/bills/${billId}`)}
                  className="btn btn-primary"
                >
                  View Bill Details
                </button>
              </div>
            ) : (
              <>
                {/* Bill Info */}
                {bill && (
                  <div className="card">
                    <div className="flex items-center space-x-3 mb-4">
                      <Receipt className="w-6 h-6 text-blue-600" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {bill.title}
                        </h2>
                        <p className="text-sm text-gray-600">
                          Total: {formatCurrency(bill.amount)}
                        </p>
                      </div>
                    </div>
                    
                    {payment && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">
                            Amount you owe:
                          </span>
                          <span className="text-xl font-bold text-blue-900">
                            {formatCurrency(payment.amount_owed)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Form */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Upload Payment Receipt
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt Image
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="receipt-upload"
                        />
                        <label
                          htmlFor="receipt-upload"
                          className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {selectedFile ? selectedFile.name : 'Click to select receipt image'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            JPEG, PNG, WebP up to 5MB
                          </p>
                        </label>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading || payment?.status === 'paid'}
                        className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          'Upload Receipt'
                        )}
                      </button>
                      
                      <button
                        onClick={() => router.back()}
                        className="btn btn-secondary w-full"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tips:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Take a clear photo of your payment receipt</li>
                    <li>• Make sure the amount and date are visible</li>
                    <li>• Supported formats: JPEG, PNG, WebP</li>
                    <li>• Maximum file size: 5MB</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
