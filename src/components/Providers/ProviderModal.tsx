// import React, { useState, useEffect } from 'react';
// import { X } from 'lucide-react';
// import { Provider, AvailabilitySlot, TimeOffSlot } from '../../types';

// interface ProviderModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => void;
//   provider?: Provider | null;
//   title: string;
// }

// export default function ProviderModal({ isOpen, onClose, onSave, provider, title }: ProviderModalProps) {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     location: '',
//     specialties: [] as string[],
//     status: 'active' as 'active' | 'inactive',
//     rating: 5.0,
//     maxWeeklyHours: 40,
//     minWeeklyHours: 20,
//     availability: [] as AvailabilitySlot[],
//     timeOffs: [] as TimeOffSlot[],
//     preferences: {
//       travelRadius: 25,
//       support24_7: false,
//       maxWeeklyHours24_7: 80,
//       preferredFamilyTypes: [] as string[],
//     }
//   });

//   useEffect(() => {
//     if (provider) {
//       setFormData({
//         name: provider.name,
//         email: provider.email,
//         phone: provider.phone,
//         location: provider.location,
//         specialties: provider.specialties,
//         status: provider.status,
//         rating: provider.rating,
//         maxWeeklyHours: provider.maxWeeklyHours,
//         minWeeklyHours: provider.minWeeklyHours,
//         availability: provider.availability || [],
//         timeOffs: provider.timeOffs || [],
//         preferences: provider.preferences || { travelRadius: 25, support24_7: false, maxWeeklyHours24_7: 80, preferredFamilyTypes: [] }
//       });
//     } else {
//       setFormData({
//         name: '',
//         email: '',
//         phone: '',
//         location: '',
//         specialties: [],
//         status: 'active',
//         rating: 5.0,
//         maxWeeklyHours: 40,
//         minWeeklyHours: 20,
//         availability: [],
//         timeOffs: [],
//         preferences: {
//           travelRadius: 25,
//           support24_7: false,
//           maxWeeklyHours24_7: 80,
//           preferredFamilyTypes: [],
//         }
//       });
//     }
//   }, [provider]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave(formData);
//     onClose();
//   };

//   const handleSpecialtyToggle = (specialty: string) => {
//     setFormData(prev => ({
//       ...prev,
//       specialties: prev.specialties.includes(specialty)
//         ? prev.specialties.filter(s => s !== specialty)
//         : [...prev.specialties, specialty]
//     }));
//   };

//   if (!isOpen) return null;

//   const availableSpecialties = ['doula', 'lactation', 'nurse', 'newborn'];

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between p-6 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Full Name
//               </label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Phone
//               </label>
//               <input
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Location
//               </label>
//               <input
//                 type="text"
//                 value={formData.location}
//                 onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="City, State"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Specialties
//             </label>
//             <div className="flex flex-wrap gap-2">
//               {availableSpecialties.map(specialty => (
//                 <button
//                   key={specialty}
//                   type="button"
//                   onClick={() => handleSpecialtyToggle(specialty)}
//                   className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     formData.specialties.includes(specialty)
//                       ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
//                       : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
//                   }`}
//                 >
//                   {specialty}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Max Weekly Hours
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 max="168" // 24 * 7
//                 value={formData.maxWeeklyHours}
//                 onChange={(e) => setFormData(prev => ({ ...prev, maxWeeklyHours: parseInt(e.target.value) }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Min Weekly Hours
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 max="168"
//                 value={formData.minWeeklyHours}
//                 onChange={(e) => setFormData(prev => ({ ...prev, minWeeklyHours: parseInt(e.target.value) }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Travel Radius (miles)
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 max="100"
//                 value={formData.preferences.travelRadius}
//                 onChange={(e) => setFormData(prev => ({
//                   ...prev,
//                   preferences: {
//                     ...prev.preferences,
//                     travelRadius: parseInt(e.target.value)
//                   }
//                 }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Status
//               </label>
//               <select
//                 value={formData.status}
//                 onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               {provider ? 'Update' : 'Create'} Provider
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Provider, AvailabilitySlot, TimeOffSlot, User } from '../../types';
import { BackendApiService } from '../../services/backendApi';

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => void;
  provider?: Provider | null;
  title: string;
}

export default function ProviderModal({ isOpen, onClose, onSave, provider, title }: ProviderModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    email: '',
    phone: '',
    location: '',
    specialties: [] as string[],
    status: 'active' as 'active' | 'inactive',
    rating: 5.0,
    maxWeeklyHours: 40,
    minWeeklyHours: 20,
    maxDailyHours: 8, // Default value
    travelRadius: 25, // Default value
    availability: [] as AvailabilitySlot[],
    timeOffs: [] as TimeOffSlot[],
    preferences: {
      travelRadius: 25,
      support24_7: false,
      maxWeeklyHours24_7: 80,
      preferredFamilyTypes: [] as string[],
    }
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        user_id: provider.user_id?.toString() || '',
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        location: provider.location,
        specialties: provider.specialties,
        status: provider.status,
        rating: provider.rating,
        maxWeeklyHours: provider.maxWeeklyHours,
        minWeeklyHours: provider.minWeeklyHours,
        maxDailyHours: provider.maxDailyHours,
        travelRadius: provider.travelRadius,
        availability: provider.availability || [],
        timeOffs: provider.timeOffs || [],
        preferences: {
          travelRadius: provider.preferences?.travelRadius ?? 25,
          support24_7: provider.preferences?.support24_7 ?? false,
          maxWeeklyHours24_7: provider.preferences?.maxWeeklyHours24_7 ?? 80,
          preferredFamilyTypes: provider.preferences?.preferredFamilyTypes ?? [],
        }
      });
    } else {
      setFormData({
        user_id: '',
        name: '',
        email: '',
        phone: '',
        location: '',
        specialties: [],
        status: 'active',
        rating: 5.0,
        maxWeeklyHours: 40,
        minWeeklyHours: 20,
        maxDailyHours: 8,
        travelRadius: 25,
        availability: [],
        timeOffs: [],
        preferences: {
          travelRadius: 25,
          support24_7: false,
          maxWeeklyHours24_7: 80,
          preferredFamilyTypes: [],
        }
      });
    }
  }, [provider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      user_id: formData.user_id ? parseInt(formData.user_id) : undefined
    };
    onSave(submitData);
    onClose();
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleAvailabilityAdd = () => {
    setFormData(prev => ({
      ...prev,
      availability: [
        ...prev.availability,
        { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', shiftType: 'daytime' }
      ]
    }));
  };

  const handleTimeOffAdd = () => {
    setFormData(prev => ({
      ...prev,
      timeOffs: [
        ...prev.timeOffs,
        { startDate: '', endDate: '', reason: '' }
      ]
    }));
  };

  const handleAvailabilityDelete = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const handleTimeOffDelete = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeOffs: prev.timeOffs.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  const availableSpecialties = ['doula', 'lactation', 'nurse', 'newborn'];
  const shiftTypes = ['daytime', 'overnight', '24_7'] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* --- Basic Info --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
          </div>

          {/* --- Specialties --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
            <div className="flex flex-wrap gap-2">
              {availableSpecialties.map(s => (
                <button key={s} type="button" onClick={() => handleSpecialtyToggle(s)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${formData.specialties.includes(s) ? 'bg-blue-100 text-blue-800 border' : 'bg-gray-100 text-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* --- Weekly Hours --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Weekly Hours</label>
              <input type="number" min="1" max="168" value={formData.maxWeeklyHours} onChange={(e) => setFormData(prev => ({ ...prev, maxWeeklyHours: +e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Weekly Hours</label>
              <input type="number" min="0" max="168" value={formData.minWeeklyHours} onChange={(e) => setFormData(prev => ({ ...prev, minWeeklyHours: +e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData(prev => ({ ...prev, rating: +e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          {/* --- Preferences --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Radius (miles)</label>
              <input type="number" min="1" max="100" value={formData.travelRadius} onChange={(e) => setFormData(prev => ({ ...prev, travelRadius: +e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.preferences.support24_7} onChange={(e) => setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, support24_7: e.target.checked } }))} />
                Support 24/7
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Weekly Hours (24/7)</label>
              <input type="number" min="1" max="168" value={formData.preferences.maxWeeklyHours24_7} onChange={(e) => setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, maxWeeklyHours24_7: +e.target.value } }))} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          {/* --- Availability --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <button type="button" onClick={handleAvailabilityAdd} className="mb-2 px-3 py-1 text-sm bg-blue-100 rounded">+ Add Slot</button>
            {formData.availability.map((slot, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 mb-2 items-center">
                <select value={slot.dayOfWeek} onChange={(e) => {
                  const newAvail = [...formData.availability];
                  newAvail[idx].dayOfWeek = +e.target.value;
                  setFormData(prev => ({ ...prev, availability: newAvail }));
                }} className="px-2 py-1 border rounded-lg">
                  {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}</option>)}
                </select>
                <input type="time" value={slot.startTime} onChange={(e) => {
                  const newAvail = [...formData.availability];
                  newAvail[idx].startTime = e.target.value;
                  setFormData(prev => ({ ...prev, availability: newAvail }));
                }} className="px-2 py-1 border rounded-lg" />
                <input type="time" value={slot.endTime} onChange={(e) => {
                  const newAvail = [...formData.availability];
                  newAvail[idx].endTime = e.target.value;
                  setFormData(prev => ({ ...prev, availability: newAvail }));
                }} className="px-2 py-1 border rounded-lg" />
                <select value={slot.shiftType} onChange={(e) => {
                  const newAvail = [...formData.availability];
                  newAvail[idx].shiftType = e.target.value as 'daytime'|'overnight'|'24_7';
                  setFormData(prev => ({ ...prev, availability: newAvail }));
                }} className="px-2 py-1 border rounded-lg">
                  {shiftTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button type="button" onClick={() => handleAvailabilityDelete(idx)} className="text-red-500 hover:text-red-700">
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* --- Time Offs --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Offs</label>
            <button type="button" onClick={handleTimeOffAdd} className="mb-2 px-3 py-1 text-sm bg-blue-100 rounded">+ Add Time Off</button>
            {formData.timeOffs.map((slot, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 mb-2 items-center">
                <input type="date" value={slot.startDate} onChange={(e) => {
                  const newTO = [...formData.timeOffs];
                  newTO[idx].startDate = e.target.value;
                  setFormData(prev => ({ ...prev, timeOffs: newTO }));
                }} className="px-2 py-1 border rounded-lg" />
                <input type="date" value={slot.endDate} onChange={(e) => {
                  const newTO = [...formData.timeOffs];
                  newTO[idx].endDate = e.target.value;
                  setFormData(prev => ({ ...prev, timeOffs: newTO }));
                }} className="px-2 py-1 border rounded-lg" />
                <input type="text" placeholder="Reason" value={slot.reason} onChange={(e) => {
                  const newTO = [...formData.timeOffs];
                  newTO[idx].reason = e.target.value;
                  setFormData(prev => ({ ...prev, timeOffs: newTO }));
                }} className="px-2 py-1 border rounded-lg" />
                <button type="button" onClick={() => handleTimeOffDelete(idx)} className="text-red-500 hover:text-red-700">
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* --- Status --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active'|'inactive' }))} className="w-full px-3 py-2 border rounded-lg">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* --- Footer --- */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">{provider ? 'Update' : 'Create'} Provider</button>
          </div>
        </form>
      </div>
    </div>
  );
}
