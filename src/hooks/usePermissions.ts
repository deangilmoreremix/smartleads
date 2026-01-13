import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserRole {
  role_id: string;
  role_name: string;
  role_level: number;
  granted_at: string;
}

export function usePermissions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadPermissions();
    } else {
      setLoading(false);
      setIsAdmin(false);
      setRoles([]);
      setPermissions(new Set());
    }
  }, [user]);

  const loadPermissions = async () => {
    try {
      const profileResult = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user!.id)
        .maybeSingle();

      if (profileResult.data?.is_admin) {
        setIsAdmin(true);
        setPermissions(new Set(['*']));
        setLoading(false);
        return;
      }

      setIsAdmin(false);

      const { data: userRoles } = await supabase.rpc('get_user_roles', {
        p_user_id: user!.id,
      });

      if (userRoles) {
        setRoles(userRoles);
      }

      const { data: roleIds } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user!.id);

      if (roleIds && roleIds.length > 0) {
        const { data: rolePerms } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .in(
            'role_id',
            roleIds.map((r) => r.role_id)
          );

        if (rolePerms) {
          const permIds = rolePerms.map((rp) => rp.permission_id);

          const { data: perms } = await supabase
            .from('permissions')
            .select('name')
            .in('id', permIds);

          if (perms) {
            setPermissions(new Set(perms.map((p) => p.name)));
          }
        }
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permissionName: string): boolean => {
    if (isAdmin) return true;
    return permissions.has(permissionName);
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (isAdmin) return true;
    return permissionNames.some((p) => permissions.has(p));
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (isAdmin) return true;
    return permissionNames.every((p) => permissions.has(p));
  };

  const hasRole = (roleName: string): boolean => {
    if (isAdmin) return true;
    return roles.some((r) => r.role_name === roleName);
  };

  const getHighestRole = (): UserRole | null => {
    if (roles.length === 0) return null;
    return roles.reduce((highest, current) =>
      current.role_level > highest.role_level ? current : highest
    );
  };

  return {
    loading,
    isAdmin,
    roles,
    permissions: Array.from(permissions),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getHighestRole,
    refetch: loadPermissions,
  };
}
