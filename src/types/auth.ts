
/**
 * Representa la estructura de un usuario en la aplicación,
 * combinando datos de autenticación y del perfil de la base de datos.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

/**
 * Define los roles de usuario permitidos en el sistema.
 */
export type UserRole = 
  | 'superadmin'
  | 'admin'
  | 'director'
  | 'coordinador'
  | 'asistente'
  | 'docente';

/**
 * Define la estructura de las credenciales para el inicio de sesión.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Representa el estado de autenticación global en la aplicación.
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Define la estructura del perfil de un usuario, tal como se almacena en la base de datos.
 */
export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  role: 'superadmin' | 'admin' | 'director' | 'coordinador' | 'asistente' | 'docente';
  isActive: boolean;
  lastLogin?: Date;
}

/**
 * Define la forma del contexto de autenticación, proveyendo datos y funciones
 * relacionadas con el estado de autenticación del usuario.
 */
export interface AuthContextType {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  signUp: (email: string, password: string, userData: { username: string, fullName: string, role: string }) => Promise<void>;
}
