
export interface Schedule {
  id: string;
  docenteId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asignatura: string;
  grupo: string;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  cumplido: boolean;
  fechaCumplimiento?: string;
  observaciones?: string;
  createdBy: string;
  createdAt: string;
}

export interface ScheduleFormData {
  docenteId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asignatura: string;
  grupo: string;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
}

export interface DailyCheckIn {
  scheduleId: string;
  cumplido: boolean;
  observaciones?: string;
  timestamp: string;
}
