
// Tipos para la funcionalidad de importación masiva
export interface BulkImport {
  id: string;
  import_type: 'users' | 'subjects' | 'groups' | 'schedules';
  file_name: string;
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errors?: any;
  imported_by: string;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface ImportError {
  id: string;
  bulk_import_id: string;
  row_number: number;
  error_message: string;
  row_data?: any;
  created_at: string;
}
