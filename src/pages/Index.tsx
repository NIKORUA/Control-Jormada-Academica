
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import AuthPage from '@/components/AuthPage';

/**
 * Componente de la página de inicio (Index).
 * Actúa como un punto de entrada que decide qué vista mostrar:
 * - Muestra un indicador de carga mientras se verifica el estado de autenticación.
 * - Muestra la página de autenticación (`AuthPage`) si el usuario no está autenticado.
 * - Muestra el layout principal de la aplicación (`MainLayout`) si el usuario está autenticado.
 */
const Index = () => {
  const { user, loading } = useAuth();

  // Muestra un spinner de carga mientras el estado de autenticación se está resolviendo.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, muestra la página de inicio de sesión/registro.
  if (!user) {
    return <AuthPage />;
  }

  // Si el usuario está autenticado, muestra el layout principal de la aplicación.
  return <MainLayout />;
};

export default Index;
