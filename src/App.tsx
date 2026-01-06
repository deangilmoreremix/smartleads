import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import CampaignsPage from './pages/CampaignsPage';
import NewCampaignPage from './pages/NewCampaignPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import LeadsPage from './pages/LeadsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import TemplatesPage from './pages/TemplatesPage';
import CreateTemplatePage from './pages/CreateTemplatePage';
import AccountsPage from './pages/AccountsPage';
import PlansPage from './pages/PlansPage';
import UnipileCallbackPage from './pages/UnipileCallbackPage';
import AgentProgressPage from './pages/AgentProgressPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/campaigns"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CampaignsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/campaigns/new"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <NewCampaignPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/campaigns/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CampaignDetailPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/leads"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <LeadsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AnalyticsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/templates"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <TemplatesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/templates/new"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CreateTemplatePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/accounts"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AccountsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/plans"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PlansPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/auth/callback/unipile"
              element={
                <ProtectedRoute>
                  <UnipileCallbackPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent/progress/:jobId"
              element={
                <ProtectedRoute>
                  <AgentProgressPage />
                </ProtectedRoute>
              }
            />

            <Route path="/pricing" element={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Pricing page coming soon</div>} />
            <Route path="/affiliate" element={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Affiliate page coming soon</div>} />
            <Route path="/privacy" element={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Privacy policy coming soon</div>} />
            <Route path="/terms" element={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Terms of service coming soon</div>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
