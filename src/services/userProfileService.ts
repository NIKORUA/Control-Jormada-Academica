
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

/**
 * Obtiene el perfil de un usuario desde la base de datos.
 * Si el perfil no existe, intenta crearlo a partir de los metadatos de autenticación del usuario.
 * @param userId - El ID del usuario cuyo perfil se desea obtener.
 * @returns El perfil del usuario o null si no se puede obtener o crear.
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('Obteniendo perfil de usuario para el ID:', userId);
    
    // Intenta obtener el perfil del usuario desde la tabla 'profiles'.
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, role, is_active')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      
      // Si el perfil no se encuentra (código de error de Supabase para 'single' sin resultados),
      // intenta crearlo. Esto es útil para usuarios que se registran pero cuyo perfil no se crea automáticamente.
      if (error.code === 'PGRST116') {
        console.log('Perfil no encontrado, intentando crear desde metadatos de usuario...');
        
        try {
          // Obtiene los datos del usuario autenticado actual.
          const { data: authUser } = await supabase.auth.getUser();
          
          if (authUser.user && authUser.user.id === userId) {
            console.log('Creando perfil desde metadatos de usuario:', authUser.user.user_metadata);
            
            // Inserta un nuevo perfil con los datos de los metadatos del usuario.
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                username: authUser.user.user_metadata?.username || authUser.user.email?.split('@')[0] || 'user',
                full_name: authUser.user.user_metadata?.full_name || authUser.user.email || 'Usuario',
                role: (authUser.user.user_metadata?.role as any) || 'docente',
                is_active: true
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creando perfil:', createError);
              return null;
            }

            console.log('Perfil creado exitosamente:', newProfile);
            // Mapea los datos del nuevo perfil al formato UserProfile.
            return {
              id: newProfile.id,
              username: newProfile.username,
              fullName: newProfile.full_name,
              role: newProfile.role,
              isActive: newProfile.is_active,
            };
          }
        } catch (createError) {
          console.error('Error en el proceso de creación de perfil:', createError);
          return null;
        }
      }

      return null;
    }

    console.log('Perfil de usuario obtenido exitosamente:', data);
    // Mapea los datos del perfil existente al formato UserProfile.
    return {
      id: data.id,
      username: data.username,
      fullName: data.full_name,
      role: data.role,
      isActive: data.is_active,
    };
  } catch (error) {
    console.error('Error en fetchUserProfile:', error);
    return null;
  }
};
