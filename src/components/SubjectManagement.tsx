
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Plus, Search, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ResponsiveGrid from './ResponsiveGrid';
import ResponsiveContainer from './ResponsiveContainer';

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

const SubjectManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 1,
    description: ''
  });

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Subject[];
    }
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('subjects')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Materia creada",
        description: "La materia se ha creado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la materia.",
        variant: "destructive",
      });
    }
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from('subjects')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsDialogOpen(false);
      resetForm();
      setEditingSubject(null);
      toast({
        title: "Materia actualizada",
        description: "La materia se ha actualizado exitosamente.",
      });
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Materia eliminada",
        description: "La materia se ha desactivado exitosamente.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      credits: 1,
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubjectMutation.mutate({ ...formData, id: editingSubject.id });
    } else {
      createSubjectMutation.mutate(formData);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      description: subject.description || ''
    });
    setIsDialogOpen(true);
  };

  const filteredSubjects = subjects?.filter(subject =>
    subject.is_active &&
    (subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     subject.code.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (!hasRole(['coordinador', 'asistente', 'admin', 'director', 'superadmin'])) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Acceso Restringido</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No tienes permisos para gestionar materias
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer padding="md">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Materias</h1>
            <p className="text-muted-foreground">Administra las materias del programa académico</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingSubject(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Materia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSubject ? 'Editar Materia' : 'Nueva Materia'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="credits">Créditos</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createSubjectMutation.isPending || updateSubjectMutation.isPending}>
                    {editingSubject ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 3 }} gap="md">
            {filteredSubjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{subject.code}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(subject)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSubjectMutation.mutate(subject.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">
                      {subject.credits} crédito{subject.credits !== 1 ? 's' : ''}
                    </Badge>
                    {subject.description && (
                      <p className="text-sm text-muted-foreground">{subject.description}</p>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Activa
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        )}

        {filteredSubjects.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">No hay materias</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron materias con ese término' : 'Crea la primera materia'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default SubjectManagement;
