import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { UserProfile } from './types';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUserUpdated: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onClose,
  user,
  onUserUpdated,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    role: (user?.role || 'docente') as 'superadmin' | 'admin' | 'director' | 'coordinador' | 'asistente' | 'docente',
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        username: user.username,
        role: user.role as 'superadmin' | 'admin' | 'director' | 'coordinador' | 'asistente' | 'docente',
      });
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          role: formData.role,
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario actualizado exitosamente');
      onUserUpdated();
      onClose();
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar el usuario');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate();
  };

  const handleResetPassword = () => {
    resetPasswordMutation.mutate();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, full_name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nombre de Usuario</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, username: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'superadmin' | 'admin' | 'director' | 'coordinador' | 'asistente' | 'docente') =>
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="docente">Docente</SelectItem>
                <SelectItem value="coordinador">Coordinador</SelectItem>
                <SelectItem value="asistente">Asistente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="superadmin">Super Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? 'Reseteando...' : 'Resetear Contraseña'}
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
