
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Search, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ResponsiveGrid from './ResponsiveGrid';
import ResponsiveContainer from './ResponsiveContainer';

interface Group {
  id: string;
  name: string;
  code: string;
  semester: string;
  year: number;
  max_students: number;
  is_active: boolean;
  subject_id: string;
  subjects?: {
    name: string;
    code: string;
  };
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

const GroupManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: '',
    year: new Date().getFullYear(),
    max_students: 30,
    subject_id: ''
  });

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          subjects (
            name,
            code
          )
        `)
        .order('name');
      if (error) throw error;
      return data as Group[];
    }
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects-for-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Subject[];
    }
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('groups')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Grupo creado",
        description: "El grupo se ha creado exitosamente.",
      });
    }
  });

  const updateGroupMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from('groups')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setIsDialogOpen(false);
      resetForm();
      setEditingGroup(null);
      toast({
        title: "Grupo actualizado",
        description: "El grupo se ha actualizado exitosamente.",
      });
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('groups')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: "Grupo eliminado",
        description: "El grupo se ha desactivado exitosamente.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      semester: '',
      year: new Date().getFullYear(),
      max_students: 30,
      subject_id: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup) {
      updateGroupMutation.mutate({ ...formData, id: editingGroup.id });
    } else {
      createGroupMutation.mutate(formData);
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      code: group.code,
      semester: group.semester,
      year: group.year,
      max_students: group.max_students,
      subject_id: group.subject_id
    });
    setIsDialogOpen(true);
  };

  const filteredGroups = groups?.filter(group =>
    group.is_active &&
    (group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     group.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
     group.subjects?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (!hasRole(['coordinador', 'asistente', 'admin', 'director', 'superadmin'])) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Acceso Restringido</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No tienes permisos para gestionar grupos
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Grupos</h1>
            <p className="text-muted-foreground">Administra los grupos académicos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingGroup(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject_id">Materia</Label>
                  <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Grupo</Label>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="semester">Semestre</Label>
                    <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona semestre" />
                      </SelectTrigger>
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
                  </div>
                  <div>
                    <Label htmlFor="year">Año</Label>
                    <Input
                      id="year"
                      type="number"
                      min="2020"
                      max="2030"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="max_students">Máximo de Estudiantes</Label>
                  <Input
                    id="max_students"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createGroupMutation.isPending || updateGroupMutation.isPending}>
                    {editingGroup ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar grupos..."
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
            {filteredGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{group.code}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGroupMutation.mutate(group.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm font-medium">
                      {group.subjects?.code} - {group.subjects?.name}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        Semestre {group.semester}
                      </Badge>
                      <Badge variant="outline">
                        {group.year}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      Máximo {group.max_students} estudiantes
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        )}

        {filteredGroups.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">No hay grupos</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron grupos con ese término' : 'Crea el primer grupo'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default GroupManagement;
