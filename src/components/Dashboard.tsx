import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardStats from './DashboardStats';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  GraduationCap,
  UserCheck,
  BarChart3,
  Settings
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

/**
 * Componente principal del panel de control.
 * Muestra un resumen de estadísticas, acciones rápidas y actividad reciente.
 * Las acciones rápidas se muestran condicionalmente según el rol del usuario.
 */
const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, hasRole } = useAuth();

  // Define todas las acciones rápidas disponibles en el sistema, con los roles que pueden acceder a ellas.
  const quickActions = [
    {
      title: 'Cronogramas',
      description: 'Gestionar cronogramas académicos',
      icon: Calendar,
      action: () => onNavigate('schedules'),
      roles: ['superadmin', 'admin', 'director', 'coordinador', 'asistente']
    },
    {
      title: 'Mi Cronograma',
      description: 'Ver mi cronograma personal',
      icon: Calendar,
      action: () => onNavigate('my-schedule'),
      roles: ['docente']
    },
    {
      title: 'Asignaturas',
      description: 'Administrar asignaturas',
      icon: BookOpen,
      action: () => onNavigate('subjects'),
      roles: ['superadmin', 'admin', 'director', 'coordinador']
    },
    {
      title: 'Grupos',
      description: 'Gestionar grupos de estudiantes',
      icon: GraduationCap,
      action: () => onNavigate('groups'),
      roles: ['superadmin', 'admin', 'director', 'coordinador', 'asistente']
    },
    {
      title: 'Estudiantes',
      description: 'Administrar estudiantes',
      icon: Users,
      action: () => onNavigate('students'),
      roles: ['superadmin', 'admin', 'director', 'coordinador', 'asistente']
    },
    {
      title: 'Asistencia',
      description: 'Registrar y consultar asistencia',
      icon: UserCheck,
      action: () => onNavigate('attendance'),
      roles: ['superadmin', 'admin', 'director', 'coordinador', 'asistente', 'docente']
    },
    {
      title: 'Reportes',
      description: 'Generar reportes académicos',
      icon: BarChart3,
      action: () => onNavigate('reports'),
      roles: ['superadmin', 'admin', 'director', 'coordinador']
    },
    {
      title: 'Usuarios',
      description: 'Gestionar usuarios del sistema',
      icon: Users,
      action: () => onNavigate('users'),
      roles: ['superadmin', 'admin']
    }
  ];

  // Filtra las acciones rápidas para mostrar solo las que corresponden al rol del usuario actual.
  const availableActions = quickActions.filter(action => 
    hasRole(action.roles)
  );

  return (
    <div className="space-y-6">
      {/* Cabecera de bienvenida */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          Bienvenido de vuelta, {user?.fullName || user?.username}
        </p>
      </div>

      {/* Estadísticas del Dashboard */}
      <DashboardStats />

      {/* Acciones Rápidas */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={action.action}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {action.title}
                  </CardTitle>
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sistema iniciado correctamente</p>
                <p className="text-xs text-muted-foreground">Hace unos momentos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
