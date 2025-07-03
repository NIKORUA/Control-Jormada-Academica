
-- Primero, crear el tipo enum user_role si no existe
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'director', 'coordinador', 'asistente', 'docente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Luego, actualizar la función handle_new_user para usar el tipo correctamente
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

-- Crear el trigger si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
