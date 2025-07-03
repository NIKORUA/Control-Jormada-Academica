
export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'admin' | 'director' | 'coordinador' | 'asistente' | 'docente';
  password: string;
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
}
