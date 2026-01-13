import { supabase } from '../lib/supabase';

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  granted_by: string | null;
  granted_at: string;
  role?: Role;
}

export interface FeatureFlag {
  id: string;
  flag_name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  required_plan: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFeatureOverride {
  id: string;
  user_id: string;
  feature_flag_id: string;
  enabled: boolean;
  granted_by: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  target_user_id: string | null;
  action: string;
  resource: string;
  old_value: Record<string, unknown>;
  new_value: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const rbacService = {
  async getAllRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('level', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*, role:roles(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async grantRole(userId: string, roleName: string, grantedBy: string): Promise<void> {
    const { error } = await supabase.rpc('grant_user_role', {
      p_user_id: userId,
      p_role_name: roleName,
      p_granted_by: grantedBy,
    });

    if (error) throw error;
  },

  async revokeRole(userId: string, roleName: string, revokedBy: string): Promise<void> {
    const { error } = await supabase.rpc('revoke_user_role', {
      p_user_id: userId,
      p_role_name: roleName,
      p_revoked_by: revokedBy,
    });

    if (error) throw error;
  },

  async setAdminStatus(userId: string, isAdmin: boolean, changedBy: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId);

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: changedBy,
      target_user_id: userId,
      action: isAdmin ? 'grant_admin' : 'revoke_admin',
      resource: 'profiles',
      new_value: { is_admin: isAdmin },
    });
  },

  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags_v2')
      .select('*')
      .order('flag_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateFeatureFlag(
    flagId: string,
    updates: Partial<FeatureFlag>
  ): Promise<void> {
    const { error } = await supabase
      .from('feature_flags_v2')
      .update(updates)
      .eq('id', flagId);

    if (error) throw error;
  },

  async createFeatureFlag(flag: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>): Promise<FeatureFlag> {
    const { data, error } = await supabase
      .from('feature_flags_v2')
      .insert(flag)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserFeatureOverrides(userId: string): Promise<UserFeatureOverride[]> {
    const { data, error } = await supabase
      .from('user_feature_overrides')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async setFeatureOverride(
    userId: string,
    featureFlagId: string,
    enabled: boolean,
    grantedBy: string,
    expiresAt?: string
  ): Promise<void> {
    const { error } = await supabase.from('user_feature_overrides').upsert({
      user_id: userId,
      feature_flag_id: featureFlagId,
      enabled,
      granted_by: grantedBy,
      expires_at: expiresAt || null,
    });

    if (error) throw error;
  },

  async removeFeatureOverride(userId: string, featureFlagId: string): Promise<void> {
    const { error } = await supabase
      .from('user_feature_overrides')
      .delete()
      .eq('user_id', userId)
      .eq('feature_flag_id', featureFlagId);

    if (error) throw error;
  },

  async getAuditLogs(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  async getUserAuditLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .or(`user_id.eq.${userId},target_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};
