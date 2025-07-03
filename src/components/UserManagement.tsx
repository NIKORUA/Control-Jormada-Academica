
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ResponsiveContainer from './ResponsiveContainer';
import UserManagementTable from './user-management/UserManagementTable';
import UserManagementFilters from './user-management/UserManagementFilters';
import UserManagementStats from './user-management/UserManagementStats';
import CreateUserDialog from './user-management/CreateUserDialog';
import { Users, Plus, RefreshCw } from 'lucide-react';
import { UserProfile, UserFilters } from './user-management/types';

/**
 * Componente principal para la gestión de usuarios.
 * Permite crear, editar, filtrar y administrar usuarios del sistema.
 */
const UserManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all'
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Consulta para obtener los usuarios
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      console.log('Fetching users with filters:', filters);
      
      let query = supabase
        .from('profiles')
        .select('id, username, full_name, role, is_active, created_at');

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`username.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
      }

      if (filters.role !== 'all') {
        // Cast the role to the proper type since we know it's a valid role when not 'all'
        query = query.eq('role', filters.role as 'superadmin' | 'admin' | 'director' | 'coordinador' | 'asistente' | 'docente');
      }

      if (filters.status !== 'all') {
        query = query.eq('is_active', filters.status === 'active');
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Users fetched:', data);
      return data as UserProfile[];
    },
    enabled: hasRole(['admin', 'director', 'superadmin'])
  });

  // Verificar permisos de acceso
  if (!hasRole(['admin', 'director', 'superadmin'])) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Acceso Restringido</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No tienes permisos para gestionar usuarios
          </p>
        </div>
      </div>
    );
  }

  const handleFiltersChange = (newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleUserCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  const handleRefresh = () => {
    refetch();
  };

  // Mostrar error si hay uno
  if (error) {
    return (
      <ResponsiveContainer padding="md">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600">Error</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Error al cargar los usuarios: {error.message}
            </p>
            <button onClick={handleRefresh} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </button>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer padding="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh} 
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button 
              onClick={() => setShowCreateDialog(true)} 
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <UserManagementStats users={users} isLoading={isLoading} />

        {/* Filtros */}
        <UserManagementFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
        />

        {/* Tabla de usuarios */}
        <UserManagementTable 
          users={users} 
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />

        {/* Diálogo de creación */}
        <CreateUserDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onUserCreated={handleUserCreated}
        />
      </div>
    </ResponsiveContainer>
  );
};

export default UserManagement;
