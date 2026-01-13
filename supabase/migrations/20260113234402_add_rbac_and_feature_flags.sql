/*
  # Add Role-Based Access Control and Feature Flags

  ## Overview
  Implements a comprehensive RBAC system with roles, permissions, and feature flags
  to control user access to features and functions throughout the application.

  ## New Tables
  - roles: System roles (admin, manager, user, viewer)
  - permissions: Granular permissions for operations
  - user_roles: Many-to-many user to role mapping
  - role_permissions: Many-to-many role to permission mapping
  - feature_flags_v2: Feature flags with plan requirements
  - user_feature_overrides: User-specific feature flag overrides
  - audit_logs: Admin action tracking

  ## Profile Updates
  - Add is_admin boolean flag
  - Add organization_id for future team support

  ## Security
  - Enable RLS on all new tables
  - Admins can manage roles and permissions
  - Users can view their own roles
  - Audit logs only accessible by admins
*/

-- =============================================
-- PART 1: CREATE TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  level integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  granted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS feature_flags_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name text UNIQUE NOT NULL,
  description text NOT NULL,
  enabled boolean DEFAULT false NOT NULL,
  rollout_percentage integer DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  required_plan text CHECK (required_plan IN ('free', 'starter', 'professional', 'enterprise')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_feature_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  feature_flag_id uuid REFERENCES feature_flags_v2(id) ON DELETE CASCADE NOT NULL,
  enabled boolean NOT NULL,
  granted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_flag_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text NOT NULL,
  old_value jsonb DEFAULT '{}',
  new_value jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN organization_id uuid;
  END IF;
END $$;

-- =============================================
-- PART 2: CREATE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_user_id ON user_feature_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_feature_flag_id ON user_feature_overrides(feature_flag_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- =============================================
-- PART 3: SEED DEFAULT ROLES AND PERMISSIONS
-- =============================================

INSERT INTO roles (name, description, level) VALUES
  ('admin', 'Full system access with user management capabilities', 100),
  ('manager', 'Can manage campaigns and view team analytics', 50),
  ('user', 'Standard user with campaign creation and management', 10),
  ('viewer', 'Read-only access to campaigns and analytics', 1)
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description, resource, action) VALUES
  ('manage_users', 'Create, update, and delete users', 'users', 'manage'),
  ('view_users', 'View user list and details', 'users', 'read'),
  ('manage_roles', 'Assign and revoke roles', 'roles', 'manage'),
  ('create_campaigns', 'Create new campaigns', 'campaigns', 'create'),
  ('view_campaigns', 'View campaign details', 'campaigns', 'read'),
  ('update_campaigns', 'Edit campaign settings', 'campaigns', 'update'),
  ('delete_campaigns', 'Delete campaigns', 'campaigns', 'delete'),
  ('manage_all_campaigns', 'Manage campaigns across all users', 'campaigns', 'manage'),
  ('create_leads', 'Import and create leads', 'leads', 'create'),
  ('view_leads', 'View lead details', 'leads', 'read'),
  ('update_leads', 'Edit lead information', 'leads', 'update'),
  ('delete_leads', 'Delete leads', 'leads', 'delete'),
  ('export_leads', 'Export lead data', 'leads', 'export'),
  ('send_emails', 'Send emails to leads', 'emails', 'send'),
  ('view_emails', 'View email history', 'emails', 'read'),
  ('manage_email_accounts', 'Connect and manage email accounts', 'email_accounts', 'manage'),
  ('view_analytics', 'View campaign analytics', 'analytics', 'read'),
  ('view_all_analytics', 'View analytics across all users', 'analytics', 'manage'),
  ('manage_settings', 'Update user settings', 'settings', 'update'),
  ('manage_billing', 'Manage subscription and billing', 'billing', 'manage'),
  ('use_ai_features', 'Use AI-powered features', 'ai', 'use'),
  ('manage_automation', 'Create and manage automation rules', 'automation', 'manage'),
  ('manage_feature_flags', 'Enable/disable feature flags', 'feature_flags', 'manage'),
  ('view_audit_logs', 'View system audit logs', 'audit_logs', 'read')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'manager' AND p.name IN (
  'view_users', 'create_campaigns', 'view_campaigns', 'update_campaigns', 'delete_campaigns',
  'manage_all_campaigns', 'create_leads', 'view_leads', 'update_leads', 'delete_leads',
  'export_leads', 'send_emails', 'view_emails', 'view_all_analytics', 'use_ai_features', 'manage_automation'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'user' AND p.name IN (
  'create_campaigns', 'view_campaigns', 'update_campaigns', 'delete_campaigns',
  'create_leads', 'view_leads', 'update_leads', 'delete_leads', 'export_leads',
  'send_emails', 'view_emails', 'manage_email_accounts', 'view_analytics',
  'manage_settings', 'manage_billing', 'use_ai_features', 'manage_automation'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'viewer' AND p.name IN ('view_campaigns', 'view_leads', 'view_emails', 'view_analytics')
ON CONFLICT DO NOTHING;

-- =============================================
-- PART 4: CREATE FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION check_user_permission(p_user_id uuid, p_permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_admin = true) THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id AND p.name = p_permission_name
  );
END;
$$;

CREATE OR REPLACE FUNCTION has_feature_access(p_user_id uuid, p_feature_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_feature RECORD;
  v_override RECORD;
  v_user_plan text;
  v_plan_level integer;
BEGIN
  SELECT * INTO v_feature FROM public.feature_flags_v2 WHERE flag_name = p_feature_name;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT * INTO v_override
  FROM public.user_feature_overrides
  WHERE user_id = p_user_id AND feature_flag_id = v_feature.id
    AND (expires_at IS NULL OR expires_at > now());

  IF FOUND THEN
    RETURN v_override.enabled;
  END IF;

  IF NOT v_feature.enabled THEN
    RETURN false;
  END IF;

  IF v_feature.required_plan IS NOT NULL THEN
    SELECT s.plan_type INTO v_user_plan FROM public.subscriptions s WHERE s.user_id = p_user_id;

    v_plan_level := CASE v_user_plan
      WHEN 'free' THEN 0 WHEN 'starter' THEN 1 
      WHEN 'professional' THEN 2 WHEN 'enterprise' THEN 3 ELSE 0 END;

    IF v_plan_level < (CASE v_feature.required_plan
      WHEN 'free' THEN 0 WHEN 'starter' THEN 1 
      WHEN 'professional' THEN 2 WHEN 'enterprise' THEN 3 ELSE 0 END) THEN
      RETURN false;
    END IF;
  END IF;

  IF v_feature.rollout_percentage < 100 THEN
    RETURN (hashtext(p_user_id::text) % 100) < v_feature.rollout_percentage;
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_roles(p_user_id uuid)
RETURNS TABLE (role_id uuid, role_name text, role_level integer, granted_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.level, ur.granted_at
  FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id ORDER BY r.level DESC;
END;
$$;

CREATE OR REPLACE FUNCTION grant_user_role(p_user_id uuid, p_role_name text, p_granted_by uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_role_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;

  INSERT INTO public.user_roles (user_id, role_id, granted_by)
  VALUES (p_user_id, v_role_id, p_granted_by)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  INSERT INTO public.audit_logs (user_id, target_user_id, action, resource, new_value)
  VALUES (p_granted_by, p_user_id, 'grant_role', 'user_roles', jsonb_build_object('role', p_role_name));
END;
$$;

CREATE OR REPLACE FUNCTION revoke_user_role(p_user_id uuid, p_role_name text, p_revoked_by uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_role_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = p_user_id AND role_id = v_role_id;

  INSERT INTO public.audit_logs (user_id, target_user_id, action, resource, old_value)
  VALUES (p_revoked_by, p_user_id, 'revoke_role', 'user_roles', jsonb_build_object('role', p_role_name));
END;
$$;

DROP TRIGGER IF EXISTS feature_flags_v2_updated_at ON feature_flags_v2;
CREATE TRIGGER feature_flags_v2_updated_at
  BEFORE UPDATE ON feature_flags_v2
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PART 6: CREATE RLS POLICIES
-- =============================================

CREATE POLICY "Anyone can view roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view permissions" ON permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON user_roles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can manage user roles" ON user_roles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Anyone can view role permissions" ON role_permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage role permissions" ON role_permissions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Anyone can view feature flags" ON feature_flags_v2 FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage feature flags" ON feature_flags_v2 FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Users can view own overrides" ON user_feature_overrides FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all overrides" ON user_feature_overrides FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can manage overrides" ON user_feature_overrides FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- PART 7: SEED FEATURE FLAGS
-- =============================================

INSERT INTO feature_flags_v2 (flag_name, description, enabled, required_plan) VALUES
  ('ai_email_generation', 'AI-powered email content generation', true, 'starter'),
  ('advanced_analytics', 'Advanced analytics and reporting', true, 'professional'),
  ('custom_automation', 'Custom automation rules and workflows', true, 'professional'),
  ('api_access', 'API access for integrations', true, 'professional'),
  ('white_label', 'White-label branding options', true, 'enterprise'),
  ('priority_support', 'Priority customer support', true, 'professional'),
  ('unlimited_campaigns', 'Create unlimited campaigns', true, 'professional'),
  ('team_collaboration', 'Team collaboration features', true, 'professional'),
  ('bulk_operations', 'Bulk import and export operations', true, 'starter'),
  ('email_scheduling', 'Schedule emails for optimal send times', true, 'starter')
ON CONFLICT (flag_name) DO NOTHING;

-- =============================================
-- PART 8: GRANT DEFAULT USER ROLE
-- =============================================

DO $$
DECLARE
  v_user_role_id uuid;
  v_user_record RECORD;
BEGIN
  SELECT id INTO v_user_role_id FROM public.roles WHERE name = 'user';
  FOR v_user_record IN SELECT id FROM public.profiles LOOP
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_user_record.id, v_user_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END LOOP;
END $$;