
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Calendar, Users, BookOpen, Filter, Printer } from 'lucide-react';
import ResponsiveGrid from './ResponsiveGrid';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Estados para los filtros
  const [filters, setFilters] = useState({
    teacher: 'all',
    month: 'all',
    year: '2025',
    subject: 'all',
    group: 'all',
    status: 'all',
    modality: 'all'
  });

  const [showResults, setShowResults] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const { toast } = useToast();

  // Consultas para obtener datos para los filtros
  const { data: teachers } = useQuery({
    queryKey: ['teachers-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'docente')
        .eq('is_active', true)
        .order('full_name');
      return data || [];
    },
    enabled: !!user && hasRole(['director', 'coordinador', 'admin', 'superadmin']),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      return data || [];
    },
    enabled: !!user && hasRole(['director', 'coordinador', 'admin', 'superadmin']),
  });

  const { data: groups } = useQuery({
    queryKey: ['groups-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('groups')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      return data || [];
    },
    enabled: !!user && hasRole(['director', 'coordinador', 'admin', 'superadmin']),
  });

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports-stats'],
    queryFn: async () => {
      const results = await Promise.allSettled([
        supabase.from('schedules').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'docente'),
        supabase.from('subjects').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('students').select('id', { count: 'exact' }).eq('is_active', true),
      ]);

      return {
        totalSchedules: results[0].status === 'fulfilled' ? results[0].value.count || 0 : 0,
        totalTeachers: results[1].status === 'fulfilled' ? results[1].value.count || 0 : 0,
        totalSubjects: results[2].status === 'fulfilled' ? results[2].value.count || 0 : 0,
        totalStudents: results[3].status === 'fulfilled' ? results[3].value.count || 0 : 0,
      };
    },
    enabled: !!user && hasRole(['director', 'coordinador', 'admin', 'superadmin']),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      teacher: 'all',
      month: 'all',
      year: '2025',
      subject: 'all',
      group: 'all',
      status: 'all',
      modality: 'all'
    });
    setShowResults(false);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      let query = supabase
        .from('schedules')
        .select(`
          *,
          teacher:profiles!schedules_teacher_id_fkey(full_name, username),
          subject:subjects(name, code),
          group:groups(name, code)
        `)
        .order('fecha', { ascending: false });

      // Aplicar filtros
      if (filters.teacher !== 'all') {
        query = query.eq('teacher_id', filters.teacher);
      }
      if (filters.subject !== 'all') {
        query = query.eq('subject_id', filters.subject);
      }
      if (filters.group !== 'all') {
        query = query.eq('group_id', filters.group);
      }
      if (filters.status !== 'all') {
        query = query.eq('estado', filters.status as 'programado' | 'en_curso' | 'completado' | 'cancelado');
      }
      if (filters.modality !== 'all') {
        query = query.eq('modalidad', filters.modality as 'presencial' | 'virtual' | 'hibrida');
      }
      
      // Filtros de fecha
      if (filters.year !== 'all') {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query.gte('fecha', startDate).lte('fecha', endDate);
      }
      
      if (filters.month !== 'all' && filters.year !== 'all') {
        const month = filters.month.padStart(2, '0');
        const startDate = `${filters.year}-${month}-01`;
        const lastDay = new Date(parseInt(filters.year), parseInt(filters.month), 0).getDate();
        const endDate = `${filters.year}-${month}-${lastDay.toString().padStart(2, '0')}`;
        query = query.gte('fecha', startDate).lte('fecha', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setReportData(data || []);
      setShowResults(true);
      toast({
        title: "Reporte generado exitosamente",
        description: `Se encontraron ${data?.length || 0} registros`,
      });
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast({
        title: "Error al generar reporte",
        description: "Ocurrió un error al generar el reporte. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportToExcel = () => {
    if (!reportData.length) {
      toast({
        title: "No hay datos para exportar",
        description: "Primero genera un reporte con datos",
        variant: "destructive",
      });
      return;
    }

    // Preparar datos para Excel
    const excelData = reportData.map((item, index) => ({
      'No.': index + 1,
      'Fecha': new Date(item.fecha).toLocaleDateString('es-ES'),
      'Hora Inicio': item.hora_inicio,
      'Hora Fin': item.hora_fin,
      'Docente': item.teacher?.full_name || 'N/A',
      'Asignatura': item.subject?.name || 'N/A',
      'Código Asignatura': item.subject?.code || 'N/A',
      'Grupo': item.group?.name || 'N/A',
      'Modalidad': item.modalidad,
      'Estado': item.estado,
      'Aula': item.aula || 'N/A',
      'Horas Programadas': item.horas_programadas || 0,
      'Cumplido': item.cumplido ? 'Sí' : 'No',
      'Observaciones': item.observaciones || 'N/A'
    }));

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 5 },   // No.
      { wch: 12 },  // Fecha
      { wch: 12 },  // Hora Inicio
      { wch: 12 },  // Hora Fin
      { wch: 25 },  // Docente
      { wch: 30 },  // Asignatura
      { wch: 15 },  // Código Asignatura
      { wch: 20 },  // Grupo
      { wch: 12 },  // Modalidad
      { wch: 12 },  // Estado
      { wch: 10 },  // Aula
      { wch: 15 },  // Horas Programadas
      { wch: 10 },  // Cumplido
      { wch: 30 }   // Observaciones
    ];
    worksheet['!cols'] = columnWidths;

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte de Cronogramas');

    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Reporte_Cronogramas_${timestamp}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(workbook, filename);

    toast({
      title: "Archivo descargado",
      description: `El reporte se ha descargado como ${filename}`,
    });
  };

  const handlePrint = () => {
    if (!reportData.length) {
      toast({
        title: "No hay datos para imprimir",
        description: "Primero genera un reporte con datos",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de Cronogramas</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .filters { margin-bottom: 20px; padding: 10px; background-color: #f5f5f5; }
            .filters h3 { margin-top: 0; }
            @media print {
              body { margin: 0; }
              .filters { break-inside: avoid; }
              table { font-size: 10px; }
            }
          </style>
        </head>
        <body>
          <h1>Reporte de Cronogramas</h1>
          <div class="filters">
            <h3>Filtros Aplicados:</h3>
            <p><strong>Docente:</strong> ${filters.teacher === 'all' ? 'Todos' : teachers?.find(t => t.id === filters.teacher)?.full_name || 'N/A'}</p>
            <p><strong>Mes:</strong> ${filters.month === 'all' ? 'Todos' : months.find(m => m.value === filters.month)?.label || 'N/A'}</p>
            <p><strong>Año:</strong> ${filters.year}</p>
            <p><strong>Asignatura:</strong> ${filters.subject === 'all' ? 'Todas' : subjects?.find(s => s.id === filters.subject)?.name || 'N/A'}</p>
            <p><strong>Grupo:</strong> ${filters.group === 'all' ? 'Todos' : groups?.find(g => g.id === filters.group)?.name || 'N/A'}</p>
            <p><strong>Estado:</strong> ${filters.status === 'all' ? 'Todos' : statuses.find(s => s.value === filters.status)?.label || 'N/A'}</p>
            <p><strong>Modalidad:</strong> ${filters.modality === 'all' ? 'Todas' : modalities.find(m => m.value === filters.modality)?.label || 'N/A'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Docente</th>
                <th>Asignatura</th>
                <th>Grupo</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Aula</th>
                <th>Cumplido</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map(item => `
                <tr>
                  <td>${new Date(item.fecha).toLocaleDateString('es-ES')}</td>
                  <td>${item.hora_inicio} - ${item.hora_fin}</td>
                  <td>${item.teacher?.full_name || 'N/A'}</td>
                  <td>${item.subject?.name || 'N/A'}</td>
                  <td>${item.group?.name || 'N/A'}</td>
                  <td>${item.modalidad}</td>
                  <td>${item.estado}</td>
                  <td>${item.aula || 'N/A'}</td>
                  <td>${item.cumplido ? 'Sí' : 'No'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="text-align: center; margin-top: 20px; font-size: 12px;">
            Total de registros: ${reportData.length} | Generado el: ${new Date().toLocaleString('es-ES')}
          </p>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const months = [
    { value: 'all', label: 'Todos los Meses' },
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  const years = ['2024', '2025', '2026'];
  const statuses = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'programado', label: 'Programado' },
    { value: 'en_curso', label: 'En Curso' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' },
  ];
  const modalities = [
    { value: 'all', label: 'Todas las Modalidades' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'hibrida', label: 'Híbrida' },
  ];

  if (!hasRole(['director', 'coordinador', 'admin', 'superadmin'])) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Acceso Restringido</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No tienes permisos para acceder a los reportes
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reportes</h1>
            <p className="text-muted-foreground">Estadísticas y reportes del sistema</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 4 }} gap="md">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Cronogramas',
      value: reportsData?.totalSchedules || 0,
      icon: Calendar,
      description: 'Jornadas programadas',
    },
    {
      title: 'Docentes',
      value: reportsData?.totalTeachers || 0,
      icon: Users,
      description: 'Profesores activos',
    },
    {
      title: 'Materias',
      value: reportsData?.totalSubjects || 0,
      icon: BookOpen,
      description: 'Asignaturas disponibles',
    },
    {
      title: 'Estudiantes',
      value: reportsData?.totalStudents || 0,
      icon: Users,
      description: 'Estudiantes activos',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Generación de Reportes</h1>
          <p className="text-muted-foreground">Estadísticas y reportes del sistema</p>
        </div>
      </div>

      {/* Filtros del Reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Docente */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Docente</label>
              <Select value={filters.teacher} onValueChange={(value) => handleFilterChange('teacher', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar docente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Docentes</SelectItem>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mes</label>
              <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Año */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Año</label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asignatura */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Asignatura</label>
              <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar asignatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Asignaturas</SelectItem>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grupo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Grupo</label>
              <Select value={filters.group} onValueChange={(value) => handleFilterChange('group', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Grupos</SelectItem>
                  {groups?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado del Horario */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado del Horario</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modalidad */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Modalidad</label>
              <Select value={filters.modality} onValueChange={(value) => handleFilterChange('modality', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar modalidad" />
                </SelectTrigger>
                <SelectContent>
                  {modalities.map((modality) => (
                    <SelectItem key={modality.value} value={modality.value}>
                      {modality.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar Filtros
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
              {isGeneratingReport ? 'Generando...' : 'Generar Reporte'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados del Reporte */}
      {showResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resultados del Reporte ({reportData.length} registros)</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button onClick={handleExportToExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar a Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {reportData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron registros con los filtros aplicados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Docente</TableHead>
                      <TableHead>Asignatura</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Modalidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Aula</TableHead>
                      <TableHead>Cumplido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{new Date(item.fecha).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{item.hora_inicio} - {item.hora_fin}</TableCell>
                        <TableCell>{item.teacher?.full_name || 'N/A'}</TableCell>
                        <TableCell>{item.subject?.name || 'N/A'}</TableCell>
                        <TableCell>{item.group?.name || 'N/A'}</TableCell>
                        <TableCell>{item.modalidad}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.estado === 'completado' ? 'bg-green-100 text-green-800' :
                            item.estado === 'en_curso' ? 'bg-blue-100 text-blue-800' :
                            item.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.estado}
                          </span>
                        </TableCell>
                        <TableCell>{item.aula || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.cumplido ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.cumplido ? 'Sí' : 'No'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estadísticas generales */}
      <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 4 }} gap="md">
        {stats.map((stat, index) => (
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
    </div>
  );
};

export default Reports;
