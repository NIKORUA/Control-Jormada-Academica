
-- Eliminar las políticas problemáticas que causan recursión infinita
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Crear políticas corregidas que no causen recursión
CREATE POLICY "Enable read access for users based on user_id" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para que admins puedan ver todos los perfiles
CREATE POLICY "Enable read access for admins" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'superadmin', 'director')
    )
  );

-- Política para inserción (solo durante registro)
CREATE POLICY "Enable insert during registration" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
