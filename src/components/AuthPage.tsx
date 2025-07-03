import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus } from 'lucide-react';
import { LoginCredentials } from '@/types/auth';
import AuthHeader from './auth/AuthHeader';
import AuthFooter from './auth/AuthFooter';
import AuthErrorAlert from './auth/AuthErrorAlert';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import { LoginFormData, RegisterFormData } from './auth/schemas';

/**
 * Componente que renderiza la página de autenticación.
 * Contiene los formularios de inicio de sesión y registro, y maneja la lógica de autenticación
 * a través del hook `useAuth`.
 */
const AuthPage: React.FC = () => {
  const { login, signUp, loading } = useAuth();
  const [authError, setAuthError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * @param data - Los datos del formulario de inicio de sesión.
   */
  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setAuthError('');
    
    try {
      const credentials: LoginCredentials = {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      };
      await login(credentials);
    } catch (error: any) {
      console.error('Error de inicio de sesión en el componente:', error);
      setAuthError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Maneja el envío del formulario de registro.
   * @param data - Los datos del formulario de registro.
   */
  const handleRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setAuthError('');
    
    try {
      await signUp(data.email.trim().toLowerCase(), data.password, {
        username: data.username.trim().toLowerCase(),
        fullName: data.fullName.trim(),
        role: data.role,
      });
    } catch (error: any) {
      console.error('Error de registro en el componente:', error);
      setAuthError(error.message || 'Error al registrar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deshabilita los formularios mientras se realiza una operación de autenticación.
  const isFormDisabled = loading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader />

        <Card>
          <CardHeader>
            <CardTitle>Autenticación</CardTitle>
            <CardDescription>
              Accede al sistema académico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" disabled={isFormDisabled}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger value="register" disabled={isFormDisabled}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <AuthErrorAlert error={authError} />

              <TabsContent value="login" className="space-y-4">
                <LoginForm
                  onSubmit={handleLogin}
                  isDisabled={isFormDisabled}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <RegisterForm
                  onSubmit={handleRegister}
                  isDisabled={isFormDisabled}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <AuthFooter />
      </div>
    </div>
  );
};

export default AuthPage;
