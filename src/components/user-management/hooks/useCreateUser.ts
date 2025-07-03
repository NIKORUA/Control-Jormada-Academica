
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserFormData } from '../types';

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createUser = async (data: UserFormData) => {
    setLoading(true);
    console.log('Creando usuario con datos:', data);

    try {
      // Paso 1: Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.fullName,
            role: data.role,
          }
        }
      });

      if (authError) {
        console.error('Error en auth.signUp:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      console.log('Usuario creado en Auth:', authData.user.id);

      // Paso 2: Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: data.username,
          full_name: data.fullName,
          role: data.role,
          is_active: true
        });

      if (profileError) {
        console.error('Error creando perfil:', profileError);
        // Si falla la creación del perfil, intentamos eliminar el usuario de auth
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error('Error al crear el perfil del usuario');
      }

      console.log('Perfil creado exitosamente');

      toast({
        title: 'Usuario creado',
        description: `El usuario ${data.fullName} ha sido creado exitosamente.`,
      });

      return { success: true, user: authData.user };

    } catch (error: any) {
      console.error('Error en createUser:', error);
      
      let errorMessage = 'Error al crear el usuario';
      if (error.message.includes('User already registered')) {
        errorMessage = 'Este email ya está registrado';
      } else if (error.message.includes('Password should be')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error al crear usuario',
        description: errorMessage,
        variant: 'destructive',
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading };
};
