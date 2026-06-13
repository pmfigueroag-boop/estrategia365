import { z } from 'zod';

export const onboardingSchema = z.object({
  // ── Step 1: Identidad ──────────────────────────────────────
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  sector: z.enum(['private', 'public'], {
    required_error: 'El sector es requerido',
  }),
  industry: z.string().min(1, 'La industria es requerida'),
  size: z.string().min(1, 'El tamaño es requerido'),
  geography: z.string().optional().default(''),
  country: z.string().optional().default(''),
  international_presence: z.string().optional().default(''),
  employees: z.coerce.number().min(0, 'No puede ser negativo').optional().default(0),
  annual_revenue: z.string().optional().default(''),
  annual_revenue_amount: z.coerce.number().min(0).optional().default(0),
  annual_revenue_currency: z.string().optional().default('USD'),

  // ── Step 2: Misión & Estrategia ────────────────────────────
  mission: z.string().optional().default(''),
  vision: z.string().optional().default(''),
  values: z.string().optional().default(''),
  products_services: z.string().optional().default(''),
  market_position: z.string().optional().default(''),

  // ── Step 3: Contexto Competitivo ───────────────────────────
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  competitive_context: z.string().optional().default(''),
});
