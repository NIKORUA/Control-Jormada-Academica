
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Settings } from 'lucide-react';
import { useSidebarOptions, useUpdateSidebarPermission } from '@/hooks/useSidebarConfig';
import { UserRole } from '@/types/sidebar';

const ROLES_DISPLAY: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  director: 'Director',
  coordinador: 'Coordinador',
  asistente: 'Asistente',
  docente: 'Docente'
};

const ROLES_ORDER: UserRole[] = ['superadmin', 'admin', 'director', 'coordinador', 'asistente', 'docente'];

const SidebarConfigManagement: React.FC = () => {
  const { data: options, isLoading, error } = useSidebarOptions();
  const updatePermission = useUpdateSidebarPermission();
  const [updatingPermissions, setUpdatingPermissions] = useState<Set<string>>(new Set());

  const handlePermissionChange = async (optionId: string, role: UserRole, enabled: boolean) => {
    const key = `${optionId}-${role}`;
    setUpdatingPermissions(prev => new Set(prev).add(key));
    
    console.log('Changing permission:', { optionId, role, enabled });
    
    try {
      await updatePermission.mutateAsync({ optionId, role, enabled });
      console.log('Permission updated successfully');
    } catch (error) {
      console.error('Failed to update permission:', error);
    } finally {
      setUpdatingPermissions(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar la configuración del sidebar: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Configuración del Sidebar</h1>
        </div>
        <p className="text-muted-foreground">
          Gestiona qué opciones del menú lateral están disponibles para cada rol de usuario.
        </p>
      </div>

      <div className="space-y-4">
        {options?.map(option => {
          const getPermissionForRole = (role: UserRole) => {
            return option.permissions.find(p => p.role === role);
          };

          return (
            <Card key={option.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {option.title}
                  <Badge variant="outline">{option.option_key}</Badge>
                </CardTitle>
                {option.description && (
                  <CardDescription>{option.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ROLES_ORDER.map(role => {
                      const permission = getPermissionForRole(role);
                      const isEnabled = permission?.enabled ?? option.default_enabled;
                      const isUpdating = updatingPermissions.has(`${option.id}-${role}`);

                      console.log(`Permission for ${option.option_key} - ${role}:`, {
                        permission,
                        isEnabled,
                        defaultEnabled: option.default_enabled
                      });

                      return (
                        <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">{ROLES_DISPLAY[role]}</div>
                            <div className="text-sm text-muted-foreground">{role}</div>
                          </div>
                          <Switch
                            checked={isEnabled}
                            disabled={isUpdating}
                            onCheckedChange={(checked) => {
                              console.log('Switch changed:', { option: option.option_key, role, checked });
                              handlePermissionChange(option.id, role, checked);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SidebarConfigManagement;
