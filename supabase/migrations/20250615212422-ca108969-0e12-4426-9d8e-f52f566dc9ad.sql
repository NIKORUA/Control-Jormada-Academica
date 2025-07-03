
-- Crear tabla para las opciones del sidebar
CREATE TABLE public.sidebar_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  default_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para configuración de permisos por rol
CREATE TABLE public.sidebar_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID NOT NULL REFERENCES public.sidebar_options(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  configured_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(option_id, role)
);

-- Habilitar RLS
ALTER TABLE public.sidebar_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sidebar_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas para sidebar_options
CREATE POLICY "Admins can manage sidebar options" 
  ON public.sidebar_options 
  FOR ALL 
  USING (public.is_current_user_admin());

CREATE POLICY "All authenticated users can view sidebar options" 
  ON public.sidebar_options 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Políticas para sidebar_permissions
CREATE POLICY "Admins can manage sidebar permissions" 
  ON public.sidebar_permissions 
  FOR ALL 
  USING (public.is_current_user_admin());

CREATE POLICY "All authenticated users can view sidebar permissions" 
  ON public.sidebar_permissions 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Insertar opciones predeterminadas del sidebar
INSERT INTO public.sidebar_options (option_key, title, description, icon, default_enabled) VALUES
('schedules', 'Gestión de Cronogramas', 'Permite gestionar cronogramas académicos', 'ClipboardList', true),
('subjects', 'Gestión de Materias', 'Permite administrar materias del programa', 'BookOpen', true),
('groups', 'Gestión de Grupos', 'Permite gestionar grupos de estudiantes', 'Users', true),
('students', 'Gestión de Estudiantes', 'Permite administrar información de estudiantes', 'UserPlus', true),
('users', 'Gestión de Docentes', 'Permite gestionar usuarios docentes', 'Users', true),
('bulk-import', 'Importación Masiva', 'Permite realizar importaciones masivas de datos', 'Upload', true),
('attendance', 'Asistencia', 'Permite gestionar asistencia de clases', 'CheckSquare', true),
('reports', 'Reportes', 'Permite generar y ver reportes del sistema', 'FileText', true),
('settings', 'Configuración', 'Permite acceder a configuraciones del sistema', 'Settings', true);

-- Crear permisos por defecto para todos los roles según la lógica actual
INSERT INTO public.sidebar_permissions (option_id, role, enabled)
SELECT 
  so.id,
  r.role,
  CASE 
    WHEN so.option_key = 'schedules' AND r.role IN ('coordinador', 'asistente', 'admin', 'director', 'superadmin') THEN true
    WHEN so.option_key = 'subjects' AND r.role IN ('coordinador', 'asistente', 'admin', 'director', 'superadmin') THEN true
    WHEN so.option_key = 'groups' AND r.role IN ('coordinador', 'asistente', 'admin', 'director', 'superadmin') THEN true
    WHEN so.option_key = 'students' AND r.role IN ('coordinador', 'asistente', 'admin', 'director', 'superadmin') THEN true
    WHEN so.option_key = 'users' AND r.role IN ('coordinador', 'asistente', 'admin', 'director', 'superadmin') THEN true
    WHEN so.option_key = 'bulk-import' AND r.role IN ('coordinador', 'asistente', 'admin', 'director', 'superadmin') THEN true
    WHEN so.option_key = 'attendance' AND r.role IN ('coordinador', 'asistente', 'admin', 'director', 'superadmin', 'docente') THEN true
    WHEN so.option_key = 'reports' AND r.role IN ('director', 'coordinador', 'admin', 'superadmin') THEN true
    WHEN so.option_key = 'settings' AND r.role IN ('superadmin', 'admin') THEN true
    ELSE false
  END
FROM public.sidebar_options so
CROSS JOIN (
  SELECT unnest(enum_range(NULL::user_role)) as role
) r;

-- Trigger para actualizar updated_at
CREATE TRIGGER handle_updated_at_sidebar_options
  BEFORE UPDATE ON public.sidebar_options
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_sidebar_permissions
  BEFORE UPDATE ON public.sidebar_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
