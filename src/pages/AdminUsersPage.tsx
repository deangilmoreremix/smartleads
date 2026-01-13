import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import {
  Users,
  Search,
  Filter,
  Shield,
  Crown,
  Edit,
  ChevronDown,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { Database } from '../types/database';
import { rbacService, Role } from '../services/rbac-service';
import toast from 'react-hot-toast';
import PermissionGuard from '../components/PermissionGuard';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface UserWithDetails extends Profile {
  subscription?: Subscription;
  roles?: string[];
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { isAdmin, hasPermission } = usePermissions();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (isAdmin || hasPermission('view_users')) {
      loadUsers();
      loadRoles();
    }
  }, [isAdmin, hasPermission]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterPlan, filterRole]);

  const loadRoles = async () => {
    try {
      const roles = await rbacService.getAllRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      if (profiles) {
        const usersWithDetails = await Promise.all(
          profiles.map(async (profile) => {
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', profile.id)
              .maybeSingle();

            const { data: userRoles } = await supabase.rpc('get_user_roles', {
              p_user_id: profile.id,
            });

            return {
              ...profile,
              subscription: subscription || undefined,
              roles: userRoles?.map((r: { role_name: string }) => r.role_name) || [],
            };
          })
        );

        setUsers(usersWithDetails);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(query) ||
          u.full_name?.toLowerCase().includes(query) ||
          u.company_name?.toLowerCase().includes(query)
      );
    }

    if (filterPlan !== 'all') {
      filtered = filtered.filter((u) => u.subscription?.plan_type === filterPlan);
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter((u) => u.roles?.includes(filterRole));
    }

    setFilteredUsers(filtered);
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      await rbacService.setAdminStatus(userId, !currentStatus, currentUser!.id);
      toast.success(`Admin status ${!currentStatus ? 'granted' : 'revoked'}`);
      loadUsers();
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ plan_type: newPlan })
        .eq('user_id', userId);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: currentUser!.id,
        target_user_id: userId,
        action: 'update_plan',
        resource: 'subscriptions',
        new_value: { plan_type: newPlan },
      });

      toast.success('Plan updated successfully');
      loadUsers();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

  const handleGrantRole = async (userId: string, roleName: string) => {
    try {
      await rbacService.grantRole(userId, roleName, currentUser!.id);
      toast.success(`Role ${roleName} granted`);
      loadUsers();
    } catch (error) {
      console.error('Error granting role:', error);
      toast.error('Failed to grant role');
    }
  };

  const handleRevokeRole = async (userId: string, roleName: string) => {
    try {
      await rbacService.revokeRole(userId, roleName, currentUser!.id);
      toast.success(`Role ${roleName} revoked`);
      loadUsers();
    } catch (error) {
      console.error('Error revoking role:', error);
      toast.error('Failed to revoke role');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !hasPermission('view_users')) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-slate-400">Manage users, roles, and permissions</p>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Users className="w-5 h-5" />
            <span className="font-medium">{filteredUsers.length} users</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or company..."
              className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-600 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="all">All Roles</option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                  User
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                  Plan
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                  Roles
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                  Joined
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.full_name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-white">
                            {user.full_name || 'No name'}
                          </div>
                          {user.is_admin && (
                            <Crown className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <div className="text-sm text-slate-400">{user.email}</div>
                        {user.company_name && (
                          <div className="text-xs text-slate-500">
                            {user.company_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium capitalize">
                      {user.subscription?.plan_type || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.subscription?.status === 'active' ? (
                      <div className="flex items-center space-x-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-slate-400">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">Inactive</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <PermissionGuard permission="manage_roles">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                          className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                          title="Manage Roles"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="manage_users">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </PermissionGuard>
                      {isAdmin && user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                          className={`p-2 rounded-lg transition ${
                            user.is_admin
                              ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                          }`}
                          title={user.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  disabled
                  className="w-full bg-slate-700/50 text-slate-400 border border-slate-600 rounded-lg px-4 py-2 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subscription Plan
                </label>
                <select
                  defaultValue={selectedUser.subscription?.plan_type || 'free'}
                  onChange={(e) =>
                    handleUpdatePlan(selectedUser.id, e.target.value)
                  }
                  className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Manage Roles</h3>
            <p className="text-slate-400 text-sm mb-4">
              {selectedUser.email}
            </p>
            <div className="space-y-2 mb-6">
              {availableRoles.map((role) => {
                const hasRole = selectedUser.roles?.includes(role.name);
                return (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-white capitalize">
                        {role.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        {role.description}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        hasRole
                          ? handleRevokeRole(selectedUser.id, role.name)
                          : handleGrantRole(selectedUser.id, role.name)
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        hasRole
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {hasRole ? 'Revoke' : 'Grant'}
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowRoleModal(false)}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
