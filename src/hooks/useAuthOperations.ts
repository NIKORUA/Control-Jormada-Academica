
import { useToast } from '@/hooks/use-toast';
import { LoginCredentials, UserProfile } from '@/types/auth';
import { loginUser, signUpUser, logoutUser } from '@/services/authService';
import { fetchUserProfile } from '@/services/userProfileService';

/**
 * Hook personalizado que encapsula las operaciones de autenticación (login, logout, signup).
 * Maneja el estado de carga, las notificaciones (toasts) y la actualización del estado de autenticación.
 * @param setUser - Función para actualizar el estado del usuario.
 * @param setSession - Función para actualizar el estado de la sesión.
 * @param setLoading - Función para actualizar el estado de carga.
 * @returns Un objeto con las funciones `login`, `signUp` y `logout`.
 */
export const useAuthOperations = (
  setUser: (user: UserProfile | null) => void,
  setSession: (session: any) => void,
  setLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();

  /**
   * Maneja el proceso de inicio de sesión del usuario.
   * @param credentials - Credenciales de email y contraseña.
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      console.log('Intentando iniciar sesión para:', credentials.email);
      
      const data = await loginUser(credentials);
      console.log('Inicio de sesión exitoso, verificando perfil...');

      if (data.user) {
        try {
          // Después del login, obtiene el perfil del usuario para obtener datos adicionales como el rol.
          const profile = await fetchUserProfile(data.user.id);
          console.log('Perfil cargado:', profile);
          
          // Verifica si la cuenta del usuario está activa.
          if (profile && !profile.isActive) {
            console.log('La cuenta del usuario está inactiva');
            await logoutUser();
            setUser(null);
            setSession(null);
            toast({
              title: 'Cuenta desactivada',
              description: 'Tu cuenta ha sido desactivada. Contacta al administrador.',
              variant: 'destructive',
            });
            return;
          }

          toast({
            title: 'Bienvenido',
            description: `Has iniciado sesión correctamente, ${profile?.fullName || credentials.email}`,
          });
        } catch (profileError) {
          console.error('Error al cargar perfil:', profileError);
          toast({
            title: 'Error al cargar perfil',
            description: 'No se pudo cargar tu perfil de usuario.',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Error de inicio de sesión:', error);
      toast({
        title: 'Error de autenticación',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el proceso de registro de un nuevo usuario.
   * @param email - Email del nuevo usuario.
   * @param password - Contraseña del nuevo usuario.
   * @param userData - Datos adicionales del usuario.
   */
  const signUp = async (email: string, password: string, userData: { username: string, fullName: string, role: string }) => {
    try {
      setLoading(true);
      console.log('Intentando registrar para:', email, 'con rol:', userData.role);
      
      const data = await signUpUser(email, password, userData);
      
      if (data.user) {
        console.log('Usuario creado exitosamente:', data.user.id);
        
        // Muestra una notificación de éxito.
        if (data.session) {
          toast({
            title: 'Usuario registrado',
            description: 'Usuario creado exitosamente. Ya puedes usar el sistema.',
          });
        } else {
          toast({
            title: 'Usuario registrado',
            description: 'Usuario creado exitosamente. Puedes iniciar sesión ahora.',
          });
        }
      }
    } catch (error: any) {
      console.error('Error de registro:', error);
      toast({
        title: 'Error en el registro',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el proceso de cierre de sesión del usuario.
   */
  const logout = async () => {
    try {
      setLoading(true);
      
      await logoutUser();
      setUser(null);
      setSession(null);
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al cerrar sesión.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { login, signUp, logout };
};
