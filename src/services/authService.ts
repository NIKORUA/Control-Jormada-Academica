
import { supabase } from '@/integrations/supabase/client';
import { LoginCredentials } from '@/types/auth';

/**
 * Inicia sesión de un usuario con email y contraseña.
 * @param credentials - Las credenciales de inicio de sesión (email y contraseña).
 * @returns Los datos de la sesión y el usuario si el inicio de sesión es exitoso.
 * @throws Un error con un mensaje específico si la autenticación falla.
 */
export const loginUser = async (credentials: LoginCredentials) => {
  console.log('Intentando iniciar sesión para:', credentials.email);
  
  if (!credentials.email || !credentials.password) {
    throw new Error('Email y contraseña son requeridos');
  }

  // Llama a la función de Supabase para iniciar sesión.
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    console.error('Error de inicio de sesión:', error);
    let errorMessage = 'Error de autenticación. Verifica tus credenciales.';
    
    // Personaliza el mensaje de error según la respuesta de Supabase.
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Credenciales inválidas. Por favor verifica tu email y contraseña.';
    } else if (error.message.includes('Email not confirmed')) {
      // Para desarrollo, se intenta reenviar la confirmación de email automáticamente.
      console.log('Email no confirmado, intentando reenviar confirmación...');
      try {
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: credentials.email,
        });
        if (!resendError) {
          errorMessage = 'Se ha enviado un nuevo email de confirmación. Por favor revisa tu bandeja de entrada.';
        } else {
          errorMessage = 'Email no confirmado. Contacta al administrador del sistema.';
        }
      } catch (resendErr) {
        errorMessage = 'Email no confirmado. Contacta al administrador del sistema.';
      }
    } else if (error.message.includes('Too many requests')) {
      errorMessage = 'Demasiados intentos. Por favor espera unos minutos.';
    }

    throw new Error(errorMessage);
  }

  console.log('Inicio de sesión exitoso para el usuario:', data.user?.email);
  return data;
};

/**
 * Registra un nuevo usuario en el sistema.
 * @param email - El email del nuevo usuario.
 * @param password - La contraseña del nuevo usuario.
 * @param userData - Datos adicionales del usuario (username, fullName, role).
 * @returns Los datos del usuario y la sesión si el registro es exitoso.
 * @throws Un error con un mensaje específico si el registro falla.
 */
export const signUpUser = async (email: string, password: string, userData: { username: string, fullName: string, role: string }) => {
  console.log('Intentando registrar para:', email, 'con rol:', userData.role);
  
  // Valida que el rol proporcionado sea uno de los permitidos.
  const validRoles = ['superadmin', 'admin', 'director', 'coordinador', 'asistente', 'docente'];
  if (!validRoles.includes(userData.role)) {
    throw new Error('Rol inválido');
  }

  // Llama a la función de Supabase para registrar un nuevo usuario.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: userData.username,
        full_name: userData.fullName,
        role: userData.role,
      },
      // Para desarrollo, se deshabilita la confirmación de email para agilizar pruebas.
      emailRedirectTo: undefined
    }
  });

  if (error) {
    console.error('Error de registro:', error);
    let errorMessage = 'Error en el registro. Intenta de nuevo.';
    
    // Personaliza el mensaje de error.
    if (error.message.includes('User already registered')) {
      errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
    } else if (error.message.includes('Password should be')) {
      errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = 'El formato del email no es válido.';
    } else if (error.message.includes('Signup is disabled')) {
      errorMessage = 'El registro está deshabilitado en este momento.';
    }

    throw new Error(errorMessage);
  }

  console.log('Registro exitoso:', data);
  return data;
};

/**
 * Cierra la sesión del usuario actual.
 * @throws Un error si el cierre de sesión falla.
 */
export const logoutUser = async () => {
  console.log('Intentando cerrar sesión...');
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  console.log('Cierre de sesión exitoso');
};
