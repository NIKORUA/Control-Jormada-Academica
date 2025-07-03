
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createDateFromString } from '@/lib/timeUtils';
import { toast } from 'sonner';
import ResponsiveGrid from '../ResponsiveGrid';

interface Schedule {
  id: string;
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

interface ScheduleCompletionCardProps {
  schedule: Schedule;
  canMarkCompletion: boolean;
}

const ScheduleCompletionCard: React.FC<ScheduleCompletionCardProps> = ({ 
  schedule, 
  canMarkCompletion 
}) => {
  const queryClient = useQueryClient();

  const markCompletionMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      const { data, error } = await supabase
        .from('schedules')
        .update({ 
          cumplido: completed,
          fecha_cumplimiento: completed ? new Date().toISOString() : null,
          estado: completed ? 'completado' : 'programado'
        })
        .eq('id', schedule.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, completed) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success(completed ? 'Cronograma marcado como cumplido' : 'Cumplimiento desmarcado');
    },
    onError: (error) => {
      console.error('Error updating completion:', error);
      toast.error('Error al actualizar el cumplimiento');
    }
  });

  const handleMarkCompletion = (completed: boolean) => {
    markCompletionMutation.mutate(completed);
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

  return (
    <Card className={`hover:shadow-md transition-shadow ${schedule.cumplido ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">
              {schedule.subject?.name || 'Materia no disponible'}
              {schedule.group?.name && ` - ${schedule.group.name}`}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {schedule.subject?.code && `${schedule.subject.code} • `}
              {schedule.teacher?.full_name && `Docente: ${schedule.teacher.full_name}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(schedule.estado)}>
              {getStatusText(schedule.estado)}
            </Badge>
            <Badge variant={schedule.cumplido ? "default" : "secondary"} className={schedule.cumplido ? "bg-green-600" : ""}>
              {schedule.cumplido ? 'Cumplido' : 'Pendiente'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 3 }} gap="sm">
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
        </ResponsiveGrid>
        
        {schedule.observaciones && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Observaciones:</strong> {schedule.observaciones}
            </p>
          </div>
        )}

        {canMarkCompletion && (
          <div className="mt-4 flex gap-2">
            {!schedule.cumplido ? (
              <Button 
                size="sm" 
                onClick={() => handleMarkCompletion(true)}
                disabled={markCompletionMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {markCompletionMutation.isPending ? 'Marcando...' : 'Marcar Cumplido'}
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleMarkCompletion(false)}
                disabled={markCompletionMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                {markCompletionMutation.isPending ? 'Desmarcando...' : 'Desmarcar'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleCompletionCard;
