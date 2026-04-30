/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import ContentManagement from './pages/ContentManagement';
import ClientsManagement from './pages/ClientsManagement';
import OrdersManagement from './pages/OrdersManagement';
import SettingsPage from './pages/SettingsPage';
import ProjectRequestForm from './pages/ProjectRequestForm';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LoginPage from './pages/LoginPage';
import ServicesManagement from './pages/ServicesManagement';
import PortfolioManagement from './pages/PortfolioManagement';
import DynamicPage from './pages/DynamicPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/request" element={<ProjectRequestForm />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/p/:slug" element={<DynamicPage />} />

        {/* Dashboard Routes (Protected) */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <DashboardLayout>
              <ContentManagement />
            </DashboardLayout>
          </AuthGuard>
        } />
        <Route path="/dashboard/portfolio" element={
          <AuthGuard>
            <DashboardLayout>
              <PortfolioManagement />
            </DashboardLayout>
          </AuthGuard>
        } />
        <Route path="/dashboard/content" element={
          <AuthGuard>
            <DashboardLayout>
              <ContentManagement />
            </DashboardLayout>
          </AuthGuard>
        } />
        <Route path="/dashboard/clients" element={
          <AuthGuard>
            <DashboardLayout>
              <ClientsManagement />
            </DashboardLayout>
          </AuthGuard>
        } />
        <Route path="/dashboard/orders" element={
          <AuthGuard>
            <DashboardLayout>
              <OrdersManagement />
            </DashboardLayout>
          </AuthGuard>
        } />
        <Route path="/dashboard/services" element={
          <AuthGuard>
            <DashboardLayout>
              <ServicesManagement />
            </DashboardLayout>
          </AuthGuard>
        } />
        <Route path="/dashboard/settings" element={
          <AuthGuard>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </AuthGuard>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}


