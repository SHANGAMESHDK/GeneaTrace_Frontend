import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ManufacturingLineagePage } from './pages/ManufacturingLineagePage';
import { ComponentRegistryPage } from './pages/ComponentRegistryPage';
import { BatchManagementPage } from './pages/BatchManagementPage';
import { AssemblyTrackingPage } from './pages/AssemblyTrackingPage';
import { PassportPage } from './pages/PassportPage';
import { TraceabilityPage } from './pages/TraceabilityPage';
import { RecallManagementPage } from './pages/RecallManagementPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { DeviceSecurityPage } from './pages/DeviceSecurityPage';
import { BlockchainAuditPage } from './pages/BlockchainAuditPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShopkeeperPortalPage } from './pages/ShopkeeperPortalPage';
import { CompanyDefectHubPage } from './pages/CompanyDefectHubPage';
import { LoginPage } from './pages/LoginPage';
import { MobileScannerPage } from './pages/MobileScannerPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/scanner',
    element: <MobileScannerPage />,
  },
  {
    path: '/mobile',
    element: <MobileScannerPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'lineage',
        element: <ManufacturingLineagePage />,
      },
      {
        path: 'components',
        element: <ComponentRegistryPage />,
      },
      {
        path: 'batches',
        element: <BatchManagementPage />,
      },
      {
        path: 'assembly',
        element: <AssemblyTrackingPage />,
      },
      {
        path: 'passport/:productId?',
        element: <PassportPage />,
      },
      {
        path: 'traceability',
        element: <TraceabilityPage />,
      },
      {
        path: 'recalls',
        element: <RecallManagementPage />,
      },
      {
        path: 'shop-portal',
        element: <ShopkeeperPortalPage />,
      },
      {
        path: 'company-defects',
        element: <CompanyDefectHubPage />,
      },
      {
        path: 'logistics',
        element: <LogisticsPage />,
      },
      {
        path: 'security',
        element: <DeviceSecurityPage />,
      },
      {
        path: 'audit',
        element: <BlockchainAuditPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
