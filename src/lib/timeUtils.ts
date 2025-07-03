/**
 * Calcula las horas programadas basándose en períodos de 45 minutos
 * Fórmula: ((Hora Final - Hora Inicial) * 24 * 60 / 45)
 * @param horaInicio - Hora de inicio en formato HH:MM
 * @param horaFin - Hora de fin en formato HH:MM
 * @returns Número de horas de 45 minutos
 */
export function calculateHours45(horaInicio: string, horaFin: string): number {
  if (!horaInicio || !horaFin) return 0;
  
  // Convertir horas a minutos desde medianoche
  const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
  const [finHoras, finMinutos] = horaFin.split(':').map(Number);
  
  const inicioEnMinutos = inicioHoras * 60 + inicioMinutos;
  const finEnMinutos = finHoras * 60 + finMinutos;
  
  // Calcular diferencia en minutos
  const diferenciaMinutos = finEnMinutos - inicioEnMinutos;
  
  // Si la diferencia es negativa (cruzó medianoche), agregar 24 horas
  const minutosReales = diferenciaMinutos < 0 ? diferenciaMinutos + (24 * 60) : diferenciaMinutos;
  
  // Aplicar la fórmula: dividir entre 45 para obtener "horas de 45"
  return Number((minutosReales / 45).toFixed(2));
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para la zona horaria de Colombia
 * @returns Fecha en formato string
 */
export function getCurrentDateInColombia(): string {
  const now = new Date();
  // Colombia está en UTC-5
  const colombiaTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
  return colombiaTime.toISOString().split('T')[0];
}

/**
 * Formatea una fecha para la zona horaria de Colombia
 * @param date - Fecha a formatear
 * @returns Fecha en formato YYYY-MM-DD
 */
export function formatDateForColombia(date: Date): string {
  // Colombia está en UTC-5
  const colombiaTime = new Date(date.getTime() - (5 * 60 * 60 * 1000));
  return colombiaTime.toISOString().split('T')[0];
}

/**
 * Crea un objeto Date desde una fecha en formato YYYY-MM-DD sin problemas de zona horaria
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Objeto Date ajustado para evitar diferencias de zona horaria
 */
export function createDateFromString(dateString: string): Date {
  // Agregar 'T12:00:00' para evitar problemas de zona horaria
  // Esto asegura que la fecha se interprete en la zona horaria local
  return new Date(dateString + 'T12:00:00');
}