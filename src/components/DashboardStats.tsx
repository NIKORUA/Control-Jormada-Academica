
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import ResponsiveGrid from './ResponsiveGrid';

const DashboardStats: React.FC = () => {
  const { user, hasRole } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const results = await Promise.allSettled([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('subjects').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('schedules').select('id', { count: 'exact' }),
        supabase.from('students').select('id', { count: 'exact' }).eq('is_active', true),
      ]);

      return {
        totalTeachers: results[0].status === 'fulfilled' ? results[0].value.count || 0 : 0,
        totalSubjects: results[1].status === 'fulfilled' ? results[1].value.count || 0 : 0,
        totalSchedules: results[2].status === 'fulfilled' ? results[2].value.count || 0 : 0,
        totalStudents: results[3].status === 'fulfilled' ? results[3].value.count || 0 : 0,
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 4 }} gap="md">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </ResponsiveGrid>
    );
  }

  const getStatsForRole = () => {
    if (hasRole(['docente'])) {
      return [
        {
          title: 'Mis Materias',
          value: stats?.totalSubjects || 0,
          icon: BookOpen,
          description: 'Asignaturas asignadas',
        },
        {
          title: 'Mis Cronogramas',
          value: stats?.totalSchedules || 0,
          icon: Calendar,
          description: 'Jornadas programadas',
        },
      ];
    }

    return [
      {
        title: 'Total Docentes',
        value: stats?.totalTeachers || 0,
        icon: Users,
        description: 'Profesores registrados',
      },
      {
        title: 'Materias Activas',
        value: stats?.totalSubjects || 0,
        icon: BookOpen,
        description: 'Asignaturas disponibles',
      },
      {
        title: 'Cronogramas',
        value: stats?.totalSchedules || 0,
        icon: Calendar,
        description: 'Jornadas programadas',
      },
      {
        title: 'Estudiantes',
        value: stats?.totalStudents || 0,
        icon: GraduationCap,
        description: 'Estudiantes activos',
      },
    ];
  };

  const statsToShow = getStatsForRole();

  return (
    <ResponsiveGrid 
      cols={{ base: 1, sm: 2, lg: hasRole(['docente']) ? 2 : 4 }} 
      gap="md"
    >
      {statsToShow.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </ResponsiveGrid>
  );
};

export default DashboardStats;
