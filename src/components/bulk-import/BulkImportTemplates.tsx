
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';

const BulkImportTemplates: React.FC = () => {
  const templates = [
    {
      type: 'users',
      title: 'Plantilla de Usuarios',
      description: 'Formato para importar usuarios del sistema',
      icon: Users,
      fields: ['username', 'full_name', 'email', 'password', 'role', 'is_active'],
      example: 'jperez,Juan Pérez,juan.perez@email.com,TempPass123!,docente,true'
    },
    {
      type: 'subjects',
      title: 'Plantilla de Materias',
      description: 'Formato para importar materias académicas',
      icon: BookOpen,
      fields: ['code', 'name', 'credits', 'description'],
      example: 'MAT002,Matemáticas II,4,Cálculo diferencial e integral'
    },
    {
      type: 'groups',
      title: 'Plantilla de Grupos',
      description: 'Formato para importar grupos de estudiantes',
      icon: GraduationCap,
      fields: ['name', 'code', 'semester', 'year', 'max_students', 'subject_code'],
      example: 'Grupo B,MAT002-B,2,2024,25,MAT002'
    },
    {
      type: 'schedules',
      title: 'Plantilla de Horarios',
      description: 'Formato para importar cronogramas de clase',
      icon: Calendar,
      fields: ['fecha', 'hora_inicio', 'hora_fin', 'teacher_username', 'subject_code', 'group_code', 'modalidad', 'aula'],
      example: '2024-03-15,10:00,12:00,jperez,MAT002,MAT002-B,presencial,B201'
    }
  ];

  const generateCSV = (template: typeof templates[0]) => {
    const headers = template.fields.join(',');
    const csvContent = `${headers}\n${template.example}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `plantilla_${template.type}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map((template) => {
        const IconComponent = template.icon;
        
        return (
          <Card key={template.type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className="w-5 h-5" />
                {template.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Campos requeridos:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.fields.map((field) => (
                    <span
                      key={field}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Ejemplo:</h4>
                <code className="text-xs bg-muted p-2 rounded block break-all">
                  {template.fields.join(',')}
                  <br />
                  {template.example}
                </code>
              </div>
              
              <Button
                onClick={() => generateCSV(template)}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Plantilla CSV
              </Button>
            </CardContent>
          </Card>
        );
      })}
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Instrucciones Generales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Formato de Archivo</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Archivos CSV con codificación UTF-8</li>
                <li>• Archivos Excel (.xlsx, .xls)</li>
                <li>• Primera fila debe contener los encabezados</li>
                <li>• Campos separados por comas en CSV</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Consideraciones</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verifica que no existan registros duplicados</li>
                <li>• Campos obligatorios no pueden estar vacíos</li>
                <li>• Formatos de fecha: YYYY-MM-DD</li>
                <li>• Formatos de hora: HH:MM (24 horas)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Notas Especiales por Tipo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <strong>Usuarios:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Username, full_name y email son obligatorios</li>
                  <li>• Email debe ser único en el sistema</li>
                  <li>• Si no se proporciona password, se asigna "ChangeMe123!"</li>
                  <li>• Roles válidos: superadmin, admin, director, coordinador, asistente, docente</li>
                  <li>• is_active: true/false, 1/0, o vacío (por defecto true)</li>
                </ul>
              </div>
              <div>
                <strong>Materias:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Code y name son obligatorios</li>
                  <li>• Code debe ser único en el sistema</li>
                  <li>• Credits debe ser un número entero mayor a 0</li>
                  <li>• Description es opcional</li>
                </ul>
              </div>
              <div>
                <strong>Grupos:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Name, code y subject_code son obligatorios</li>
                  <li>• Code debe ser único en el sistema</li>
                  <li>• subject_code debe existir previamente en materias</li>
                  <li>• max_students debe ser un número (por defecto 30)</li>
                  <li>• year debe ser un año válido (por defecto año actual)</li>
                </ul>
              </div>
              <div>
                <strong>Horarios:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• teacher_username, subject_code y group_code son obligatorios</li>
                  <li>• teacher_username debe existir en usuarios</li>
                  <li>• subject_code debe existir en materias</li>
                  <li>• group_code debe existir en grupos</li>
                  <li>• Modalidad válida: presencial, virtual, hibrida</li>
                  <li>• Fecha formato: YYYY-MM-DD</li>
                  <li>• Hora formato: HH:MM (24 horas)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkImportTemplates;
