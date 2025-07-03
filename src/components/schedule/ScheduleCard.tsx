
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createDateFromString } from '@/lib/timeUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ResponsiveGrid from '../ResponsiveGrid';
import EditScheduleDialog from './EditScheduleDialog';

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
  estado: string;
  observaciones?: string;
  cumplido?: boolean;
  subject?: {
    name: string;
    code: string;
  };
  teacher?: {
    full_name: string;
  };
  group?: {
    name: string;
  };
}

interface ScheduleCardProps {
  schedule: Schedule;
  isTeacherOnly: boolean;
  canManageSchedules: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ 
  schedule, 
  isTeacherOnly, 
  canManageSchedules 
}) => {
  const queryClient = useQueryClient();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const deleteScheduleMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('schedules')
        .update({ estado: 'cancelado' })
        .eq('id', schedule.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Cronograma cancelado exitosamente');
    },
    onError: (error) => {
      console.error('Error canceling schedule:', error);
      toast.error('Error al cancelar el cronograma');
    }
  });

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleCancel = () => {
    if (confirm('¿Estás seguro de que quieres cancelar este cronograma?')) {
      deleteScheduleMutation.mutate();
    }
  };

  const handleScheduleUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['schedules'] });
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'programado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_curso': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completado': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'programado': return 'Programado';
      case 'en_curso': return 'En Curso';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const getModalidadColor = (modalidad: string) => {
    switch (modalidad) {
      case 'presencial': return 'bg-green-50 text-green-700 border-green-200';
      case 'virtual': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'hibrida': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">
                {schedule.subject?.name || 'Materia no disponible'}
                {schedule.group?.name && ` - ${schedule.group.name}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {schedule.subject?.code && `${schedule.subject.code} • `}
                {!isTeacherOnly && schedule.teacher?.full_name && `Docente: ${schedule.teacher.full_name}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(schedule.estado)}>
                {getStatusText(schedule.estado)}
              </Badge>
              <Badge variant="outline" className={getModalidadColor(schedule.modalidad)}>
                {schedule.modalidad}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 4 }} gap="sm">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {format(createDateFromString(schedule.fecha), 'PPP', { locale: es })}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {schedule.hora_inicio} - {schedule.hora_fin}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {schedule.modalidad === 'presencial' 
                  ? (schedule.aula || 'Aula no asignada') 
                  : schedule.modalidad
                }
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {schedule.cumplido ? 'Cumplido' : 'Pendiente'}
              </span>
            </div>
          </ResponsiveGrid>
          
          {schedule.observaciones && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Observaciones:</strong> {schedule.observaciones}
              </p>
            </div>
          )}

          {canManageSchedules && schedule.estado !== 'cancelado' && (
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
                disabled={deleteScheduleMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteScheduleMutation.isPending ? 'Cancelando...' : 'Cancelar'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EditScheduleDialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        schedule={schedule}
        onScheduleUpdated={handleScheduleUpdated}
      />
    </>
  );
};

export default ScheduleCard;
