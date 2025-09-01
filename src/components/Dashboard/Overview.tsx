import React, { useEffect, useState } from 'react';
import { Calendar, Users, Heart, AlertTriangle, PlusCircle } from 'lucide-react';
import StatCard from './StatCard';
import { ApiService } from '../../services/api';
import { DashboardStats, RecentCareRequestActivity } from '../../types';
import { format } from 'date-fns';

interface OverviewProps {
  onNavigate: (tab: string, action?: 'newRequest' | 'newProvider' | 'newFamily') => void;
}

export default function Overview({ onNavigate }: OverviewProps) {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    activeProviders: 0,
    activeFamilies: 0,
    pendingRequests: 0,
    todayAssignments: 0
  });
  const [recentCareRequests, setRecentCareRequests] = useState<RecentCareRequestActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeActivityTab, setActiveActivityTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardStats, recentRequests] = await Promise.all([
          ApiService.getDashboardStats(),
          ApiService.getRecentCareRequests()
        ]);
        setStats(dashboardStats);
        setRecentCareRequests(recentRequests);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Set up real-time updates
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Welcome to your Dashboard</h1>
          <p className="text-gray-600">{currentDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingAppointments}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Providers"
          value={stats.activeProviders}
          icon={<Users className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Active Families"
          value={stats.activeFamilies}
          icon={<Heart className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeActivityTab === 'overview'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveActivityTab('overview')}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveActivityTab('appointments')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeActivityTab === 'appointments'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => setActiveActivityTab('urgent')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeActivityTab === 'urgent'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Urgent Care
                </button>
              </div>
            </div>
            
            {activeActivityTab === 'overview' && (
              <div>
                {recentCareRequests.length > 0 ? (
                  <ul className="space-y-4">
                    {recentCareRequests.map((req) => (
                      <li key={req.id} className="flex items-center space-x-4">
                        <div className="bg-blue-50 p-2 rounded-full">
                          <PlusCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            New care request for <span className="font-semibold">{req.family?.name}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(req.createdAt), 'MMM d, yyyy, h:mm a')}
                          </p>
                        </div>
                        <div className="ml-auto text-sm text-gray-600 capitalize">{req.status}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity to display</p>
                  </div>
                )}
              </div>
            )}
            
            {activeActivityTab === 'appointments' && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent appointments to display</p>
              </div>
            )}
            
            {activeActivityTab === 'urgent' && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No urgent care requests to display</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('appointments', 'newRequest')}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-blue-900">Create Care Request</div>
                <div className="text-xs text-blue-700">Schedule new care appointment</div>
              </button>
              <button
                onClick={() => onNavigate('providers', 'newProvider')}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">Add Provider</div>
                <div className="text-xs text-gray-700">Register new care provider</div>
              </button>
              <button
                onClick={() => onNavigate('families', 'newFamily')}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">Register Family</div>
                <div className="text-xs text-gray-700">Add new family to system</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
