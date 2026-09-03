import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[a-z]/, 'Doit contenir une minuscule')
  .regex(/[A-Z]/, 'Doit contenir une majuscule')
  .regex(/[0-9]/, 'Doit contenir un chiffre');

const madagascarPhoneRegex = /^(\+261|0)3[2-9]\d{7}$/;

export const registerFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.email('Email invalide').trim().toLowerCase().optional().or(z.literal('')),
    phone: z
      .string()
      .trim()
      .regex(madagascarPhoneRegex, 'Numéro invalide (ex: 034 12 345 67)')
      .optional()
      .or(z.literal('')),
    password: passwordSchema,
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: 'Renseignez un email ou un numéro de téléphone',
    path: ['email'],
  });

export const loginFormSchema = z.object({
  identifier: z.string().trim().min(3, 'Email ou téléphone requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
