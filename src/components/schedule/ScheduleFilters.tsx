
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface ScheduleFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por materia, docente, grupo o aula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-full sm:w-48">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="programado">Programado</SelectItem>
          <SelectItem value="en_curso">En Curso</SelectItem>
          <SelectItem value="completado">Completado</SelectItem>
          <SelectItem value="cancelado">Cancelado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScheduleFilters;
