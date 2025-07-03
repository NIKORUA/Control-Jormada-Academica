
-- Verificar si el tipo user_role existe y crearlo si no existe
DO $$ 
BEGIN
    -- Intentar crear el tipo user_role
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'director', 'coordinador', 'asistente', 'docente');
    END IF;
END $$;

-- Verificar si la tabla profiles existe y crearla si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'docente'::user_role,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Habilitar RLS en la tabla profiles si no está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar el trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar la función anterior si existe
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear la función handle_new_user actualizada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'docente'::user_role)
  );
  RETURN NEW;
END;
$$;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crear políticas RLS básicas para la tabla profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
