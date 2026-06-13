import { test } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { switchTenant } from '../helpers/tenant';
import { createKernel } from '../helpers/flows';

test.describe('E2E Kernel Formulation', () => {
  test('User formulates Diagnosis, Guiding Policy and Coherent Actions', async ({ page }) => {
    await loginAs(page, 'planner@example.com', 'Pass123!');
    await switchTenant(page, 'E2E Tenant A');

    await createKernel(
      page,
      'El principal desafío es la retención de talento clave frente a competidores internacionales.',
      'Mejorar agresivamente la propuesta de valor al empleado mediante flexibilidad y opciones sobre acciones.',
      '1. Implementar trabajo 100% remoto. 2. Lanzar programa de ESOP en Q3.'
    );
  });
});
