
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, Calendar } from 'lucide-react';
import SchedulePendingList from './SchedulePendingList';
import ScheduleStats from './ScheduleStats';
import ScheduleFullView from './ScheduleFullView';

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

interface ScheduleContentProps {
  schedules: Schedule[];
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
 * Componente que renderiza el contenido principal de la gestión de cronogramas,
 * incluyendo las estadísticas y las pestañas de vistas.
 */
const ScheduleContent: React.FC<ScheduleContentProps> = ({
  schedules,
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
    <div className="space-y-6">
      <ScheduleStats schedules={schedules} />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista de Cumplimiento
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Vista Completa
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <SchedulePendingList
            schedules={filteredSchedules}
            canMarkCompletion={isTeacherOnly || canManageSchedules}
          />
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <ScheduleFullView
            filteredSchedules={filteredSchedules}
            isTeacherOnly={isTeacherOnly}
            canManageSchedules={canManageSchedules}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onNewScheduleClick={onNewScheduleClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleContent;
