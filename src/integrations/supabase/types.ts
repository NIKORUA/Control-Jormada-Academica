export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          excused: boolean
          id: string
          late: boolean
          notes: string | null
          present: boolean
          recorded_at: string
          schedule_id: string
          student_id: string
        }
        Insert: {
          excused?: boolean
          id?: string
          late?: boolean
          notes?: string | null
          present?: boolean
          recorded_at?: string
          schedule_id: string
          student_id: string
        }
        Update: {
          excused?: boolean
          id?: string
          late?: boolean
          notes?: string | null
          present?: boolean
          recorded_at?: string
          schedule_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_imports: {
        Row: {
          completed_at: string | null
          created_at: string
          errors: Json | null
          failed_records: number
          file_name: string
          id: string
          import_type: string
          imported_by: string
          processed_records: number
          status: string
          successful_records: number
          total_records: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          errors?: Json | null
          failed_records?: number
          file_name: string
          id?: string
          import_type: string
          imported_by: string
          processed_records?: number
          status?: string
          successful_records?: number
          total_records?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          errors?: Json | null
          failed_records?: number
          file_name?: string
          id?: string
          import_type?: string
          imported_by?: string
          processed_records?: number
          status?: string
          successful_records?: number
          total_records?: number
          updated_at?: string
        }
        Relationships: []
      }
      daily_attendance: {
        Row: {
          checked_in_at: string | null
          created_at: string | null
          cumplido: boolean | null
          fecha: string
          id: string
          notes: string | null
          schedule_id: string
          teacher_id: string
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string | null
          cumplido?: boolean | null
          fecha: string
          id?: string
          notes?: string | null
          schedule_id: string
          teacher_id: string
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string | null
          cumplido?: boolean | null
          fecha?: string
          id?: string
          notes?: string | null
          schedule_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_attendance_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          enrolled_at: string
          group_id: string
          id: string
          is_active: boolean
          student_id: string
        }
        Insert: {
          enrolled_at?: string
          group_id: string
          id?: string
          is_active?: boolean
          student_id: string
        }
        Update: {
          enrolled_at?: string
          group_id?: string
          id?: string
          is_active?: boolean
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          max_students: number
          name: string
          semester: string
          subject_id: string
          updated_at: string
          year: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_students?: number
          name: string
          semester: string
          subject_id: string
          updated_at?: string
          year: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_students?: number
          name?: string
          semester?: string
          subject_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "groups_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      import_errors: {
        Row: {
          bulk_import_id: string
          created_at: string
          error_message: string
          id: string
          row_data: Json | null
          row_number: number
        }
        Insert: {
          bulk_import_id: string
          created_at?: string
          error_message: string
          id?: string
          row_data?: Json | null
          row_number: number
        }
        Update: {
          bulk_import_id?: string
          created_at?: string
          error_message?: string
          id?: string
          row_data?: Json | null
          row_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_errors_bulk_import_id_fkey"
            columns: ["bulk_import_id"]
            isOneToOne: false
            referencedRelation: "bulk_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          data: Json | null
          description: string | null
          generated_at: string
          generated_by: string
          id: string
          report_type: string
          title: string
        }
        Insert: {
          data?: Json | null
          description?: string | null
          generated_at?: string
          generated_by: string
          id?: string
          report_type: string
          title: string
        }
        Update: {
          data?: Json | null
          description?: string | null
          generated_at?: string
          generated_by?: string
          id?: string
          report_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          aula: string | null
          created_at: string
          cumplido: boolean | null
          estado: Database["public"]["Enums"]["estado_cronograma"]
          fecha: string
          fecha_cumplimiento: string | null
          group_id: string
          hora_fin: string
          hora_inicio: string
          horas_programadas: number | null
          id: string
          modalidad: Database["public"]["Enums"]["modalidad_clase"]
          observaciones: string | null
          subject_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          aula?: string | null
          created_at?: string
          cumplido?: boolean | null
          estado?: Database["public"]["Enums"]["estado_cronograma"]
          fecha: string
          fecha_cumplimiento?: string | null
          group_id: string
          hora_fin: string
          hora_inicio: string
          horas_programadas?: number | null
          id?: string
          modalidad?: Database["public"]["Enums"]["modalidad_clase"]
          observaciones?: string | null
          subject_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          aula?: string | null
          created_at?: string
          cumplido?: boolean | null
          estado?: Database["public"]["Enums"]["estado_cronograma"]
          fecha?: string
          fecha_cumplimiento?: string | null
          group_id?: string
          hora_fin?: string
          hora_inicio?: string
          horas_programadas?: number | null
          id?: string
          modalidad?: Database["public"]["Enums"]["modalidad_clase"]
          observaciones?: string | null
          subject_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sidebar_options: {
        Row: {
          created_at: string
          default_enabled: boolean
          description: string | null
          icon: string | null
          id: string
          option_key: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_enabled?: boolean
          description?: string | null
          icon?: string | null
          id?: string
          option_key: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_enabled?: boolean
          description?: string | null
          icon?: string | null
          id?: string
          option_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sidebar_permissions: {
        Row: {
          configured_by: string | null
          created_at: string
          enabled: boolean
          id: string
          option_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          configured_by?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          option_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          configured_by?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          option_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sidebar_permissions_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "sidebar_options"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          program: string | null
          semester: string | null
          student_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          program?: string | null
          semester?: string | null
          student_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          program?: string | null
          semester?: string | null
          student_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          credits: number
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          credits?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          credits?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_horas_programadas: {
        Args: { hora_inicio: string; hora_fin: string }
        Returns: number
      }
      can_manage_schedules: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_teacher_hours_summary: {
        Args: { teacher_uuid: string; start_date?: string; end_date?: string }
        Returns: {
          total_programadas: number
          total_cumplidas: number
          porcentaje_cumplimiento: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      estado_cronograma: "programado" | "en_curso" | "completado" | "cancelado"
      modalidad_clase: "presencial" | "virtual" | "hibrida"
      user_role:
        | "superadmin"
        | "admin"
        | "director"
        | "coordinador"
        | "asistente"
        | "docente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_cronograma: ["programado", "en_curso", "completado", "cancelado"],
      modalidad_clase: ["presencial", "virtual", "hibrida"],
      user_role: [
        "superadmin",
        "admin",
        "director",
        "coordinador",
        "asistente",
        "docente",
      ],
    },
  },
} as const
