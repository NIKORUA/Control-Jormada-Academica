
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

interface EmptyScheduleStateProps {
  searchTerm: string;
  filterStatus: string;
  isTeacherOnly: boolean;
  canManageSchedules: boolean;
  onCreateSchedule: () => void;
}

const EmptyScheduleState: React.FC<EmptyScheduleStateProps> = ({
  searchTerm,
  filterStatus,
  isTeacherOnly,
  canManageSchedules,
  onCreateSchedule
}) => {
  const hasFilters = searchTerm || filterStatus !== 'all';

  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-medium">No hay cronogramas</h3>
          <p className="text-muted-foreground">
            {hasFilters 
              ? 'No se encontraron cronogramas con los filtros aplicados'
              : isTeacherOnly 
                ? 'No tienes cronogramas programados'
                : 'No hay cronogramas programados'
            }
          </p>
          {canManageSchedules && !hasFilters && !isTeacherOnly && (
            <Button 
              onClick={onCreateSchedule}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Cronograma
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyScheduleState;
