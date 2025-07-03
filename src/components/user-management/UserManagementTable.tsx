import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile } from './types';
import { getRoleDisplayName, getRoleBadgeVariant } from './userManagementUtils';
import UserActionsMenu from './UserActionsMenu';
import EditUserDialog from './EditUserDialog';

interface UserManagementTableProps {
  users: UserProfile[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  isLoading,
  onRefresh,
}) => {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const toggleUserStatusMutation = useMutation({
    mutationFn: async (user: UserProfile) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Estado del usuario actualizado');
    },
    onError: (error) => {
      console.error('Error updating user status:', error);
      toast.error('Error al actualizar el estado del usuario');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (user: UserProfile) => {
      console.log('Resetting password for user:', user.id);
      
      // Usar la función edge para resetear la contraseña
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`https://frcdhduzwnhovkvqgtnu.supabase.co/functions/v1/reset-user-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al resetear la contraseña');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Contraseña reseteada exitosamente. Nueva contraseña temporal: temp123456');
    },
    onError: (error) => {
      console.error('Error resetting password:', error);
      toast.error(`Error al resetear la contraseña: ${error.message}`);
    },
  });

  const handleResetPassword = (user: UserProfile) => {
    resetPasswordMutation.mutate(user);
  };

  const handleChangeRole = (user: UserProfile) => {
    setEditingUser(user);
  };

  const handleToggleStatus = (user: UserProfile) => {
    toggleUserStatusMutation.mutate(user);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando usuarios...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="w-[70px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role) as any}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>
                    <UserActionsMenu
                      user={user}
                      onResetPassword={handleResetPassword}
                      onChangeRole={handleChangeRole}
                      onToggleStatus={handleToggleStatus}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditUserDialog
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUserUpdated={() => onRefresh?.()}
      />
    </>
  );
};

export default UserManagementTable;
