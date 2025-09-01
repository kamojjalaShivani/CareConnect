import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CareRequest, Family, Provider, CareRequestMatches } from '../../types';
import { BackendApiService } from '../../services/backendApi';
import { useAuth } from '../../contexts/AuthContext';
import ProviderSuggestionsList from '../Providers/ProviderSuggestionsList'; // Import the new component

interface CareRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    careRequest: Omit<CareRequest, 'id' | 'createdAt' | 'updatedAt'>,
    startTime?: string,
    endTime?: string,
    hoursPerDay?: number,
  ) => Promise<CareRequest | null>;
  careRequest?: CareRequest | null;
  title: string;
}

export default function CareRequestModal({ isOpen, onClose, onSave, careRequest, title }: CareRequestModalProps) {
  console.log('CareRequestModal: Component render cycle started. isOpen:', isOpen, 'careRequest:', careRequest?.id);
  const [familyId, setFamilyId] = useState('');
  const [careType, setCareType] = useState('');
  const [supportType, setSupportType] = useState<'daytime' | 'overnight' | '24_7'>('daytime');
  const [preferredProviderId, setPreferredProviderId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState(''); // Time string, e.g., "10:00"
  const [endTime, setEndTime] = useState('');     // Time string, e.g., "11:00"
  const [hoursPerDay, setHoursPerDay] = useState(1);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [requiresConsistency, setRequiresConsistency] = useState(false);
  const [location, setLocation] = useState('');
  const [families, setFamilies] = useState<Family[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]); // Re-introduce providers state
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(true); // Re-introduce loadingProviders state
  const [careRequestMatches, setCareRequestMatches] = useState<CareRequestMatches | null>(null);
  const [assignedProviderId, setAssignedProviderId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (careRequest?.id) { // Only initialize if a careRequest with an ID is present
      console.log('CareRequestModal: Initializing with careRequest', careRequest);
      setFamilyId(careRequest.familyId || '');
      setCareType(careRequest.careType || '');
      setSupportType(careRequest.supportType || 'daytime');
      setPreferredProviderId(careRequest.preferredProviderId || '');
      setStartDate(careRequest.startDate || '');
      setEndDate(careRequest.endDate || '');
      setStartTime(careRequest.startTime || '');
      setEndTime(careRequest.endTime || '');
      setHoursPerDay(careRequest.hoursPerDay || 1);
      setNotes(careRequest.notes || '');
      setPriority(careRequest.priority || 'medium');
      setRequiresConsistency(careRequest.requiresConsistency || false);
      setLocation(careRequest.location || '');
      setAssignedProviderId(careRequest.providerId || null);
    } else {
      console.log('CareRequestModal: Resetting form for new care request or when no careRequest is selected');
      setFamilyId('');
      setCareType('');
      setSupportType('daytime');
      setPreferredProviderId('');
      setStartDate('');
      setEndDate('');
      setStartTime('');
      setEndTime('');
      setHoursPerDay(1);
      setNotes('');
      setPriority('medium');
      setRequiresConsistency(false);
      setLocation('');
      setAssignedProviderId(null);
    }
  }, [careRequest?.id, isOpen]); // Depend on careRequest.id instead of careRequest object

  useEffect(() => {
    const loadFamiliesAndProviders = async () => { // Combine loading functions
      console.log('CareRequestModal: Loading families and providers...');
      try {
        setLoadingFamilies(true);
        const familiesData = await BackendApiService.getFamilies();
        setFamilies(familiesData);
        console.log('CareRequestModal: Families loaded.');
      } catch (error) {
        console.error('Error loading families:', error);
      } finally {
        setLoadingFamilies(false);
      }

      try {
        setLoadingProviders(true);
        const providersData = await BackendApiService.getProviders();
        setProviders(providersData);
        console.log('CareRequestModal: Providers loaded.');
      } catch (error) {
        console.error('Error loading providers:', error);
      } finally {
        setLoadingProviders(false);
      }
    };

    const fetchCareRequestMatches = async (requestId: string) => {
      console.log(`CareRequestModal: Fetching care request matches for ID: ${requestId}`);
      try {
        const matches = await BackendApiService.getCareRequestMatches(requestId);
        setCareRequestMatches(matches);
        console.log('CareRequestModal: Care request matches fetched.', matches);
        if (matches.mode === "consistent" && careRequest?.providerId) {
          setAssignedProviderId(careRequest.providerId);
          console.log('CareRequestModal: Assigned provider ID set for consistent mode.', careRequest.providerId);
        }
      } catch (error) {
        console.error('Error fetching care request matches:', error);
        setCareRequestMatches(null);
      }
    };

    if (isOpen) {
      console.log('CareRequestModal: Modal is open, initiating data load.');
      loadFamiliesAndProviders(); // Call combined loading function
      if (careRequest?.id) {
        fetchCareRequestMatches(careRequest.id);
      }
    } else {
      console.log('CareRequestModal: Modal is closed, resetting matches and selections.');
      setCareRequestMatches(null);
      setAssignedProviderId(null);
    }
  }, [isOpen, careRequest?.id]); // Removed careRequest?.providerId from dependencies

  const handleAssignProvider = (providerId: string) => {
    console.log(`CareRequestModal: handleAssignProvider called. Provider ID: ${providerId}`);
    setAssignedProviderId(providerId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('CareRequestModal: handleSubmit called.');
    const currentStatus = careRequest?.status || 'pending';

    let providerIdToSave: string | undefined = undefined;
    if (careRequestMatches?.mode === 'consistent') {
      providerIdToSave = assignedProviderId || undefined;
    }

    const careRequestPayload = {
      familyId,
      providerId: providerIdToSave,
      careType,
      supportType: supportType,
      preferredProviderId: preferredProviderId || undefined,
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      hoursPerDay: hoursPerDay,
      notes,
      priority,
      requiresConsistency,
      location,
      status: currentStatus,
    };

    try {
      console.log('CareRequestModal: Calling onSave with payload:', careRequestPayload);
      await onSave(
        careRequestPayload,
        startTime,
        endTime,
        hoursPerDay
      );
      console.log('CareRequestModal: onSave successful.');
    } catch (error) {
      console.error('Error saving care request or creating assignments:', error);
      // Optionally, show an error message to the user
    } finally {
      console.log('CareRequestModal: Closing modal after save attempt.');
      onClose();
    }
  };

  if (!isOpen) {
    console.log('CareRequestModal: Modal is not open, returning null.');
    return null;
  }

  const isNewRequest = !careRequest;
  const isFamilyUser = user?.role === 'family';
  const showProviderSuggestions = !(isNewRequest && isFamilyUser);

  console.log('CareRequestModal: Rendering modal content.');
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex flex-col items-center justify-center z-50 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="family" className="block text-sm font-medium text-gray-700">Family</label>
              <select
                id="family"
                value={familyId}
                onChange={(e) => setFamilyId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled={loadingFamilies || (isNewRequest && isFamilyUser)}
              >
                <option value="">{loadingFamilies ? 'Loading families...' : 'Select a family'}</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>{family.name}</option>
                ))}
              </select>
            </div>

            {/* Preferred Provider is still a general preference, not an assignment */}
            <div>
              <label htmlFor="preferredProvider" className="block text-sm font-medium text-gray-700">Preferred Provider (Optional)</label>
              <select
                id="preferredProvider"
                value={preferredProviderId}
                onChange={(e) => setPreferredProviderId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={loadingProviders}
              >
                <option value="">{loadingProviders ? 'Loading providers...' : 'No preference'}</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.name} ({provider.specialties.join(', ')})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="careType" className="block text-sm font-medium text-gray-700">Care Type</label>
              <input
                type="text"
                id="careType"
                value={careType}
                onChange={(e) => setCareType(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="supportType" className="block text-sm font-medium text-gray-700">Support Type</label>
              <select
                id="supportType"
                value={supportType}
                onChange={(e) => setSupportType(e.target.value as 'daytime' | 'overnight' | '24_7')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="daytime">Daytime</option>
                <option value="overnight">Overnight</option>
                <option value="24_7">24/7</option>
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="hoursPerDay" className="block text-sm font-medium text-gray-700">Hours Per Day</label>
              <input
                type="number"
                id="hoursPerDay"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                min="1"
                max="24"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex items-center col-span-2">
              <input
                id="requiresConsistency"
                type="checkbox"
                checked={requiresConsistency}
                onChange={(e) => setRequiresConsistency(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresConsistency" className="ml-2 block text-sm text-gray-900">Requires Consistent Provider</label>
            </div>
          </div>

          {showProviderSuggestions && (
            <ProviderSuggestionsList
              careRequestMatches={careRequestMatches}
              onAssign={handleAssignProvider}
              assignedProviderId={assignedProviderId}
            />
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Care Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
