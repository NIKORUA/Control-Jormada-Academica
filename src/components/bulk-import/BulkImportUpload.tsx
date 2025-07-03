
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BulkImportUploadProps {
  onImportComplete: () => void;
  currentUser: any;
}

const BulkImportUpload: React.FC<BulkImportUploadProps> = ({
  onImportComplete,
  currentUser
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const importTypes = [
    { value: 'users', label: 'Usuarios' },
    { value: 'subjects', label: 'Materias' },
    { value: 'groups', label: 'Grupos' },
    { value: 'schedules', label: 'Horarios' }
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setUploadStatus('idle');
        setErrorMessage('');
        console.log('File selected:', selectedFile.name, selectedFile.type);
      } else {
        setErrorMessage('Por favor selecciona un archivo CSV o Excel válido');
        setUploadStatus('error');
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !importType || !user) {
      setErrorMessage('Por favor selecciona un archivo y tipo de importación');
      setUploadStatus('error');
      return;
    }

    console.log('Starting upload process...');
    console.log('User ID:', user.id);
    console.log('File:', file.name);
    console.log('Import type:', importType);

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      // Leer el archivo como texto
      const fileContent = await file.text();
      console.log('File content length:', fileContent.length);
      console.log('First 200 chars:', fileContent.substring(0, 200));
      
      // Crear registro de importación
      console.log('Creating import record...');
      const importData = {
        import_type: importType,
        file_name: file.name,
        total_records: 0,
        imported_by: user.id,
        status: 'pending'
      };
      
      console.log('Import data to insert:', importData);
      
      const { data: importRecord, error: importError } = await supabase
        .from('bulk_imports')
        .insert(importData)
        .select()
        .single();

      if (importError) {
        console.error('Error creating import record:', importError);
        throw new Error(`Error al crear registro de importación: ${importError.message}`);
      }

      console.log('Import record created successfully:', importRecord);

      // Llamar a la Edge Function para procesar el archivo
      console.log('Calling edge function...');
      const functionPayload = {
        importId: importRecord.id,
        importType,
        fileContent,
        fileName: file.name
      };
      
      console.log('Function payload:', { 
        importId: functionPayload.importId, 
        importType: functionPayload.importType, 
        fileName: functionPayload.fileName,
        contentLength: functionPayload.fileContent.length 
      });

      const { data: functionResult, error: functionError } = await supabase.functions.invoke('process-bulk-import', {
        body: functionPayload
      });

      if (functionError) {
        console.error('Error calling edge function:', functionError);
        throw new Error(`Error al procesar archivo: ${functionError.message}`);
      }

      console.log('Function completed successfully:', functionResult);
      
      setUploadStatus('success');
      setFile(null);
      setImportType('');
      
      toast({
        title: "Importación completada",
        description: `Se procesaron ${functionResult?.processed || 0} registros`,
      });
      
      onImportComplete();
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido al procesar el archivo';
      setErrorMessage(errorMsg);
      setUploadStatus('error');
      
      toast({
        title: "Error en la importación",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Subir Archivo para Importación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de tipo de importación */}
        <div className="space-y-2">
          <Label htmlFor="import-type">Tipo de Importación</Label>
          <Select value={importType} onValueChange={setImportType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo de datos a importar" />
            </SelectTrigger>
            <SelectContent>
              {importTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selector de archivo */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Archivo CSV o Excel</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {/* Mensajes de estado */}
        {uploadStatus === 'success' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Archivo procesado exitosamente. Revisa el historial para ver los resultados.
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'error' && errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Información importante */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Asegúrate de que tu archivo siga el formato de la plantilla correspondiente. 
            Puedes descargar las plantillas desde la pestaña "Plantillas".
          </AlertDescription>
        </Alert>

        {/* Botón de subida */}
        <Button
          onClick={handleUpload}
          disabled={!file || !importType || isUploading}
          className="w-full"
        >
          {isUploading ? 'Procesando...' : 'Iniciar Importación'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkImportUpload;
