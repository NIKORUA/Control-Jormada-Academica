
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserFormData } from './types';
import { useCreateUser } from './hooks/useCreateUser';

const userFormSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  fullName: z.string().min(2, 'El nombre completo es requerido'),
  role: z.enum(['superadmin', 'admin', 'director', 'coordinador', 'asistente', 'docente']),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onClose,
  onUserCreated,
}) => {
  const { createUser, loading } = useCreateUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      role: 'docente',
      password: '',
    },
  });

  const handleCreateUser = async (data: UserFormData) => {
    const result = await createUser(data);
    if (result.success) {
      form.reset();
      onClose();
      onUserCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo usuario
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo del usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@academico.edu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="docente">Docente</SelectItem>
                      <SelectItem value="asistente">Asistente Académico</SelectItem>
                      <SelectItem value="coordinador">Coordinador Académico</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="superadmin">Super Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
