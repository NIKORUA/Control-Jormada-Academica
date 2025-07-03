-- Crear función para calcular horas programadas basada en períodos de 45 minutos
CREATE OR REPLACE FUNCTION public.calculate_horas_programadas(hora_inicio time, hora_fin time)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  inicio_minutos integer;
  fin_minutos integer;
  diferencia_minutos integer;
  horas_45 numeric;
BEGIN
  -- Convertir horas a minutos desde medianoche
  inicio_minutos := EXTRACT(HOUR FROM hora_inicio) * 60 + EXTRACT(MINUTE FROM hora_inicio);
  fin_minutos := EXTRACT(HOUR FROM hora_fin) * 60 + EXTRACT(MINUTE FROM hora_fin);
  
  -- Calcular diferencia en minutos
  diferencia_minutos := fin_minutos - inicio_minutos;
  
  -- Si la diferencia es negativa (cruzó medianoche), agregar 24 horas
  IF diferencia_minutos < 0 THEN
    diferencia_minutos := diferencia_minutos + (24 * 60);
  END IF;
  
  -- Aplicar la fórmula: dividir entre 45 para obtener "horas de 45"
  horas_45 := diferencia_minutos::numeric / 45.0;
  
  RETURN ROUND(horas_45, 2);
END;
$$;

-- Actualizar la columna horas_programadas para que sea generada automáticamente
ALTER TABLE public.schedules 
DROP COLUMN IF EXISTS horas_programadas;

ALTER TABLE public.schedules 
ADD COLUMN horas_programadas numeric GENERATED ALWAYS AS (
  calculate_horas_programadas(hora_inicio, hora_fin)
) STORED;