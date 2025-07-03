
export interface SidebarOption {
  id: string;
  option_key: string;
  title: string;
  description?: string;
  icon?: string;
  default_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SidebarPermission {
  id: string;
  option_id: string;
  role: string;
  enabled: boolean;
  configured_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SidebarOptionWithPermissions extends SidebarOption {
  permissions: SidebarPermission[];
}

export type UserRole = 'superadmin' | 'admin' | 'director' | 'coordinador' | 'asistente' | 'docente';
