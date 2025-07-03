
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
import { UserPlus, Search, Edit, Trash, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ResponsiveGrid from './ResponsiveGrid';
import ResponsiveContainer from './ResponsiveContainer';

interface Student {
  id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  semester?: string;
  program?: string;
  is_active: boolean;
  created_at: string;
}

const StudentManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    student_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    semester: '',
    program: ''
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name');
      if (error) throw error;
      return data as Student[];
    }
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('students')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Estudiante creado",
        description: "El estudiante se ha registrado exitosamente.",
      });
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDialogOpen(false);
      resetForm();
      setEditingStudent(null);
      toast({
        title: "Estudiante actualizado",
        description: "La información del estudiante se ha actualizado exitosamente.",
      });
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Estudiante eliminado",
        description: "El estudiante se ha desactivado exitosamente.",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      student_code: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      semester: '',
      program: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudentMutation.mutate({ ...formData, id: editingStudent.id });
    } else {
      createStudentMutation.mutate(formData);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_code: student.student_code,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone: student.phone || '',
      semester: student.semester || '',
      program: student.program || ''
    });
    setIsDialogOpen(true);
  };

  const filteredStudents = students?.filter(student =>
    student.is_active &&
    (student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.student_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (!hasRole(['coordinador', 'asistente', 'admin', 'director', 'superadmin'])) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Acceso Restringido</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No tienes permisos para gestionar estudiantes
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Estudiantes</h1>
            <p className="text-muted-foreground">Administra la información de los estudiantes</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingStudent(null); }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Estudiante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="student_code">Código Estudiantil</Label>
                  <Input
                    id="student_code"
                    value={formData.student_code}
                    onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Nombres</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Apellidos</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="semester">Semestre</Label>
                    <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
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
                    <Label htmlFor="program">Programa</Label>
                    <Select value={formData.program} onValueChange={(value) => setFormData({ ...formData, program: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ingenieria_sistemas">Ingeniería de Sistemas</SelectItem>
                        <SelectItem value="administracion">Administración</SelectItem>
                        <SelectItem value="contaduria">Contaduría</SelectItem>
                        <SelectItem value="derecho">Derecho</SelectItem>
                        <SelectItem value="psicologia">Psicología</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createStudentMutation.isPending || updateStudentMutation.isPending}>
                    {editingStudent ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar estudiantes por nombre, código o email..."
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
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {student.first_name} {student.last_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{student.student_code}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(student)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStudentMutation.mutate(student.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {student.email}
                    </div>
                    {student.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        {student.phone}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {student.semester && (
                        <Badge variant="secondary">
                          Semestre {student.semester}
                        </Badge>
                      )}
                      {student.program && (
                        <Badge variant="outline">
                          {student.program.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        )}

        {filteredStudents.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">No hay estudiantes</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron estudiantes con ese término' : 'Registra el primer estudiante'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default StudentManagement;
