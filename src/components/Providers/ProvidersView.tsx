// import React, { useState, useEffect } from 'react';
// import { Plus } from 'lucide-react';
// import ProvidersTable from './ProvidersTable';
// import ProviderModal from './ProviderModal';
// import { Provider, Assignment } from '../../types';
// import { BackendApiService } from '../../services/backendApi';

// interface ProvidersViewProps {
//   openNewProviderModal?: boolean;
// }

// export default function ProvidersView({ openNewProviderModal }: ProvidersViewProps) {
//   const [providers, setProviders] = useState<Provider[]>([]);
//   const [assignments, setAssignments] = useState<Assignment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

//   useEffect(() => {
//     loadProviders();
//   }, []);

//   useEffect(() => {
//     if (openNewProviderModal) {
//       openCreateModal();
//     }
//   }, [openNewProviderModal]);

//   const loadProviders = async () => {
//     try {
//       setLoading(true);
//       const providersData = await BackendApiService.getProviders();
//       setProviders(providersData);
//       const assignmentsData = await BackendApiService.getAssignments();
//       setAssignments(assignmentsData);
//     } catch (error) {
//       console.error('Error loading providers or assignments:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
//     try {
//       await BackendApiService.createProvider(providerData);
//       loadProviders();
//     } catch (error) {
//       console.error('Error creating provider:', error);
//     }
//   };

//   const handleEditProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
//     if (!selectedProvider) return;
    
//     try {
//       await BackendApiService.updateProvider(selectedProvider.id, providerData);
//       loadProviders();
//     } catch (error) {
//       console.error('Error updating provider:', error);
//     }
//   };

//   const handleDeleteProvider = async (id: string) => {
//     if (window.confirm('Are you sure you want to delete this provider?')) {
//       try {
//         await BackendApiService.deleteProvider(id);
//         loadProviders();
//       } catch (error) {
//         console.error('Error deleting provider:', error);
//       }
//     }
//   };

//   const openCreateModal = () => {
//     setSelectedProvider(null);
//     setModalOpen(true);
//   };

//   const openEditModal = (provider: Provider) => {
//     setSelectedProvider(provider);
//     setModalOpen(true);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Care Providers</h1>
//           <p className="text-gray-600">Manage your care provider network</p>
//         </div>
//         <button
//           onClick={openCreateModal}
//           className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="w-4 h-4" />
//           <span>Add Provider</span>
//         </button>
//       </div>

//       <ProvidersTable
//         providers={providers}
//         assignments={assignments}
//         onEdit={openEditModal}
//         onDelete={handleDeleteProvider}
//       />

//       <ProviderModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         onSave={selectedProvider ? handleEditProvider : handleCreateProvider}
//         provider={selectedProvider}
//         title={selectedProvider ? 'Edit Provider' : 'Add New Provider'}
//       />
//     </div>
//   );
// }

import  { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProvidersTable from './ProvidersTable';
import ProviderModal from './ProviderModal';
import { Provider, Assignment } from '../../types';
import { BackendApiService } from '../../services/backendApi';

interface ProvidersViewProps {
  openNewProviderModal?: boolean;
}

export default function ProvidersView({ openNewProviderModal }: ProvidersViewProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (openNewProviderModal) {
      openCreateModal();
    }
  }, [openNewProviderModal]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const providersData = await BackendApiService.getProviders();
      setProviders(providersData);
      const assignmentsData = await BackendApiService.getAssignments();
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading providers or assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create Provider with all fields
  const handleCreateProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const payload = {
        ...providerData,
        specialties: providerData.specialties || [],
        availability: providerData.availability || [],
        maxDailyHours: providerData.maxDailyHours || 8,
        maxWeeklyHours: providerData.maxWeeklyHours || 40,
        minWeeklyHours: providerData.minWeeklyHours || 20,
        travelRadius: providerData.travelRadius || 10,
        preferences: providerData.preferences || {},
        status: providerData.status || 'active',
      };
      await BackendApiService.createProvider(payload);
      loadProviders();
    } catch (error) {
      console.error('Error creating provider:', error);
    }
  };

  // Edit Provider with all fields
  const handleEditProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedProvider) return;
    try {
      const payload = {
        ...providerData,
        specialties: providerData.specialties || [],
        availability: providerData.availability || [],
        maxDailyHours: providerData.maxDailyHours || 8,
        maxWeeklyHours: providerData.maxWeeklyHours || 40,
        minWeeklyHours: providerData.minWeeklyHours || 20,
        travelRadius: providerData.travelRadius || 10,
        preferences: providerData.preferences || {},
        status: providerData.status || 'active',
      };
      await BackendApiService.updateProvider(selectedProvider.id, payload);
      loadProviders();
    } catch (error) {
      console.error('Error updating provider:', error);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      try {
        await BackendApiService.deleteProvider(id);
        loadProviders();
      } catch (error) {
        console.error('Error deleting provider:', error);
      }
    }
  };

  const openCreateModal = () => {
    setSelectedProvider(null);
    setModalOpen(true);
  };

  const openEditModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setModalOpen(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Care Providers</h1>
          <p className="text-gray-600">Manage your care provider network</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Provider</span>
        </button>
      </div>

      <ProvidersTable
        providers={providers}
        assignments={assignments}
        onEdit={openEditModal}
        onDelete={handleDeleteProvider}
      />

      <ProviderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={selectedProvider ? handleEditProvider : handleCreateProvider}
        provider={selectedProvider}
        title={selectedProvider ? 'Edit Provider' : 'Add New Provider'}
      />
    </div>
  );
}

