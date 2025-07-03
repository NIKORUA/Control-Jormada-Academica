
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ScheduleHeaderProps {
  isTeacherOnly: boolean;
  canManageSchedules: boolean;
  onNewScheduleClick: () => void;
}

/**
 * Componente para el encabezado de la página de gestión de cronogramas.
 * Muestra el título y el botón para crear un nuevo cronograma.
 */
const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ isTeacherOnly, canManageSchedules, onNewScheduleClick }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        {isTeacherOnly ? 'Mi Cronograma' : 'Gestión de Cronogramas'}
      </h1>
      <p className="text-muted-foreground">
        {isTeacherOnly 
          ? 'Tu cronograma de clases programadas' 
          : 'Administra los cronogramas de clases'
        }
      </p>
    </div>
    {canManageSchedules && (
      <Button 
        className="w-full sm:w-auto"
        onClick={onNewScheduleClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Cronograma
      </Button>
    )}
  </div>
);

export default ScheduleHeader;
