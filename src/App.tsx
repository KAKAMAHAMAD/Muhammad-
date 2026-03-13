/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useStore } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Customers } from './components/Customers';
import { POS } from './components/POS';
import { History } from './components/History';
import { Calculator } from './components/Calculator';
import { Settings } from './components/Settings';
import { Login } from './components/Login';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'customers' | 'pos' | 'history' | 'calculator' | 'settings'>('dashboard');
  const { user, isAuthReady } = useStore();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'inventory' && <Inventory />}
      {activeTab === 'customers' && <Customers />}
      {activeTab === 'pos' && <POS />}
      {activeTab === 'history' && <History />}
      {activeTab === 'calculator' && <Calculator />}
      {activeTab === 'settings' && <Settings />}
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

