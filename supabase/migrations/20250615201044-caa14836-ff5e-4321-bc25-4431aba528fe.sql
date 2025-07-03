
-- Crear tabla para registros de importación masiva
CREATE TABLE public.bulk_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  import_type TEXT NOT NULL CHECK (import_type IN ('users', 'subjects', 'groups', 'schedules')),
  file_name TEXT NOT NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  processed_records INTEGER NOT NULL DEFAULT 0,
  successful_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  errors JSONB,
  imported_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para errores de importación
CREATE TABLE public.import_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bulk_import_id UUID NOT NULL REFERENCES public.bulk_imports(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  error_message TEXT NOT NULL,
  row_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.bulk_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para bulk_imports
CREATE POLICY "Users can view their own imports" 
  ON public.bulk_imports 
  FOR SELECT 
  USING (imported_by = auth.uid());

CREATE POLICY "Users can create imports" 
  ON public.bulk_imports 
  FOR INSERT 
  WITH CHECK (imported_by = auth.uid());

CREATE POLICY "Users can update their own imports" 
  ON public.bulk_imports 
  FOR UPDATE 
  USING (imported_by = auth.uid());

-- Políticas RLS para import_errors
CREATE POLICY "Users can view their own import errors" 
  ON public.import_errors 
  FOR SELECT 
  USING (bulk_import_id IN (SELECT id FROM public.bulk_imports WHERE imported_by = auth.uid()));

CREATE POLICY "System can create import errors" 
  ON public.import_errors 
  FOR INSERT 
  WITH CHECK (true);

-- Trigger para actualizar updated_at
CREATE TRIGGER handle_updated_at_bulk_imports
  BEFORE UPDATE ON public.bulk_imports
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
