'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  Search, 
  Filter, 
  Receipt, 
  DollarSign, 
  User,
  Calendar,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface SearchResult {
  bills: Array<{
    id: number;
    title: string;
    description?: string;
    amount: number;
    type: string;
    status: string;
    created_at: string;
    created_by_name: string;
    result_type: 'bill';
  }>;
  payments: Array<{
    id: number;
    amount_owed: number;
    status: string;
    paid_at?: string;
    created_at: string;
    bill_title: string;
    bill_amount: number;
    bill_type: string;
    user_name: string;
    result_type: 'payment';
  }>;
  members: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    result_type: 'member';
  }>;
  total: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'bills' | 'payments' | 'members'>('all');

  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial query from URL params
  useEffect(() => {
    const initialQuery = searchParams?.get('q') || '';
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery, filter);
    }
  }, [searchParams]);

  const performSearch = useCallback(async (searchQuery: string, searchFilter: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      const filterParam = searchFilter === 'all' ? '' : `&type=${searchFilter}`;
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}${filterParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, filter);
    
    // Update URL
    const newParams = new URLSearchParams();
    if (query.trim()) {
      newParams.set('q', query.trim());
    }
    router.replace(`/search?${newParams.toString()}`, { scroll: false });
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    if (query.trim()) {
      performSearch(query, newFilter);
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
              <Search className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Search</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search bills, payments, or members..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'bills', label: 'Bills' },
                  { key: 'payments', label: 'Payments' },
                  { key: 'members', label: 'Members' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleFilterChange(key as typeof filter)}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </form>

            {/* Results */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {error && (
              <div className="card text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => performSearch(query, filter)}
                  className="btn btn-secondary"
                >
                  Try Again
                </button>
              </div>
            )}

            {results && !loading && (
              <>
                {/* Results Summary */}
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Search Results for "{query}"
                  </h3>
                  <p className="text-sm text-gray-600">
                    Found {results.total} result{results.total !== 1 ? 's' : ''}
                    {filter !== 'all' && ` in ${filter}`}
                  </p>
                </div>

                {/* Bills Results */}
                {results.bills.length > 0 && (filter === 'all' || filter === 'bills') && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <Receipt className="w-5 h-5" />
                      <span>Bills ({results.bills.length})</span>
                    </h4>
                    {results.bills.map((bill) => (
                      <div
                        key={`bill-${bill.id}`}
                        onClick={() => router.push(`/bills/${bill.id}`)}
                        className="card cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">
                              {bill.title}
                            </h5>
                            {bill.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {bill.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillTypeColor(bill.type)}`}>
                                {bill.type}
                              </span>
                              <span>{formatDate(bill.created_at)}</span>
                              <span>by {bill.created_by_name}</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(bill.amount)}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              bill.status === 'active' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {bill.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payments Results */}
                {results.payments.length > 0 && (filter === 'all' || filter === 'payments') && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Your Payments ({results.payments.length})</span>
                    </h4>
                    {results.payments.map((payment) => (
                      <div
                        key={`payment-${payment.id}`}
                        className="card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">
                              {payment.bill_title}
                            </h5>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBillTypeColor(payment.bill_type)}`}>
                                {payment.bill_type}
                              </span>
                              <span>{formatDate(payment.created_at)}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Bill total: {formatCurrency(payment.bill_amount)}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(payment.amount_owed)}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              payment.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {payment.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Members Results */}
                {results.members.length > 0 && (filter === 'all' || filter === 'members') && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>House Members ({results.members.length})</span>
                    </h4>
                    {results.members.map((member) => (
                      <div
                        key={`member-${member.id}`}
                        className="card"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {member.email}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.role === 'host' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {member.role}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Since {formatDate(member.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {results.total === 0 && (
                  <div className="card text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                    <p className="text-gray-600">
                      No {filter === 'all' ? 'items' : filter} found matching "{query}".
                      Try a different search term or filter.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!results && !loading && !error && (
              <div className="card text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Searching</h3>
                <p className="text-gray-600">
                  Search for bills, payments, or house members using the search box above.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
