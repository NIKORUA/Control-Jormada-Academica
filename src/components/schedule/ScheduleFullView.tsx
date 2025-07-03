
import React from 'react';
import ScheduleFilters from './ScheduleFilters';
import ScheduleCard from './ScheduleCard';
import EmptyScheduleState from './EmptyScheduleState';

// Updated Schedule interface to match database structure
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
  subject?: { name: string; code: string; };
  teacher?: { full_name: string; };
  group?: { name: string; };
}

interface ScheduleFullViewProps {
  filteredSchedules: Schedule[];
  isTeacherOnly: boolean;
  canManageSchedules: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  onNewScheduleClick: () => void;
}

/**
 * Componente para la pestaña "Vista Completa".
 * Incluye filtros y la lista de todos los cronogramas.
 */
const ScheduleFullView: React.FC<ScheduleFullViewProps> = ({
  filteredSchedules,
  isTeacherOnly,
  canManageSchedules,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onNewScheduleClick
}) => {
  return (
    <div className="space-y-4">
      <ScheduleFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />
      <div className="space-y-4">
        {filteredSchedules.length === 0 ? (
          <EmptyScheduleState
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            isTeacherOnly={isTeacherOnly}
            canManageSchedules={canManageSchedules}
            onCreateSchedule={onNewScheduleClick}
          />
        ) : (
          filteredSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              isTeacherOnly={isTeacherOnly}
              canManageSchedules={canManageSchedules}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduleFullView;
