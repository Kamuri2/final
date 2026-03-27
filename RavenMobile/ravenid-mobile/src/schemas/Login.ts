import { z } from 'zod';

// Criterio matemático de validación
export const loginSchema = z.object({
  // La matrícula es un texto, de mínimo 4 caracteres, máximo 20, sin espacios.
  matricula: z.string()
    .min(4, "La matrícula debe tener al menos 4 caracteres")
    .max(20, "Matrícula demasiado larga")
    .trim()
    .toUpperCase(), // Lo pasamos a mayúsculas para congruencia
  
  // La contraseña es texto, mínimo 6 caracteres.
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .trim()
});

// Tipo de dato inferido de la validación
export type LoginInput = z.infer<typeof loginSchema>;