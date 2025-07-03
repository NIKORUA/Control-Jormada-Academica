
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle } from 'lucide-react';
import ScheduleCompletionCard from './ScheduleCompletionCard';

// Define la estructura de un objeto de cronograma para este componente.
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

interface SchedulePendingListProps {
  schedules: Schedule[];
  canMarkCompletion: boolean;
}

/**
 * Componente que muestra una lista de cronogramas agrupados por estado de cumplimiento (pendientes y cumplidos).
 * Permite a los usuarios con permisos marcar el cumplimiento de una asignatura.
 */
const SchedulePendingList: React.FC<SchedulePendingListProps> = ({ 
  schedules, 
  canMarkCompletion 
}) => {
  // Filtra los cronogramas en dos listas: pendientes y cumplidos.
  const pendingSchedules = schedules.filter(s => !s.cumplido);
  const completedSchedules = schedules.filter(s => s.cumplido);

  // Muestra un mensaje si no hay cronogramas.
  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">No hay cronogramas</h3>
            <p className="text-muted-foreground">
              No tienes cronogramas programados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderiza las listas de cronogramas pendientes y cumplidos.
  return (
    <div className="space-y-6">
      {pendingSchedules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Asignaturas Pendientes</h2>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {pendingSchedules.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {pendingSchedules.map((schedule) => (
              <ScheduleCompletionCard
                key={schedule.id}
                schedule={schedule}
                canMarkCompletion={canMarkCompletion}
              />
            ))}
          </div>
        </div>
      )}

      {completedSchedules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Asignaturas Cumplidas</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {completedSchedules.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {completedSchedules.map((schedule) => (
              <ScheduleCompletionCard
                key={schedule.id}
                schedule={schedule}
                canMarkCompletion={canMarkCompletion}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePendingList;
