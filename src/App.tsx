import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import EnhancedLandingPage from './pages/EnhancedLandingPage';
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
import IntentSignalsPage from './pages/IntentSignalsPage';
import PricingPage from './pages/PricingPage';
import AffiliatePage from './pages/AffiliatePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LeadFinderPage from './pages/LeadFinderPage';
import AIEmailsPage from './pages/AIEmailsPage';
import AutomationPage from './pages/AutomationPage';

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
              path="/dashboard/signals"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <IntentSignalsPage />
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

            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/affiliate" element={<AffiliatePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            <Route path="/features/lead-finder" element={<LeadFinderPage />} />
            <Route path="/features/ai-emails" element={<AIEmailsPage />} />
            <Route path="/features/automation" element={<AutomationPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
