import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[a-z]/, 'Le mot de passe doit contenir une minuscule')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre');

// Numéros mobiles malgaches : 032/033/034/037/038 + 7 chiffres,
// avec ou sans indicatif +261.
const madagascarPhoneRegex = /^(\+261|0)3[2-9]\d{7}$/;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(80),
    email: z.email('Email invalide').trim().toLowerCase().optional(),
    phone: z
      .string()
      .trim()
      .regex(madagascarPhoneRegex, 'Numéro invalide (ex: 034 12 345 67)')
      .optional(),
    password: passwordSchema,
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: 'Un email ou un numéro de téléphone est requis',
    path: ['email'],
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Email ou téléphone requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
