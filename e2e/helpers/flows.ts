import { Page, expect } from '@playwright/test';

/**
 * Creates a new strategic plan.
 */
export async function createPlan(page: Page, planName: string, startDate: string, endDate: string) {
  await page.goto('/strategy/plans');
  await page.getByRole('button', { name: /Nuevo Plan|New Plan/i }).click();
  await page.getByPlaceholder(/Nombre del plan|Plan name/i).fill(planName);
  await page.getByLabel(/Fecha de inicio|Start date/i).fill(startDate);
  await page.getByLabel(/Fecha de fin|End date/i).fill(endDate);
  await page.getByRole('button', { name: /Guardar|Save/i }).click();
  await expect(page.getByText(planName)).toBeVisible();
}

/**
 * Creates a strategic analysis (e.g., PESTEL).
 */
export async function createAnalysis(page: Page, analysisType: string, content: string) {
  await page.goto('/strategy/analysis');
  await page.getByRole('button', { name: new RegExp(`Nuevo ${analysisType}|New ${analysisType}`, 'i') }).click();
  await page.getByPlaceholder(/Descripción|Description/i).fill(content);
  await page.getByRole('button', { name: /Guardar|Save/i }).click();
  await expect(page.getByText(content.substring(0, 20))).toBeVisible();
}

/**
 * Creates Kernel (Diagnosis, Guiding Policy, Coherent Actions).
 */
export async function createKernel(page: Page, diagnosis: string, policy: string, action: string) {
  await page.goto('/strategy/kernel');
  // Assume there are tabs or sections
  await page.getByLabel(/Diagnóstico|Diagnosis/i).fill(diagnosis);
  await page.getByLabel(/Política Orientadora|Guiding Policy/i).fill(policy);
  await page.getByLabel(/Acciones Coherentes|Coherent Actions/i).fill(action);
  await page.getByRole('button', { name: /Guardar|Save/i }).click();
  await expect(page.getByText(/Guardado correctamente|Saved successfully/i)).toBeVisible();
}

/**
 * Creates an OKR.
 */
export async function createOKR(page: Page, objective: string, keyResult: string) {
  await page.goto('/execution/okrs');
  await page.getByRole('button', { name: /Nuevo Objetivo|New Objective/i }).click();
  await page.getByPlaceholder(/Título del Objetivo|Objective Title/i).fill(objective);
  await page.getByRole('button', { name: /Añadir Key Result|Add Key Result/i }).click();
  await page.getByPlaceholder(/Descripción del KR|KR Description/i).fill(keyResult);
  await page.getByRole('button', { name: /Guardar|Save/i }).click();
  await expect(page.getByText(objective)).toBeVisible();
}

/**
 * Runs a Wargaming Simulation.
 */
export async function runSimulation(page: Page, scenarioName: string) {
  await page.goto('/strategy/simulation');
  await page.getByRole('button', { name: /Nueva Simulación|New Simulation/i }).click();
  await page.getByPlaceholder(/Nombre del escenario|Scenario name/i).fill(scenarioName);
  await page.getByRole('button', { name: /Ejecutar Simulación|Run Simulation/i }).click();
  // Wait for simulation to finish (this might take a while if not mocked)
  await expect(page.getByText(/Resultados de Simulación|Simulation Results/i)).toBeVisible({ timeout: 15000 });
}
