
import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmar contraseña es requerido'),
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos'),
  fullName: z.string()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .max(100, 'El nombre completo no puede tener más de 100 caracteres'),
  role: z.enum(['docente', 'asistente', 'coordinador', 'director', 'admin', 'superadmin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
