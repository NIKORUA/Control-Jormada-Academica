
import React from 'react';
import ResponsiveContainer from '../ResponsiveContainer';

interface ScheduleLoadingProps {
  isTeacherOnly: boolean;
}

/**
 * Componente que muestra un esqueleto de carga mientras se obtienen
 * los datos de los cronogramas.
 */
const ScheduleLoading: React.FC<ScheduleLoadingProps> = ({ isTeacherOnly }) => (
  <ResponsiveContainer padding="md">
    <div className="space-y-6">
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
      </div>
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded"></div>
        ))}
      </div>
    </div>
  </ResponsiveContainer>
);

export default ScheduleLoading;
