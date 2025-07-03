
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  BookOpen,
  ClipboardList,
  UserPlus,
  CheckSquare,
  Upload
} from 'lucide-react';
import { useSidebarPermissions } from '@/hooks/useSidebarConfig';

interface AppSidebarProps {
  onNavigate: (view: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ onNavigate }) => {
  const { user, logout, hasRole } = useAuth();
  const { data: sidebarPermissions = {}, isLoading: permissionsLoading } = useSidebarPermissions(user?.role);

  console.log('Current user role:', user?.role);
  console.log('Sidebar permissions loaded:', sidebarPermissions);
  console.log('Permissions loading:', permissionsLoading);

  const handleLogout = async () => {
    await logout();
  };

  const getMenuItems = () => {
    console.log('Building menu items...');
    
    const items = [
      {
        title: 'Dashboard',
        icon: Home,
        action: () => onNavigate('dashboard'),
        visible: true,
      },
    ];

    if (hasRole(['docente'])) {
      items.push({
        title: 'Mi Cronograma',
        icon: Calendar,
        action: () => onNavigate('my-schedule'),
        visible: true,
      });
    }

    // Usar configuración dinámica para el resto de opciones
    const dynamicItems = [
      {
        key: 'schedules',
        title: 'Gestión de Cronogramas',
        icon: ClipboardList,
        action: () => onNavigate('schedules'),
        fallbackRoles: ['coordinador', 'asistente', 'admin', 'director', 'superadmin'],
      },
      {
        key: 'subjects',
        title: 'Gestión de Materias',
        icon: BookOpen,
        action: () => onNavigate('subjects'),
        fallbackRoles: ['coordinador', 'asistente', 'admin', 'director', 'superadmin'],
      },
      {
        key: 'groups',
        title: 'Gestión de Grupos',
        icon: Users,
        action: () => onNavigate('groups'),
        fallbackRoles: ['coordinador', 'asistente', 'admin', 'director', 'superadmin'],
      },
      {
        key: 'students',
        title: 'Gestión de Estudiantes',
        icon: UserPlus,
        action: () => onNavigate('students'),
        fallbackRoles: ['coordinador', 'asistente', 'admin', 'director', 'superadmin'],
      },
      {
        key: 'users',
        title: 'Gestión de Docentes',
        icon: Users,
        action: () => onNavigate('users'),
        fallbackRoles: ['coordinador', 'asistente', 'admin', 'director', 'superadmin'],
      },
      {
        key: 'bulk-import',
        title: 'Importación Masiva',
        icon: Upload,
        action: () => onNavigate('bulk-import'),
        fallbackRoles: ['coordinador', 'asistente', 'admin', 'director', 'superadmin'],
      },
      {
        key: 'attendance',
        title: 'Asistencia',
        icon: CheckSquare,
        action: () => onNavigate('attendance'),
        fallbackRoles: ['coordinador', 'asistente', 'admin', 'director', 'superadmin', 'docente'],
      },
      {
        key: 'reports',
        title: 'Reportes',
        icon: FileText,
        action: () => onNavigate('reports'),
        fallbackRoles: ['director', 'coordinador', 'admin', 'superadmin'],
      },
    ];

    dynamicItems.forEach(item => {
      // Si estamos cargando los permisos, usar fallback
      if (permissionsLoading) {
        const isVisibleByFallback = hasRole(item.fallbackRoles);
        if (isVisibleByFallback) {
          items.push({
            title: item.title,
            icon: item.icon,
            action: item.action,
            visible: true,
          });
        }
        return;
      }

      // Usar configuración dinámica si está disponible, sino usar roles de fallback
      const isVisibleByConfig = sidebarPermissions[item.key];
      const isVisibleByFallback = hasRole(item.fallbackRoles);
      
      console.log(`Item ${item.key}:`, {
        configPermission: isVisibleByConfig,
        fallbackPermission: isVisibleByFallback,
        hasConfigPermission: isVisibleByConfig !== undefined
      });
      
      // Si hay configuración dinámica, usarla; sino usar fallback
      const visible = isVisibleByConfig !== undefined ? isVisibleByConfig : isVisibleByFallback;

      if (visible) {
        items.push({
          title: item.title,
          icon: item.icon,
          action: item.action,
          visible: true,
        });
      }
    });

    // Configuración - usar configuración dinámica o fallback
    if (permissionsLoading) {
      // Mientras cargan los permisos, usar fallback
      if (hasRole(['superadmin', 'admin'])) {
        items.push({
          title: 'Configuración',
          icon: Settings,
          action: () => onNavigate('settings'),
          visible: true,
        });
      }
    } else {
      const settingsVisible = sidebarPermissions['settings'] !== undefined 
        ? sidebarPermissions['settings'] 
        : hasRole(['superadmin', 'admin']);

      console.log('Settings visibility:', {
        configPermission: sidebarPermissions['settings'],
        fallbackPermission: hasRole(['superadmin', 'admin']),
        finalDecision: settingsVisible
      });

      if (settingsVisible) {
        items.push({
          title: 'Configuración',
          icon: Settings,
          action: () => onNavigate('settings'),
          visible: true,
        });
      }
    }

    console.log('Final menu items:', items);
    return items.filter(item => item.visible);
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Sistema Académico</h2>
          <div className="space-y-1">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={item.action} className="w-full justify-start">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
