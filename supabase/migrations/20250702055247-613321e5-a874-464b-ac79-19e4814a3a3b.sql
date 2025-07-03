
-- Actualizar la política de gestión de cronogramas para incluir directores
DROP POLICY IF EXISTS "Managers can manage schedules" ON schedules;

CREATE POLICY "Managers can manage schedules" 
ON schedules 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('superadmin', 'admin', 'director', 'coordinador', 'asistente')
  )
);

-- Asegurar que la política de visualización también incluya directores
DROP POLICY IF EXISTS "Managers can view all schedules" ON schedules;

CREATE POLICY "Managers can view all schedules" 
ON schedules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('superadmin', 'admin', 'director', 'coordinador', 'asistente')
  )
);
