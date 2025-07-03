import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ResponsiveContainer from './ResponsiveContainer';
import BulkImportUpload from './bulk-import/BulkImportUpload';
import BulkImportHistory from './bulk-import/BulkImportHistory';
import BulkImportTemplates from './bulk-import/BulkImportTemplates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, History, FileText } from 'lucide-react';
import { BulkImport as BulkImportType } from './bulk-import/types';

/**
 * Componente principal para la importación masiva de datos.
 * Permite importar usuarios, materias, grupos y horarios desde archivos CSV/Excel.
 */
const BulkImport: React.FC = () => {
  const { hasRole, user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');

  // Consulta para obtener el historial de importaciones
  const { data: imports, isLoading, refetch } = useQuery({
    queryKey: ['bulk-imports'],
    queryFn: async () => {
      console.log('Fetching bulk imports...');
      
      // Usar consulta genérica directamente
      const { data, error } = await (supabase as any)
        .from('bulk_imports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bulk imports:', error);
        throw error;
      }
      
      console.log('Bulk imports fetched:', data);
      return data as BulkImportType[];
    },
    enabled: hasRole(['admin', 'director', 'superadmin', 'coordinador', 'asistente'])
  });

  // Verificar permisos de acceso
  if (!hasRole(['admin', 'director', 'superadmin', 'coordinador', 'asistente'])) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Acceso Restringido</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No tienes permisos para realizar importaciones masivas
          </p>
        </div>
      </div>
    );
  }

  const handleImportComplete = () => {
    refetch();
  };

  return (
    <ResponsiveContainer padding="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Importación Masiva</h1>
          <p className="text-muted-foreground">
            Importa usuarios, materias, grupos y horarios desde archivos CSV o Excel
          </p>
        </div>

        {/* Tabs para diferentes funcionalidades */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Plantillas</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <BulkImportUpload 
              onImportComplete={handleImportComplete}
              currentUser={user}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <BulkImportTemplates />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <BulkImportHistory 
              imports={imports || []} 
              isLoading={isLoading}
              onRefresh={refetch}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
};

export default BulkImport;
