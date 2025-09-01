import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Family } from '../../types';

interface FamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>) => void;
  family?: Family | null;
  title: string;
  isViewMode?: boolean; // New prop for view mode
}

export default function FamilyModal({ isOpen, onClose, onSave, family, title, isViewMode = false }: FamilyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    careType: [] as string[],
    preferences: {
      consistentProvider: false,
      genderPreference: '',
      languagePreference: '',
      specialRequests: ''
    },
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    if (family) {
      setFormData({
        name: family.name,
        email: family.email,
        phone: family.phone,
        address: family.address,
        careType: family.careType || [],
        preferences: {
          consistentProvider: family.preferences?.consistentProvider ?? false,
          genderPreference: family.preferences?.genderPreference ?? '',
          languagePreference: family.preferences?.languagePreference ?? '',
          specialRequests: family.preferences?.specialRequests ?? ''
        },
        status: family.status
      });
    }
  }, [family]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const toggleCareType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      careType: prev.careType.includes(type)
        ? prev.careType.filter(t => t !== type)
        : [...prev.careType, type]
    }));
  };

  if (!isOpen) return null;

  const availableCareTypes = ['doula', 'lactation', 'nurse', 'newborn'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Family Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
                readOnly={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
                readOnly={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
                readOnly={isViewMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
                readOnly={isViewMode}
              />
            </div>
          </div>

          {/* Care Types */}
          <div>
            <label className="block text-sm font-medium mb-2">Care Types Needed</label>
            <div className="flex flex-wrap gap-2">
              {availableCareTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleCareType(type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    formData.careType.includes(type)
                      ? 'bg-blue-100 text-blue-800 border'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  disabled={isViewMode}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <label className="block text-sm font-medium">Preferences</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.preferences.consistentProvider}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, consistentProvider: e.target.checked }
                  }))
                }
                disabled={isViewMode}
              />
              <span>Requires Consistent Provider</span>
            </div>
            <input
              type="text"
              placeholder="Gender Preference"
              value={formData.preferences.genderPreference || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, genderPreference: e.target.value }
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
              readOnly={isViewMode}
            />
            <input
              type="text"
              placeholder="Language Preference"
              value={formData.preferences.languagePreference || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, languagePreference: e.target.value }
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
              readOnly={isViewMode}
            />
            <textarea
              placeholder="Special Requests"
              value={formData.preferences.specialRequests || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, specialRequests: e.target.value }
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
              readOnly={isViewMode}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isViewMode}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg">
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && (
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {family ? 'Update' : 'Create'} Family
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
