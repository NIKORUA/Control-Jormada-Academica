
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BulkImport } from './types';

interface BulkImportHistoryProps {
  imports: BulkImport[];
  isLoading: boolean;
  onRefresh: () => void;
}

const BulkImportHistory: React.FC<BulkImportHistoryProps> = ({
  imports,
  isLoading,
  onRefresh
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completado</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Procesando</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Fallido</Badge>;
      case 'pending':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Pendiente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getImportTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      users: 'Usuarios',
      subjects: 'Materias',
      groups: 'Grupos',
      schedules: 'Horarios'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Importaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Historial de Importaciones</CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {imports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay importaciones registradas</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imports.map((importItem) => (
                <TableRow key={importItem.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{importItem.file_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getImportTypeLabel(importItem.import_type)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(importItem.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{importItem.successful_records} exitosos</div>
                      {importItem.failed_records > 0 && (
                        <div className="text-red-600">{importItem.failed_records} fallidos</div>
                      )}
                      <div className="text-muted-foreground">
                        {importItem.processed_records} / {importItem.total_records} procesados
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(importItem.created_at).toLocaleDateString('es-ES')}</div>
                      <div className="text-muted-foreground">
                        {new Date(importItem.created_at).toLocaleTimeString('es-ES')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {importItem.failed_records > 0 && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkImportHistory;
