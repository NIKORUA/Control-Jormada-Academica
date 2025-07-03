
import React from 'react';
import ResponsiveContainer from '../ResponsiveContainer';

/**
 * Componente que se muestra cuando un usuario no tiene permisos
 * para acceder a la gestión de cronogramas.
 */
const ScheduleRestricted: React.FC = () => (
  <ResponsiveContainer padding="md">
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold">Acceso Restringido</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          No tienes permisos para acceder a la gestión de cronogramas
        </p>
      </div>
    </div>
  </ResponsiveContainer>
);

export default ScheduleRestricted;
