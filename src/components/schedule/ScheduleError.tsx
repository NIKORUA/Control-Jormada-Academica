
import React from 'react';
import ResponsiveContainer from '../ResponsiveContainer';

interface ScheduleErrorProps {
  error: Error | null;
}

/**
 * Componente que se muestra cuando ocurre un error al obtener los cronogramas.
 */
const ScheduleError: React.FC<ScheduleErrorProps> = ({ error }) => (
  <ResponsiveContainer padding="md">
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600">Error</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          No se pudieron cargar los cronogramas. Intenta recargar la página.
        </p>
        <p className="text-xs text-red-500">
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    </div>
  </ResponsiveContainer>
);

export default ScheduleError;
