
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { registerSchema, RegisterFormData } from './schemas';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isDisabled: boolean;
  isSubmitting: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isDisabled, isSubmitting }) => {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      fullName: '',
      role: 'docente',
    },
  });

  const handleSubmit = async (data: RegisterFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tu nombre completo"
                  disabled={isDisabled}
                  {...field}
                />
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
                <Input
                  placeholder="usuario123"
                  disabled={isDisabled}
                  {...field}
                />
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
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  disabled={isDisabled}
                  {...field}
                />
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
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isDisabled}
              >
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
                </SelectContent>
              </Select>
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
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  disabled={isDisabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Repite tu contraseña"
                  disabled={isDisabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isDisabled}
        >
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
