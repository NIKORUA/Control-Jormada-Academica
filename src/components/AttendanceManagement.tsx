
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { createDateFromString } from '@/lib/timeUtils';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import ResponsiveGrid from './ResponsiveGrid';
import ResponsiveContainer from './ResponsiveContainer';

interface Attendance {
  id: string;
  schedule_id: string;
  student_id: string;
  present: boolean;
  late: boolean;
  excused: boolean;
  notes?: string;
  recorded_at: string;
  schedules?: {
    fecha: string;
    hora_inicio: string;
    subjects: {
      name: string;
      code: string;
    };
    groups: {
      name: string;
    };
  };
  students?: {
    first_name: string;
    last_name: string;
    student_code: string;
  };
}

interface Schedule {
  id: string;
  fecha: string;
  hora_inicio: string;
  subjects: {
    name: string;
    code: string;
  };
  groups: {
    name: string;
  };
}

const AttendanceManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');

  const { data: schedules } = useQuery({
    queryKey: ['schedules-for-attendance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          id,
          fecha,
          hora_inicio,
          subjects (name, code),
          groups (name)
        `)
        .eq('estado', 'completado')
        .order('fecha', { ascending: false });
      if (error) throw error;
      return data as Schedule[];
    }
  });

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', selectedSchedule],
    queryFn: async () => {
      if (!selectedSchedule) return [];
      
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          schedules (
            fecha,
            hora_inicio,
            subjects (name, code),
            groups (name)
          ),
          students (
            first_name,
            last_name,
            student_code
          )
        `)
        .eq('schedule_id', selectedSchedule)
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!selectedSchedule
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Attendance> }) => {
      const { error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Asistencia actualizada",
        description: "La asistencia se ha actualizado exitosamente.",
      });
    }
  });

  const getStatusColor = (attendance: Attendance) => {
    if (attendance.present && !attendance.late) return 'bg-green-100 text-green-800';
    if (attendance.present && attendance.late) return 'bg-yellow-100 text-yellow-800';
    if (attendance.excused) return 'bg-blue-100 text-blue-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (attendance: Attendance) => {
    if (attendance.present && !attendance.late) return 'Presente';
    if (attendance.present && attendance.late) return 'Tardanza';
    if (attendance.excused) return 'Justificado';
    return 'Ausente';
  };

  const getStatusIcon = (attendance: Attendance) => {
    if (attendance.present && !attendance.late) return CheckCircle;
    if (attendance.present && attendance.late) return AlertCircle;
    if (attendance.excused) return AlertCircle;
    return XCircle;
  };

  const filteredAttendance = attendance?.filter(record => {
    const matchesSearch = 
      record.students?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.students?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.students?.student_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'present') matchesFilter = record.present && !record.late;
    if (filterStatus === 'late') matchesFilter = record.present && record.late;
    if (filterStatus === 'absent') matchesFilter = !record.present && !record.excused;
    if (filterStatus === 'excused') matchesFilter = record.excused;
    
    return matchesSearch && matchesFilter;
  }) || [];

  if (!hasRole(['coordinador', 'asistente', 'admin', 'director', 'superadmin', 'docente'])) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Acceso Restringido</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No tienes permisos para gestionar asistencia
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer padding="md">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Asistencia</h1>
            <p className="text-muted-foreground">Administra la asistencia de estudiantes</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Selecciona una clase" />
              </SelectTrigger>
              <SelectContent>
                {schedules?.map((schedule) => (
                  <SelectItem key={schedule.id} value={schedule.id}>
                    {schedule.subjects.code} - {schedule.groups.name} ({format(createDateFromString(schedule.fecha), 'dd/MM/yyyy')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar estudiantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="present">Presente</SelectItem>
                <SelectItem value="late">Tardanza</SelectItem>
                <SelectItem value="absent">Ausente</SelectItem>
                <SelectItem value="excused">Justificado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de asistencia */}
        {selectedSchedule ? (
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAttendance.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">No hay registros de asistencia</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'No se encontraron registros con los filtros aplicados'
                        : 'No hay registros para esta clase'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 3 }} gap="md">
                {filteredAttendance.map((record) => {
                  const StatusIcon = getStatusIcon(record);
                  return (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {record.students?.first_name} {record.students?.last_name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {record.students?.student_code}
                            </p>
                          </div>
                          <Badge className={getStatusColor(record)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusText(record)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2" />
                            Registrado: {format(new Date(record.recorded_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </div>
                          {record.notes && (
                            <div className="p-3 bg-muted rounded-md">
                              <p className="text-sm text-muted-foreground">
                                <strong>Observaciones:</strong> {record.notes}
                              </p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant={record.present && !record.late ? "default" : "outline"}
                              onClick={() => updateAttendanceMutation.mutate({
                                id: record.id,
                                updates: { present: true, late: false, excused: false }
                              })}
                            >
                              Presente
                            </Button>
                            <Button
                              size="sm"
                              variant={record.present && record.late ? "default" : "outline"}
                              onClick={() => updateAttendanceMutation.mutate({
                                id: record.id,
                                updates: { present: true, late: true, excused: false }
                              })}
                            >
                              Tardanza
                            </Button>
                            <Button
                              size="sm"
                              variant={record.excused ? "default" : "outline"}
                              onClick={() => updateAttendanceMutation.mutate({
                                id: record.id,
                                updates: { present: false, late: false, excused: true }
                              })}
                            >
                              Justificado
                            </Button>
                            <Button
                              size="sm"
                              variant={!record.present && !record.excused ? "default" : "outline"}
                              onClick={() => updateAttendanceMutation.mutate({
                                id: record.id,
                                updates: { present: false, late: false, excused: false }
                              })}
                            >
                              Ausente
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </ResponsiveGrid>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">Selecciona una clase</h3>
                <p className="text-muted-foreground">
                  Elige una clase para ver y gestionar la asistencia
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default AttendanceManagement;
