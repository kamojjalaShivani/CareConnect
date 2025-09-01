import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Filter, Grid, List } from 'lucide-react';
import { Provider, Assignment } from '../../types';
import { format, parseISO, isSameDay, addDays } from 'date-fns';
import { BackendApiService } from '../../services/backendApi';

interface ProvidersTableProps {
  providers: Provider[];
  assignments: Assignment[];
  onEdit: (provider: Provider) => void;
  onDelete: (id: string) => void;
}

export default function ProvidersTable({ providers, assignments, onEdit, onDelete }: ProvidersTableProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [dailyShifts, setDailyShifts] = useState<{ [date: string]: Assignment[] }>({});
  const [weeklyWorkload, setWeeklyWorkload] = useState<number>(0);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const assignmentsData = await BackendApiService.getAssignments();
        setAllAssignments(assignmentsData);
      } catch (error) {
        console.error("Error loading assignments data:", error);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    const calculateDailyShifts = () => {
      const shifts: { [date: string]: Assignment[] } = {};
      allAssignments.forEach((assignment) => {
        if (assignment.scheduled_date) {
          const date = format(parseISO(assignment.scheduled_date), 'yyyy-MM-dd');
          if (!shifts[date]) {
            shifts[date] = [];
          }
          shifts[date].push(assignment);
        }
      });
      setDailyShifts(shifts);
    };

    const calculateWeeklyWorkload = () => {
      const workload = allAssignments.reduce(
        (sum, assignment) => sum + (assignment.hours_worked || 0),
        0
      );
      setWeeklyWorkload(workload);
    };

    calculateDailyShifts();
    calculateWeeklyWorkload();
  }, [allAssignments]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Care Providers</h3>
            <p className="text-sm text-gray-600">Manage your care provider network</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'} transition-colors`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'} transition-colors border-l border-gray-300`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 text-sm text-gray-600">
          {providers.length} active providers
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-1">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <Filter className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <Filter className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center space-x-1">
                    <span>Rating</span>
                    <Filter className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center space-x-1">
                    <span>Specialties</span>
                    <Filter className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center space-x-1">
                    <span>Daily Shifts</span>
                    <Filter className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center space-x-1">
                    <span>Weekly Workload</span>
                    <Filter className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {providers.map((provider) => {
                const providerAssignments = allAssignments.filter(
                  (assignment) => assignment.providerId === provider.id
                );

                return (
                  <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-1">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-gray-700">
                            {provider.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                          <div className="text-xs text-gray-500">{provider.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        provider.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {provider.status === 'active' ? '✓' : '○'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {provider.rating.toFixed(1)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {provider.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        {Object.keys(dailyShifts).length > 0 ? (
                          Object.keys(dailyShifts).sort().map((date) => (
                            <div key={date} className="text-xs">
                              <strong>{format(parseISO(date), 'MMM d')}:</strong>{' '}
                              {dailyShifts[date].map(shift => `${shift.shift_start}-${shift.shift_end}`).join(', ')}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No shifts scheduled</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {weeklyWorkload} hours
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEdit(provider)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(provider.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">
            1 to {providers.length} of {providers.length}
          </span>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed">
              ‹
            </button>
            <span className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded">
              Page 1 of 1
            </span>
            <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed">
              ›
            </button>
            <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed">
              ››
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
