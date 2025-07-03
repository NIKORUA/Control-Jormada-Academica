// Estructura completa de la base de datos para el sistema académico

export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'superadmin' | 'admin' | 'director' | 'coordinador' | 'asistente' | 'docente';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  phone?: string;
  department?: string;
  employee_id?: string;
}

export interface DatabaseSchedule {
  id: string;
  docente_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  asignatura: string;
  grupo: string;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  aula?: string;
  programa: string;
  semestre: string;
  creditos: number;
  cumplido: boolean;
  fecha_cumplimiento?: string;
  observaciones?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAttendance {
  id: string;
  schedule_id: string;
  docente_id: string;
  fecha: string;
  hora_entrada?: string;
  hora_salida?: string;
  estado: 'presente' | 'ausente' | 'justificado' | 'tardanza';
  observaciones?: string;
  ubicacion_checkin?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSubject {
  id: string;
  codigo: string;
  nombre: string;
  creditos: number;
  programa: string;
  semestre: string;
  prerequisitos?: string[];
  descripcion?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProgram {
  id: string;
  codigo: string;
  nombre: string;
  facultad: string;
  duracion_semestres: number;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseReport {
  id: string;
  tipo: 'asistencia' | 'cumplimiento' | 'academico' | 'general';
  titulo: string;
  parametros: Record<string, any>;
  datos: Record<string, any>;
  generado_por: string;
  fecha_inicio: string;
  fecha_fin: string;
  created_at: string;
}

export interface DatabaseNotification {
  id: string;
  usuario_id: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
}

export interface DatabaseSidebarOption {
  id: string;
  option_key: string;
  title: string;
  description?: string;
  icon?: string;
  default_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSidebarPermission {
  id: string;
  option_id: string;
  role: 'superadmin' | 'admin' | 'director' | 'coordinador' | 'asistente' | 'docente';
  enabled: boolean;
  configured_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBulkImport {
  id: string;
  import_type: 'users' | 'subjects' | 'groups' | 'schedules';
  file_name: string;
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errors?: Record<string, any>;
  imported_by: string;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface DatabaseImportError {
  id: string;
  bulk_import_id: string;
  row_number: number;
  error_message: string;
  row_data?: Record<string, any>;
  created_at: string;
}

// SQL para crear las tablas (para usar en Supabase)
export const DATABASE_SCHEMA = `
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('superadmin', 'admin', 'director', 'coordinador', 'asistente', 'docente')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  phone VARCHAR(20),
  department VARCHAR(100),
  employee_id VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Tabla de programas académicos
CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  facultad VARCHAR(255) NOT NULL,
  duracion_semestres INTEGER NOT NULL,
  modalidad VARCHAR(20) CHECK (modalidad IN ('presencial', 'virtual', 'hibrida')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asignaturas
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  creditos INTEGER NOT NULL CHECK (creditos > 0),
  programa VARCHAR(20) NOT NULL,
  semestre VARCHAR(10) NOT NULL,
  prerequisitos TEXT[],
  descripcion TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cronogramas
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  docente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  asignatura VARCHAR(255) NOT NULL,
  grupo VARCHAR(50) NOT NULL,
  modalidad VARCHAR(20) CHECK (modalidad IN ('presencial', 'virtual', 'hibrida')) NOT NULL,
  aula VARCHAR(50),
  programa VARCHAR(20) NOT NULL,
  semestre VARCHAR(10) NOT NULL,
  creditos INTEGER NOT NULL,
  cumplido BOOLEAN DEFAULT false,
  fecha_cumplimiento TIMESTAMP WITH TIME ZONE,
  observaciones TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  docente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_entrada TIME,
  hora_salida TIME,
  estado VARCHAR(20) CHECK (estado IN ('presente', 'ausente', 'justificado', 'tardanza')) NOT NULL,
  observaciones TEXT,
  ubicacion_checkin VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reportes
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo VARCHAR(20) CHECK (tipo IN ('asistencia', 'cumplimiento', 'academico', 'general')) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  parametros JSONB,
  datos JSONB,
  generado_por UUID NOT NULL REFERENCES users(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(20) CHECK (tipo IN ('info', 'warning', 'error', 'success')) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de opciones del sidebar
CREATE TABLE IF NOT EXISTS sidebar_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option_key VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  default_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de permisos del sidebar
CREATE TABLE IF NOT EXISTS sidebar_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID NOT NULL REFERENCES sidebar_options(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('superadmin', 'admin', 'director', 'coordinador', 'asistente', 'docente')) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  configured_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(option_id, role)
);

-- Tabla de importaciones masivas
CREATE TABLE IF NOT EXISTS bulk_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  import_type VARCHAR(20) CHECK (import_type IN ('users', 'subjects', 'groups', 'schedules')) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  errors JSONB,
  imported_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de errores de importación
CREATE TABLE IF NOT EXISTS import_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bulk_import_id UUID NOT NULL REFERENCES bulk_imports(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  error_message TEXT NOT NULL,
  row_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_schedules_docente_fecha ON schedules(docente_id, fecha);
CREATE INDEX IF NOT EXISTS idx_attendance_schedule_fecha ON attendance(schedule_id, fecha);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_notifications_usuario_leido ON notifications(usuario_id, leido);
CREATE INDEX IF NOT EXISTS idx_sidebar_permissions_role ON sidebar_permissions(role);
CREATE INDEX IF NOT EXISTS idx_sidebar_permissions_option_role ON sidebar_permissions(option_id, role);

-- RLS (Row Level Security) políticas básicas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sidebar_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE sidebar_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_errors ENABLE ROW LEVEL SECURITY;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sidebar_options_updated_at BEFORE UPDATE ON sidebar_options
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_sidebar_permissions_updated_at BEFORE UPDATE ON sidebar_permissions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_bulk_imports_updated_at BEFORE UPDATE ON bulk_imports
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
`;
