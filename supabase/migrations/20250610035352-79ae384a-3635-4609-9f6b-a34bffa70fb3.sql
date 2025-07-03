
-- Crear enum para roles de usuario
CREATE TYPE public.user_role AS ENUM ('superadmin', 'admin', 'director', 'coordinador', 'asistente', 'docente');

-- Crear enum para modalidades de clase
CREATE TYPE public.modalidad_clase AS ENUM ('presencial', 'virtual', 'hibrida');

-- Crear enum para estado de cronograma
CREATE TYPE public.estado_cronograma AS ENUM ('programado', 'en_curso', 'completado', 'cancelado');

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'docente',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabla de materias/asignaturas
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabla de grupos
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  max_students INTEGER NOT NULL DEFAULT 30,
  semester TEXT NOT NULL,
  year INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabla de estudiantes
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  student_code TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  semester TEXT,
  program TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabla de cronogramas
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  modalidad modalidad_clase NOT NULL DEFAULT 'presencial',
  aula TEXT,
  estado estado_cronograma NOT NULL DEFAULT 'programado',
  observaciones TEXT,
  cumplido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Tabla de inscripciones de estudiantes en grupos
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (id),
  UNIQUE(student_id, group_id)
);

-- Tabla de asistencia
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  present BOOLEAN NOT NULL DEFAULT false,
  late BOOLEAN NOT NULL DEFAULT false,
  excused BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(schedule_id, student_id)
);

-- Tabla de reportes
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  generated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data JSONB,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Función de seguridad para verificar roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Función para verificar si un usuario tiene permisos administrativos
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role IN ('superadmin', 'admin', 'director') FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Función para verificar si un usuario puede gestionar cronogramas
CREATE OR REPLACE FUNCTION public.can_manage_schedules(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role IN ('superadmin', 'admin', 'director', 'coordinador', 'asistente') FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin_user(auth.uid()));

-- Políticas RLS para subjects
CREATE POLICY "Everyone can view active subjects" ON public.subjects
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Políticas RLS para groups
CREATE POLICY "Everyone can view active groups" ON public.groups
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage groups" ON public.groups
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Políticas RLS para students
CREATE POLICY "Everyone can view active students" ON public.students
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Políticas RLS para schedules
CREATE POLICY "Teachers can view their own schedules" ON public.schedules
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Managers can view all schedules" ON public.schedules
  FOR SELECT USING (public.can_manage_schedules(auth.uid()));

CREATE POLICY "Managers can manage schedules" ON public.schedules
  FOR ALL USING (public.can_manage_schedules(auth.uid()));

-- Políticas RLS para enrollments
CREATE POLICY "Everyone can view enrollments" ON public.enrollments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage enrollments" ON public.enrollments
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Políticas RLS para attendance
CREATE POLICY "Teachers can view attendance for their schedules" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.schedules 
      WHERE schedules.id = attendance.schedule_id 
      AND schedules.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Managers can view all attendance" ON public.attendance
  FOR SELECT USING (public.can_manage_schedules(auth.uid()));

CREATE POLICY "Teachers and managers can manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.schedules 
      WHERE schedules.id = attendance.schedule_id 
      AND schedules.teacher_id = auth.uid()
    ) OR public.can_manage_schedules(auth.uid())
  );

-- Políticas RLS para reports
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (generated_by = auth.uid());

CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (generated_by = auth.uid());

CREATE POLICY "Admins can manage reports" ON public.reports
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas que tienen updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'docente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insertar datos de ejemplo
INSERT INTO public.subjects (name, code, description, credits) VALUES
  ('Matemáticas I', 'MAT001', 'Fundamentos de matemáticas', 3),
  ('Física General', 'FIS001', 'Principios básicos de física', 4),
  ('Programación I', 'PROG001', 'Introducción a la programación', 3),
  ('Base de Datos', 'BD001', 'Fundamentos de bases de datos', 3);

INSERT INTO public.groups (name, code, subject_id, semester, year) VALUES
  ('Grupo A', 'MAT001-A', (SELECT id FROM public.subjects WHERE code = 'MAT001'), '2024-1', 2024),
  ('Grupo B', 'MAT001-B', (SELECT id FROM public.subjects WHERE code = 'MAT001'), '2024-1', 2024),
  ('Grupo A', 'FIS001-A', (SELECT id FROM public.subjects WHERE code = 'FIS001'), '2024-1', 2024),
  ('Grupo A', 'PROG001-A', (SELECT id FROM public.subjects WHERE code = 'PROG001'), '2024-1', 2024);

INSERT INTO public.students (student_code, first_name, last_name, email, semester, program) VALUES
  ('2024001', 'Juan', 'Pérez García', 'juan.perez@estudiantes.edu', '2024-1', 'Ingeniería de Sistemas'),
  ('2024002', 'María', 'González López', 'maria.gonzalez@estudiantes.edu', '2024-1', 'Ingeniería de Sistemas'),
  ('2024003', 'Carlos', 'Rodríguez Martín', 'carlos.rodriguez@estudiantes.edu', '2024-1', 'Ingeniería Industrial'),
  ('2024004', 'Ana', 'Martínez Silva', 'ana.martinez@estudiantes.edu', '2024-1', 'Ingeniería Civil');
