
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createDateFromString } from '@/lib/timeUtils';

const TeacherSchedule: React.FC = () => {
  const { user } = useAuth();

  const { data: schedules, isLoading, error } = useQuery({
    queryKey: ['teacher-schedules', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      console.log('Fetching teacher schedules for:', user.id);
      
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          subject:subjects(name, code),
          group:groups(name, code, max_students)
        `)
        .eq('teacher_id', user.id)
        .gte('fecha', new Date().toISOString().split('T')[0])
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching teacher schedules:', error);
        throw error;
      }

      console.log('Teacher schedules fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const getModalidadColor = (modalidad: string) => {
    switch (modalidad) {
      case 'presencial':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'virtual':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hibrida':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en_curso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Mi Cronograma</CardTitle>
          <CardDescription>Próximas clases programadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Mi Cronograma</CardTitle>
          <CardDescription>Próximas clases programadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2 text-red-600">Error al cargar</h3>
            <p className="text-muted-foreground text-sm">
              No se pudo cargar tu cronograma. Intenta recargar la página.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Mi Cronograma</CardTitle>
        <CardDescription>
          Próximas clases programadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!schedules || schedules.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay clases programadas</h3>
            <p className="text-muted-foreground text-sm">
              No tienes clases programadas para los próximos días.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div 
                key={schedule.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm sm:text-base">
                      {schedule.subject?.name || 'Materia no disponible'}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {schedule.subject?.code && `${schedule.subject.code} - `}
                      {schedule.group?.name || 'Grupo no disponible'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="secondary" 
                      className={getModalidadColor(schedule.modalidad)}
                    >
                      {schedule.modalidad}
                    </Badge>
                    <Badge 
                      variant="secondary"
                      className={getEstadoColor(schedule.estado)}
                    >
                      {schedule.estado.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">
                      {format(createDateFromString(schedule.fecha), 'PPP', { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">
                      {schedule.hora_inicio} - {schedule.hora_fin}
                    </span>
                  </div>
                  {(schedule.aula || schedule.modalidad !== 'presencial') && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">
                        {schedule.modalidad === 'presencial' 
                          ? schedule.aula || 'Aula no asignada'
                          : schedule.modalidad
                        }
                      </span>
                    </div>
                  )}
                </div>

                {schedule.observaciones && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs sm:text-sm">
                    <strong>Observaciones:</strong> {schedule.observaciones}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherSchedule;
