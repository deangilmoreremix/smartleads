import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const NewCampaignPage = lazy(() => import('./pages/NewCampaignPage'));
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const CreateTemplatePage = lazy(() => import('./pages/CreateTemplatePage'));
const AccountsPage = lazy(() => import('./pages/AccountsPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const UnipileCallbackPage = lazy(() => import('./pages/UnipileCallbackPage'));
const AgentProgressPage = lazy(() => import('./pages/AgentProgressPage'));
const IntentSignalsPage = lazy(() => import('./pages/IntentSignalsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AffiliatePage = lazy(() => import('./pages/AffiliatePage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const LeadFinderPage = lazy(() => import('./pages/LeadFinderPage'));
const AIEmailsPage = lazy(() => import('./pages/AIEmailsPage'));
const AutomationPage = lazy(() => import('./pages/AutomationPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminSubscriptionsPage = lazy(() => import('./pages/AdminSubscriptionsPage'));
const AdminFeatureFlagsPage = lazy(() => import('./pages/AdminFeatureFlagsPage'));
const AdminAuditLogsPage = lazy(() => import('./pages/AdminAuditLogsPage'));
const AdminSystemHealthPage = lazy(() => import('./pages/AdminSystemHealthPage'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AutopilotDashboard = lazy(() => import('./pages/AutopilotDashboard'));
const UnifiedInboxPage = lazy(() => import('./pages/UnifiedInboxPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" />
    </div>
  );
}

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
          <Suspense fallback={<PageLoader />}>
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
                path="/dashboard/inbox"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <UnifiedInboxPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/inbox/:conversationId"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <UnifiedInboxPage />
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
                path="/dashboard/autopilot"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AutopilotDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="features" element={<AdminFeatureFlagsPage />} />
                <Route path="audit" element={<AdminAuditLogsPage />} />
                <Route path="health" element={<AdminSystemHealthPage />} />
              </Route>

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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
