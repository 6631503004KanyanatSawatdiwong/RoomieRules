'use client';

import React, { useState } from 'react';
import { Home, Copy, CheckCircle, Users, Trash2, AlertTriangle, Edit3, X, Check } from 'lucide-react';

interface House {
  id: number;
  name: string;
  house_code: string;
  host_id: number;
  member_count: number;
  is_host: boolean;
}

interface HouseManagementProps {
  house: House;
  onHouseDeleted: () => void;
  onHouseUpdated: () => void;
}

export const HouseManagement: React.FC<HouseManagementProps> = ({
  house,
  onHouseDeleted,
  onHouseUpdated
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(house.name);
  const [isUpdating, setIsUpdating] = useState(false);

  const copyHouseCode = async () => {
    try {
      await navigator.clipboard.writeText(house.house_code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = house.house_code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleUpdateHouseName = async () => {
    if (!editName.trim()) {
      alert('House name cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/houses', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsEditing(false);
        onHouseUpdated(); // Refresh house data
      } else {
        alert('Failed to update house name: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Network error occurred while updating house name');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(house.name); // Reset to original name
    setIsEditing(false);
  };

  const handleDeleteHouse = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/houses', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        onHouseDeleted();
      } else {
        alert('Failed to delete house: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Network error occurred while deleting house');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
          {/* House Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              {isEditing ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-1 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="House name"
                    disabled={isUpdating}
                  />
                  <button
                    onClick={handleUpdateHouseName}
                    disabled={isUpdating || !editName.trim()}
                    className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                    title="Save"
                  >
                    {isUpdating ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">"{house.name}"</h4>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit house name"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">House Code</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-lg font-bold text-blue-600">
                    {house.house_code}
                  </span>
                  <button
                    onClick={copyHouseCode}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy house code"
                  >
                    {copySuccess ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Members</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{house.member_count}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Share with Roommates</h5>
            <p className="text-sm text-blue-700 mb-3">
              Give your roommates the house code <strong>{house.house_code}</strong> so they can join your house.
            </p>
            <button
              onClick={copyHouseCode}
              className="bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center space-x-2 transition-colors"
            >
              {copySuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy House Code</span>
                </>
              )}
            </button>
          </div>

          {/* Delete House Section - Only for hosts */}
          {house.is_host && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-800 font-medium py-2 px-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete House</span>
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This will remove all members, bills, and data permanently
              </p>
            </div>
          )}
        </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete House</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete "{house.name}"? This will:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Remove all {house.member_count} house members</li>
                <li>• Delete all bills and payments</li>
                <li>• Delete all house rules</li>
                <li>• Permanently delete all house data</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteHouse}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete House'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
