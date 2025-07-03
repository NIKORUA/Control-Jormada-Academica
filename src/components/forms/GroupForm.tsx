
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const groupSchema = z.object({
  name: z.string().min(1, 'El nombre del grupo es requerido'),
  code: z.string().min(1, 'El código es requerido'),
  semester: z.string().min(1, 'El semestre es requerido'),
  year: z.number().min(2020, 'El año debe ser válido').max(2030, 'El año debe ser válido'),
  max_students: z.number().min(1, 'Debe haber al menos 1 estudiante').max(100, 'No puede haber más de 100 estudiantes'),
  subject_id: z.string().min(1, 'Debe seleccionar una materia'),
});

export type GroupFormData = z.infer<typeof groupSchema>;

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface GroupFormProps {
  initialData?: Partial<GroupFormData>;
  subjects: Subject[];
  onSubmit: (data: GroupFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitText?: string;
}

const GroupForm: React.FC<GroupFormProps> = ({
  initialData,
  subjects,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText = 'Guardar'
}) => {
  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      semester: initialData?.semester || '',
      year: initialData?.year || new Date().getFullYear(),
      max_students: initialData?.max_students || 30,
      subject_id: initialData?.subject_id || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="subject_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materia</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Grupo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Grupo A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: MAT001-A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semestre</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona semestre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Primer Semestre</SelectItem>
                    <SelectItem value="2">Segundo Semestre</SelectItem>
                    <SelectItem value="3">Tercer Semestre</SelectItem>
                    <SelectItem value="4">Cuarto Semestre</SelectItem>
                    <SelectItem value="5">Quinto Semestre</SelectItem>
                    <SelectItem value="6">Sexto Semestre</SelectItem>
                    <SelectItem value="7">Séptimo Semestre</SelectItem>
                    <SelectItem value="8">Octavo Semestre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="2020"
                    max="2030"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="max_students"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Máximo de Estudiantes</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GroupForm;
