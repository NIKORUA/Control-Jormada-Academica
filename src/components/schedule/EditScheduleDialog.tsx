import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';
import { calculateHours45, getCurrentDateInColombia } from '@/lib/timeUtils';

interface Schedule {
  id: string;
  teacher_id: string;
  subject_id: string;
  group_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  aula?: string;
  modalidad: string;
  observaciones?: string;
  estado: string;
}

interface EditScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onScheduleUpdated: () => void;
}

const EditScheduleDialog: React.FC<EditScheduleDialogProps> = ({
  open,
  onClose,
  schedule,
  onScheduleUpdated,
}) => {
  const queryClient = useQueryClient();
  

  const [formData, setFormData] = useState({
    teacher_id: '',
    subject_id: '',
    group_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    aula: '',
    modalidad: 'presencial' as 'presencial' | 'virtual' | 'hibrida',
    observaciones: '',
    estado: 'programado' as 'programado' | 'en_curso' | 'completado' | 'cancelado',
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        teacher_id: schedule.teacher_id,
        subject_id: schedule.subject_id,
        group_id: schedule.group_id,
        fecha: schedule.fecha,
        hora_inicio: schedule.hora_inicio,
        hora_fin: schedule.hora_fin,
        aula: schedule.aula || '',
        modalidad: schedule.modalidad as 'presencial' | 'virtual' | 'hibrida',
        observaciones: schedule.observaciones || '',
        estado: schedule.estado as 'programado' | 'en_curso' | 'completado' | 'cancelado',
      });
    }
  }, [schedule]);

  // Fetch teachers
  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .eq('role', 'docente')
        .eq('is_active', true)
        .order('full_name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch groups
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async () => {
      if (!schedule) return;

      const { data, error } = await supabase
        .from('schedules')
        .update({
          teacher_id: formData.teacher_id,
          subject_id: formData.subject_id,
          group_id: formData.group_id,
          fecha: formData.fecha,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          aula: formData.aula || null,
          modalidad: formData.modalidad,
          observaciones: formData.observaciones || null,
          estado: formData.estado,
        })
        .eq('id', schedule.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Cronograma actualizado exitosamente');
      onScheduleUpdated();
      onClose();
    },
    onError: (error) => {
      console.error('Error updating schedule:', error);
      toast.error('Error al actualizar el cronograma');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacher_id || !formData.subject_id || !formData.group_id || 
        !formData.fecha || !formData.hora_inicio || !formData.hora_fin) {
      toast.error('Todos los campos obligatorios deben ser completados');
      return;
    }

    if (formData.hora_inicio >= formData.hora_fin) {
      toast.error('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    updateScheduleMutation.mutate();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!schedule) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cronograma</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teacher">Docente *</Label>
              <Select 
                value={formData.teacher_id} 
                onValueChange={(value) => handleInputChange('teacher_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar docente" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Materia *</Label>
              <Select 
                value={formData.subject_id} 
                onValueChange={(value) => handleInputChange('subject_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar materia" />
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

            <div className="space-y-2">
              <Label htmlFor="group">Grupo *</Label>
              <Select 
                value={formData.group_id} 
                onValueChange={(value) => handleInputChange('group_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.code} - {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora Inicio *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_fin">Hora Fin *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hora_fin"
                  type="time"
                  value={formData.hora_fin}
                  onChange={(e) => handleInputChange('hora_fin', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalidad">Modalidad</Label>
              <Select 
                value={formData.modalidad} 
                onValueChange={(value: 'presencial' | 'virtual' | 'hibrida') => handleInputChange('modalidad', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hibrida">Híbrida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select 
                value={formData.estado} 
                onValueChange={(value: 'programado' | 'en_curso' | 'completado' | 'cancelado') => handleInputChange('estado', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programado">Programado</SelectItem>
                  <SelectItem value="en_curso">En Curso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aula">Aula</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="aula"
                  type="text"
                  value={formData.aula}
                  onChange={(e) => handleInputChange('aula', e.target.value)}
                  placeholder="Aula o enlace virtual"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateScheduleMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateScheduleMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditScheduleDialog;
