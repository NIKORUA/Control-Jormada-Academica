
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Schedule {
  estado: string;
}

interface ScheduleStatsProps {
  schedules: Schedule[];
}

const ScheduleStats: React.FC<ScheduleStatsProps> = ({ schedules }) => {
  if (!schedules || schedules.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{schedules.length}</div>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {schedules.filter(s => s.estado === 'programado').length}
          </div>
          <p className="text-xs text-muted-foreground">Programados</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {schedules.filter(s => s.estado === 'completado').length}
          </div>
          <p className="text-xs text-muted-foreground">Completados</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {schedules.filter(s => s.estado === 'en_curso').length}
          </div>
          <p className="text-xs text-muted-foreground">En Curso</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleStats;
