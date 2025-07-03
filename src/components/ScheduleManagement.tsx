
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ResponsiveContainer from './ResponsiveContainer';
import NewScheduleForm from './forms/NewScheduleForm';
import ScheduleRestricted from './schedule/ScheduleRestricted';
import ScheduleLoading from './schedule/ScheduleLoading';
import ScheduleError from './schedule/ScheduleError';
import ScheduleHeader from './schedule/ScheduleHeader';
import ScheduleContent from './schedule/ScheduleContent';

/**
 * Componente principal para la gestión de cronogramas.
 * Encapsula la lógica de obtención de datos, manejo de estados (carga, error, etc.)
 * y delega la renderización a componentes más pequeños y especializados.
 */
const ScheduleManagement: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);

  // Hook de React Query para obtener los cronogramas desde la base de datos.
  // La consulta se vuelve a ejecutar si cambian las dependencias en `queryKey`.
  const { data: schedules, isLoading, error, refetch } = useQuery({
    queryKey: ['schedules', user?.id, hasRole(['docente'])],
    queryFn: async () => {
      console.log('Obteniendo cronogramas para el usuario:', user?.id, 'Verificación de rol - es Docente:', hasRole(['docente']));
      
      let query = supabase
        .from('schedules')
        .select(`
          *,
          teacher:profiles!schedules_teacher_id_fkey(full_name, username),
          subject:subjects(name, code),
          group:groups(name, code)
        `)
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true });

      // Si el usuario es solo un docente, filtra los cronogramas para mostrar solo los suyos.
      if (hasRole(['docente']) && !hasRole(['coordinador', 'asistente', 'admin', 'director', 'superadmin'])) {
        query = query.eq('teacher_id', user?.id);
        console.log('Filtrando cronogramas para el docente:', user?.id);
      }

      const { data, error: queryError } = await query;
      
      if (queryError) {
        console.error('Error obteniendo cronogramas:', queryError);
        throw queryError;
      }
      
      console.log('Cronogramas obtenidos:', data?.length || 0);
      return data || [];
    },
    enabled: !!user, // La consulta solo se ejecuta si hay un usuario autenticado.
  });

  // Filtra los cronogramas localmente según el término de búsqueda y el estado.
  const filteredSchedules = schedules?.filter(schedule => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      schedule.subject?.name?.toLowerCase().includes(searchTermLower) ||
      schedule.teacher?.full_name?.toLowerCase().includes(searchTermLower) ||
      schedule.group?.name?.toLowerCase().includes(searchTermLower) ||
      (schedule.aula && schedule.aula.toLowerCase().includes(searchTermLower));
    
    const matchesFilter = filterStatus === 'all' || schedule.estado === filterStatus;
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Determina los permisos del usuario para la gestión de cronogramas.
  const isTeacherOnly = hasRole(['docente']) && !hasRole(['coordinador', 'asistente', 'admin', 'director', 'superadmin']);
  const canManageSchedules = hasRole(['coordinador', 'asistente', 'admin', 'director', 'superadmin']);
  
  // Debug: Verificar roles del usuario
  console.log('Usuario actual:', user);
  console.log('Rol del usuario:', user?.role);
  console.log('¿Puede gestionar cronogramas?:', canManageSchedules);
  console.log('¿Es solo docente?:', isTeacherOnly);

  /**
   * Callback que se ejecuta cuando un nuevo cronograma se crea exitosamente.
   * Refresca la lista de cronogramas para mostrar el nuevo registro.
   */
  const handleNewScheduleSuccess = () => {
    refetch();
  };

  // Renderizado condicional: Muestra un mensaje de acceso restringido si el usuario no tiene el rol adecuado.
  if (!hasRole(['coordinador', 'asistente', 'admin', 'director', 'superadmin', 'docente'])) {
    return <ScheduleRestricted />;
  }

  // Renderizado condicional: Muestra un esqueleto de carga mientras se obtienen los datos.
  if (isLoading) {
    return <ScheduleLoading isTeacherOnly={isTeacherOnly} />;
  }

  // Renderizado condicional: Muestra un mensaje de error si falla la obtención de datos.
  if (error) {
    return <ScheduleError error={error as Error | null} />;
  }

  // Renderizado principal del componente.
  return (
    <ResponsiveContainer padding="md">
      <div className="space-y-6">
        <ScheduleHeader 
          isTeacherOnly={isTeacherOnly}
          canManageSchedules={canManageSchedules}
          onNewScheduleClick={() => setShowNewScheduleModal(true)}
        />
        
        <ScheduleContent
          schedules={schedules || []}
          filteredSchedules={filteredSchedules}
          isTeacherOnly={isTeacherOnly}
          canManageSchedules={canManageSchedules}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          onNewScheduleClick={() => setShowNewScheduleModal(true)}
        />

        {/* Modal para crear un nuevo cronograma. */}
        <Dialog open={showNewScheduleModal} onOpenChange={setShowNewScheduleModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Cronograma</DialogTitle>
            </DialogHeader>
            <NewScheduleForm 
              onClose={() => setShowNewScheduleModal(false)}
              onSuccess={handleNewScheduleSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveContainer>
  );
};

export default ScheduleManagement;
