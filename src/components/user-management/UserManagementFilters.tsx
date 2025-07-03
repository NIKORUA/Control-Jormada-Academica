
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { UserFilters } from './types';

interface UserManagementFiltersProps {
  filters: UserFilters;
  onFiltersChange: (newFilters: Partial<UserFilters>) => void;
}

const UserManagementFilters: React.FC<UserManagementFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros y Búsqueda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar usuario</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por nombre o usuario..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>
          <div className="w-48">
            <Label htmlFor="role-filter">Filtrar por rol</Label>
            <Select value={filters.role} onValueChange={(value) => onFiltersChange({ role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="superadmin">Super Administrador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="coordinador">Coordinador</SelectItem>
                <SelectItem value="asistente">Asistente</SelectItem>
                <SelectItem value="docente">Docente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Label htmlFor="status-filter">Estado</Label>
            <Select value={filters.status} onValueChange={(value) => onFiltersChange({ status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagementFilters;
