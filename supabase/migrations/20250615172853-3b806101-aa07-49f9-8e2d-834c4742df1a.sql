
-- Primero, eliminamos todas las políticas existentes que podrían estar causando problemas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.profiles;

-- Recreamos las políticas de manera más clara y sin conflictos
-- Política para que los usuarios vean su propio perfil
CREATE POLICY "Enable read own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Política para que los usuarios actualicen su propio perfil
CREATE POLICY "Enable update own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política para que los administradores vean todos los perfiles
CREATE POLICY "Enable read all profiles for admins" ON public.profiles
  FOR SELECT 
  USING (public.is_current_user_admin());

-- Política para que los administradores actualicen perfiles
CREATE POLICY "Enable update profiles for admins" ON public.profiles
  FOR UPDATE 
  USING (public.is_current_user_admin());

-- Política para inserción de perfiles durante el registro
CREATE POLICY "Enable insert profile during registration" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Política para que administradores puedan insertar perfiles
CREATE POLICY "Enable insert profiles for admins" ON public.profiles
  FOR INSERT 
  WITH CHECK (public.is_current_user_admin());

-- Política para que administradores puedan eliminar perfiles
CREATE POLICY "Enable delete profiles for admins" ON public.profiles
  FOR DELETE 
  USING (public.is_current_user_admin());
