
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRequest {
  importId: string;
  importType: 'users' | 'subjects' | 'groups' | 'schedules';
  fileContent: string;
  fileName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting bulk import processing...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { importId, importType, fileContent, fileName }: ImportRequest = await req.json();

    console.log(`Processing bulk import ${importId} of type ${importType} for file ${fileName}`);
    console.log(`File content length: ${fileContent.length}`);

    // Actualizar estado a procesando
    const { error: updateError } = await supabase
      .from('bulk_imports')
      .update({ status: 'processing' })
      .eq('id', importId);

    if (updateError) {
      console.error('Error updating import status to processing:', updateError);
      throw updateError;
    }

    // Parsear CSV - mejorado para manejar diferentes formatos
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim());
    console.log(`Found ${lines.length} lines in file`);
    
    if (lines.length === 0) {
      throw new Error('El archivo está vacío');
    }

    // Parsear headers - manejar comillas y espacios
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    console.log('Headers found:', headers);
    
    const rows = lines.slice(1);
    console.log(`Processing ${rows.length} data rows`);

    let successCount = 0;
    let errorCount = 0;

    // Actualizar total de registros
    await supabase
      .from('bulk_imports')
      .update({ total_records: rows.length })
      .eq('id', importId);

    // Procesar cada fila según el tipo de importación
    for (let i = 0; i < rows.length; i++) {
      console.log(`Processing row ${i + 1}/${rows.length}`);
      
      // Parsear datos de la fila - manejar comillas y comas dentro de campos
      const rowData = parseCSVRow(rows[i]);
      console.log(`Row ${i + 2} data:`, rowData);
      
      try {
        if (importType === 'users') {
          await processUserRow(supabase, headers, rowData);
        } else if (importType === 'subjects') {
          await processSubjectRow(supabase, headers, rowData);
        } else if (importType === 'groups') {
          await processGroupRow(supabase, headers, rowData);
        } else if (importType === 'schedules') {
          await processScheduleRow(supabase, headers, rowData);
        }
        
        successCount++;
        console.log(`Row ${i + 2} processed successfully`);
      } catch (error) {
        errorCount++;
        console.error(`Error processing row ${i + 2}:`, error);
        
        // Guardar error específico
        await supabase
          .from('import_errors')
          .insert({
            bulk_import_id: importId,
            row_number: i + 2,
            error_message: error instanceof Error ? error.message : 'Error desconocido',
            row_data: Object.fromEntries(headers.map((h, idx) => [h, rowData[idx] || '']))
          });
      }
    }

    // Actualizar estadísticas finales
    const finalStatus = errorCount === 0 ? 'completed' : 'completed';
    await supabase
      .from('bulk_imports')
      .update({
        status: finalStatus,
        processed_records: rows.length,
        successful_records: successCount,
        failed_records: errorCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', importId);

    console.log(`Import ${importId} completed: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: rows.length,
        successful: successCount,
        failed: errorCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in process-bulk-import:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

// Función para parsear una fila CSV manejando comillas y comas
function parseCSVRow(row: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

async function processUserRow(supabase: any, headers: string[], rowData: string[]) {
  const userData = Object.fromEntries(headers.map((h, idx) => [h, rowData[idx] || '']));
  console.log('Processing user:', userData);
  
  // Validar datos requeridos
  if (!userData.username || !userData.full_name || !userData.email) {
    throw new Error('Username, full_name y email son requeridos');
  }

  // Verificar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error(`Email '${userData.email}' no tiene un formato válido`);
  }

  // Verificar si el usuario ya existe en profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', userData.username)
    .single();

  if (existingProfile) {
    throw new Error(`Usuario con username '${userData.username}' ya existe`);
  }

  // Verificar si el email ya existe
  const { data: existingEmail, error: emailCheckError } = await supabase.auth.admin.listUsers();
  if (emailCheckError) {
    console.error('Error checking existing emails:', emailCheckError);
  } else {
    const emailExists = existingEmail?.users?.some(user => user.email === userData.email);
    if (emailExists) {
      throw new Error(`Email '${userData.email}' ya está registrado`);
    }
  }

  // Crear usuario con autenticación usando Admin API
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password || 'ChangeMe123!',
    email_confirm: true,
    user_metadata: {
      full_name: userData.full_name,
      username: userData.username
    }
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    throw new Error(`Error creando usuario: ${authError.message}`);
  }

  if (!authUser.user) {
    throw new Error('No se pudo crear el usuario de autenticación');
  }

  console.log(`Auth user created successfully with ID: ${authUser.user.id}`);

  // Validar rol
  const validRoles = ['superadmin', 'admin', 'director', 'coordinador', 'asistente', 'docente'];
  const role = userData.role || 'docente';
  if (!validRoles.includes(role)) {
    // Si el rol no es válido, eliminar el usuario de auth y lanzar error
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Rol '${role}' no es válido. Roles permitidos: ${validRoles.join(', ')}`);
  }

  // Convertir is_active a boolean
  let isActive = true;
  if (userData.is_active) {
    const activeValue = userData.is_active.toLowerCase();
    isActive = activeValue === 'true' || activeValue === '1';
  }

  // Crear perfil de usuario con el ID del usuario de auth
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      username: userData.username,
      full_name: userData.full_name,
      role: role,
      is_active: isActive
    });
  
  if (profileError) {
    console.error('Error inserting profile:', profileError);
    // Si falla la creación del perfil, eliminar el usuario de auth
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Error creando perfil: ${profileError.message}`);
  }

  console.log(`User profile created successfully for user: ${authUser.user.id}`);
}

async function processSubjectRow(supabase: any, headers: string[], rowData: string[]) {
  const subjectData = Object.fromEntries(headers.map((h, idx) => [h, rowData[idx] || '']));
  console.log('Processing subject:', subjectData);
  
  // Validar datos requeridos
  if (!subjectData.code || !subjectData.name) {
    throw new Error('Code y name son requeridos para materias');
  }

  // Validar que el código no tenga espacios
  if (subjectData.code.includes(' ')) {
    throw new Error(`Código de materia '${subjectData.code}' no puede contener espacios`);
  }

  // Validar créditos
  let credits = 1;
  if (subjectData.credits) {
    credits = parseInt(subjectData.credits);
    if (isNaN(credits) || credits < 1 || credits > 10) {
      throw new Error(`Créditos '${subjectData.credits}' debe ser un número entre 1 y 10`);
    }
  }

  // Verificar si la materia ya existe
  const { data: existingSubject } = await supabase
    .from('subjects')
    .select('id')
    .eq('code', subjectData.code)
    .single();

  if (existingSubject) {
    throw new Error(`Materia con código '${subjectData.code}' ya existe`);
  }
  
  const { error } = await supabase
    .from('subjects')
    .insert({
      code: subjectData.code,
      name: subjectData.name,
      credits: credits,
      description: subjectData.description || null
    });
  
  if (error) {
    console.error('Error inserting subject:', error);
    throw new Error(`Error insertando materia: ${error.message}`);
  }

  console.log(`Subject created successfully: ${subjectData.code}`);
}

async function processGroupRow(supabase: any, headers: string[], rowData: string[]) {
  const groupData = Object.fromEntries(headers.map((h, idx) => [h, rowData[idx] || '']));
  console.log('Processing group:', groupData);
  
  // Validar datos requeridos
  if (!groupData.subject_code || !groupData.name || !groupData.code) {
    throw new Error('subject_code, name y code son requeridos para grupos');
  }

  // Validar que el código no tenga espacios excesivos
  if (groupData.code.trim() !== groupData.code) {
    throw new Error(`Código de grupo '${groupData.code}' contiene espacios al inicio o final`);
  }
  
  // Buscar subject_id por código
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('id')
    .eq('code', groupData.subject_code)
    .single();
  
  if (subjectError || !subject) {
    throw new Error(`Materia con código '${groupData.subject_code}' no encontrada. Asegúrate de importar las materias primero.`);
  }

  // Verificar si el grupo ya existe
  const { data: existingGroup } = await supabase
    .from('groups')
    .select('id')
    .eq('code', groupData.code)
    .single();

  if (existingGroup) {
    throw new Error(`Grupo con código '${groupData.code}' ya existe`);
  }

  // Validar max_students
  let maxStudents = 30;
  if (groupData.max_students) {
    maxStudents = parseInt(groupData.max_students);
    if (isNaN(maxStudents) || maxStudents < 1) {
      throw new Error(`max_students '${groupData.max_students}' debe ser un número mayor a 0`);
    }
  }

  // Validar year
  let year = new Date().getFullYear();
  if (groupData.year) {
    year = parseInt(groupData.year);
    if (isNaN(year) || year < 2020 || year > 2030) {
      throw new Error(`Año '${groupData.year}' debe ser un año válido entre 2020 y 2030`);
    }
  }
  
  const { error } = await supabase
    .from('groups')
    .insert({
      name: groupData.name,
      code: groupData.code,
      semester: groupData.semester || '1',
      year: year,
      max_students: maxStudents,
      subject_id: subject.id
    });
  
  if (error) {
    console.error('Error inserting group:', error);
    throw new Error(`Error insertando grupo: ${error.message}`);
  }

  console.log(`Group created successfully: ${groupData.code}`);
}

async function processScheduleRow(supabase: any, headers: string[], rowData: string[]) {
  const scheduleData = Object.fromEntries(headers.map((h, idx) => [h, rowData[idx] || '']));
  console.log('Processing schedule:', scheduleData);
  
  // Validar datos requeridos
  if (!scheduleData.teacher_username || !scheduleData.subject_code || !scheduleData.group_code) {
    throw new Error('teacher_username, subject_code y group_code son requeridos para horarios');
  }

  // Validar fecha
  if (!scheduleData.fecha) {
    throw new Error('fecha es requerida para horarios');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(scheduleData.fecha)) {
    throw new Error(`Fecha '${scheduleData.fecha}' debe tener formato YYYY-MM-DD`);
  }

  // Validar horas
  if (!scheduleData.hora_inicio || !scheduleData.hora_fin) {
    throw new Error('hora_inicio y hora_fin son requeridas para horarios');
  }

  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(scheduleData.hora_inicio)) {
    throw new Error(`hora_inicio '${scheduleData.hora_inicio}' debe tener formato HH:MM`);
  }

  if (!timeRegex.test(scheduleData.hora_fin)) {
    throw new Error(`hora_fin '${scheduleData.hora_fin}' debe tener formato HH:MM`);
  }

  // Validar modalidad
  const validModalidades = ['presencial', 'virtual', 'hibrida'];
  const modalidad = scheduleData.modalidad || 'presencial';
  if (!validModalidades.includes(modalidad)) {
    throw new Error(`Modalidad '${modalidad}' no es válida. Modalidades permitidas: ${validModalidades.join(', ')}`);
  }
  
  // Buscar IDs necesarios
  const { data: teacher, error: teacherError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', scheduleData.teacher_username)
    .single();
  
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('id')
    .eq('code', scheduleData.subject_code)
    .single();
  
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('code', scheduleData.group_code)
    .single();
  
  if (teacherError || !teacher) {
    throw new Error(`Docente con username '${scheduleData.teacher_username}' no encontrado. Asegúrate de importar los usuarios primero.`);
  }
  if (subjectError || !subject) {
    throw new Error(`Materia con código '${scheduleData.subject_code}' no encontrada. Asegúrate de importar las materias primero.`);
  }
  if (groupError || !group) {
    throw new Error(`Grupo con código '${scheduleData.group_code}' no encontrado. Asegúrate de importar los grupos primero.`);
  }

  // Calcular horas programadas
  const startTime = new Date(`1970-01-01T${scheduleData.hora_inicio}:00`);
  const endTime = new Date(`1970-01-01T${scheduleData.hora_fin}:00`);
  const horasProgramadas = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  if (horasProgramadas <= 0) {
    throw new Error(`La hora de fin debe ser posterior a la hora de inicio`);
  }
  
  const { error } = await supabase
    .from('schedules')
    .insert({
      fecha: scheduleData.fecha,
      hora_inicio: scheduleData.hora_inicio,
      hora_fin: scheduleData.hora_fin,
      teacher_id: teacher.id,
      subject_id: subject.id,
      group_id: group.id,
      modalidad: modalidad,
      aula: scheduleData.aula || null,
      horas_programadas: horasProgramadas
    });
  
  if (error) {
    console.error('Error inserting schedule:', error);
    throw new Error(`Error insertando horario: ${error.message}`);
  }

  console.log(`Schedule created successfully for date: ${scheduleData.fecha}`);
}

serve(handler);
