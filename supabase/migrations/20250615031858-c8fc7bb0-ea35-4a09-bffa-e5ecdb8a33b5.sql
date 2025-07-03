
-- Eliminar TODAS las políticas existentes en la tabla profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for admins" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert during registration" ON public.profiles;

-- Crear función security definer para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Crear función security definer para verificar si es admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin', 'director')
  );
$$;

-- Crear políticas corregidas sin recursión
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política para que admins puedan ver todos los perfiles (usando función security definer)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (public.is_current_user_admin());

-- Política para inserción durante registro
CREATE POLICY "Allow profile creation during registration" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
