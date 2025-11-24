'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  AlertCircle,
  Check
} from 'lucide-react';

interface HouseRule {
  id: number;
  house_id: number;
  title: string;
  description?: string;
  created_by: number;
  created_at: string;
  created_by_name?: string;
}

export default function HouseRulesPage() {
  const [rules, setRules] = useState<HouseRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<HouseRule | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const isHost = user?.role === 'host';

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/house-rules', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setRules(data.data.rules || []);
      } else {
        setError(data.error || 'Failed to load house rules');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Rule title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      const url = editingRule ? `/api/house-rules/${editingRule.id}` : '/api/house-rules';
      const method = editingRule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ title: '', description: '' });
        setShowCreateForm(false);
        setEditingRule(null);
        loadRules();
      } else {
        setError(data.error || `Failed to ${editingRule ? 'update' : 'create'} rule`);
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (rule: HouseRule) => {
    setEditingRule(rule);
    setFormData({
      title: rule.title,
      description: rule.description || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/house-rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        loadRules();
      } else {
        setError(data.error || 'Failed to delete rule');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setShowCreateForm(false);
    setEditingRule(null);
    setError('');
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-lg mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">House Rules</h1>
              </div>
              {isHost && !showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="touch-target p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Create/Edit Form */}
            {showCreateForm && isHost && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingRule ? 'Edit Rule' : 'Create New Rule'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rule Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input"
                      placeholder="e.g., No loud music after 10 PM"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input min-h-[100px] resize-none"
                      placeholder="Additional details about this rule..."
                      rows={4}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={submitting || !formData.title.trim()}
                      className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{editingRule ? 'Updating...' : 'Creating...'}</span>
                        </div>
                      ) : (
                        editingRule ? 'Update Rule' : 'Create Rule'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Rules List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error && rules.length === 0 ? (
              <div className="card text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Rules</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={loadRules}
                  className="btn btn-secondary"
                >
                  Try Again
                </button>
              </div>
            ) : rules.length === 0 ? (
              <div className="card text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No House Rules</h3>
                <p className="text-gray-600 mb-6">
                  {isHost 
                    ? "You haven't created any house rules yet. Set some guidelines for your roommates!"
                    : "Your host hasn't set any house rules yet."
                  }
                </p>
                {isHost && !showCreateForm && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn btn-primary"
                  >
                    Create First Rule
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {rule.title}
                        </h3>
                        {rule.description && (
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {rule.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>
                              Created by {rule.created_by_name || 'Host'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(rule.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      {isHost && (
                        <div className="flex items-center space-x-1 ml-4">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="touch-target p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="touch-target p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
