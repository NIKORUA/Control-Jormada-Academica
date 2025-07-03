
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const subjectSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  code: z.string().min(1, 'El código es requerido'),
  credits: z.number().min(1, 'Los créditos deben ser al menos 1').max(10, 'Los créditos no pueden ser más de 10'),
  description: z.string().optional(),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  initialData?: Partial<SubjectFormData>;
  onSubmit: (data: SubjectFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitText?: string;
}

const SubjectForm: React.FC<SubjectFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText = 'Guardar'
}) => {
  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      credits: initialData?.credits || 1,
      description: initialData?.description || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Materia</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Matemáticas I" {...field} />
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
                <Input placeholder="Ej: MAT001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Créditos</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción de la materia..."
                  className="resize-none"
                  {...field}
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

export default SubjectForm;
