import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Overview from './components/Dashboard/Overview';
import ProvidersView from './components/Providers/ProvidersView';
import FamiliesView from './components/Families/FamiliesView';
import AppointmentsView from './components/Appointments/AppointmentsView';
import LoginForm from './components/Auth/LoginForm';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openNewRequestModal, setOpenNewRequestModal] = useState(false);
  const [openNewProviderModal, setOpenNewProviderModal] = useState(false);
  const [openNewFamilyModal, setOpenNewFamilyModal] = useState(false);

  const handleNavigate = (tab: string, action?: 'newRequest' | 'newProvider' | 'newFamily') => {
    setActiveTab(tab);
    if (action === 'newRequest') {
      setOpenNewRequestModal(true);
    } else {
      setOpenNewRequestModal(false);
    }
    if (action === 'newProvider') {
      setOpenNewProviderModal(true);
    } else {
      setOpenNewProviderModal(false);
    }
    if (action === 'newFamily') {
      setOpenNewFamilyModal(true);
    } else {
      setOpenNewFamilyModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Overview onNavigate={handleNavigate} />;
      case 'providers':
        return <ProvidersView openNewProviderModal={openNewProviderModal} />;
      case 'families':
        return <FamiliesView openNewFamilyModal={openNewFamilyModal} />;
      case 'appointments':
        return <AppointmentsView openNewRequestModal={openNewRequestModal} />;
      default:
        return <Overview onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
