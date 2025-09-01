import React, { useState, useEffect } from 'react';
import { Plus, Heart, Phone, MapPin, Star } from 'lucide-react';
import { Family } from '../../types';
import { ApiService } from '../../services/api';
import FamilyModal from './FamilyModal';

interface FamiliesViewProps {
  openNewFamilyModal?: boolean;
}

export default function FamiliesView({ openNewFamilyModal }: FamiliesViewProps) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewFamilyModalOpen, setIsNewFamilyModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [isViewMode, setIsViewMode] = useState(false); // New state for view mode

  useEffect(() => {
    loadFamilies();
  }, []);

  const handleSaveFamily = async (familyData: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedFamily) {
        // Update existing family
        await ApiService.updateFamily(selectedFamily.id, familyData);
      } else {
        // Create new family
        await ApiService.createFamily(familyData);
      }
      loadFamilies();
      setIsNewFamilyModalOpen(false);
      setSelectedFamily(null);
    } catch (error) {
      console.error('Error saving family:', error);
    }
  };

  const handleEditFamily = (family: Family) => {
    setSelectedFamily(family);
    setIsViewMode(false); // Ensure edit mode
    setIsNewFamilyModalOpen(true);
  };

  const handleViewFamily = (family: Family) => {
    setSelectedFamily(family);
    setIsViewMode(true); // Set view mode
    setIsNewFamilyModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsNewFamilyModalOpen(false);
    setSelectedFamily(null);
    setIsViewMode(false); // Reset view mode on close
  };

  useEffect(() => {
    if (openNewFamilyModal) {
      setIsNewFamilyModalOpen(true);
    }
  }, [openNewFamilyModal]);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getFamilies();
      setFamilies(data);
    } catch (error) {
      console.error('Error loading families:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Families</h1>
          <p className="text-gray-600">Manage families receiving care</p>
        </div>
        <button
          onClick={() => {
            setSelectedFamily(null); // Clear selected family for new creation
            setIsViewMode(false); // Ensure edit mode for new creation
            setIsNewFamilyModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {families.map(family => (
          <div key={family.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <Heart className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{family.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    family.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {family.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {family.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {family.address}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Care Types Needed</p>
              <div className="flex flex-wrap gap-1">
                {family.careType && family.careType.map((type, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {family.preferences.consistentProvider && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-xs font-medium text-yellow-800">
                    Requires Consistent Provider
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleViewFamily(family)}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => handleEditFamily(family)}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {families.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No families registered</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first family to the system.</p>
          <button
            onClick={() => setIsNewFamilyModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Family
          </button>
        </div>
      )}

      <FamilyModal
        isOpen={isNewFamilyModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveFamily}
        family={selectedFamily}
        title={isViewMode ? 'Family Details' : (selectedFamily ? 'Edit Family' : 'Add New Family')}
        isViewMode={isViewMode}
      />
    </div>
  );
}
