
import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import Dashboard from './Dashboard';
import ScheduleManagement from './ScheduleManagement';
import SubjectManagement from './SubjectManagement';
import GroupManagement from './GroupManagement';
import StudentManagement from './StudentManagement';
import AttendanceManagement from './AttendanceManagement';
import Reports from './Reports';
import UserManagement from './UserManagement';
import BulkImport from './BulkImport';
import SettingsManagement from './SettingsManagement';
import ResponsiveContainer from './ResponsiveContainer';

/**
 * Componente que define la estructura principal de la aplicación una vez que el usuario está autenticado.
 * Incluye la barra lateral de navegación y el área de contenido principal.
 * Maneja la navegación entre las diferentes vistas de la aplicación.
 */
const MainLayout: React.FC = () => {
  // Estado para controlar la vista actual que se muestra en el área de contenido.
  const [currentView, setCurrentView] = useState('dashboard');

  // Función que renderiza el componente de la vista actual basado en el estado `currentView`.
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'schedules':
        return <ScheduleManagement />;
      case 'my-schedule':
        return <ScheduleManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'groups':
        return <GroupManagement />;
      case 'students':
        return <StudentManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      case 'bulk-import':
        return <BulkImport />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar onNavigate={setCurrentView} />
        <main className="flex-1 overflow-hidden">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 sm:h-16 items-center px-3 sm:px-4">
              <SidebarTrigger className="h-8 w-8 sm:h-auto sm:w-auto" />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <ResponsiveContainer padding="md">
              <div className="space-y-4 sm:space-y-6">
                {renderContent()}
              </div>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
