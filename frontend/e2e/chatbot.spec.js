import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('chat integrado, minimizar, reabrir y adaptar a movil sin nuevas pestanas', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir chatbot', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Asistente PelisDark' });
  await expect(panel).toBeVisible();
  const frame = page.frameLocator('iframe[title="Conversacion con el asistente PelisDark"]');
  await expect(frame.getByText('Asistente de peliculas y series.', { exact: false })).toBeVisible({ timeout: 30000 });
  await expect(frame.getByRole('button', { name: 'Nueva conversacion' })).toBeVisible();
  expect(context.pages()).toHaveLength(1);
  const originalFrame = page.frames().find(f => f.url().includes('compact=true'));
  await mkdir('../.local/qa', { recursive: true });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const bounds = await panel.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
    await page.screenshot({ path: `../.local/qa/chat-panel-${width}.png` });
  }
  await page.getByRole('button', { name: 'Minimizar chatbot' }).click();
  await expect(panel).toBeHidden();
  await page.getByRole('button', { name: 'Conversar con PelisDark' }).click();
  await expect(panel).toBeVisible();
  expect(page.frames()).toContain(originalFrame);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.getByRole('button', { name: 'Conversar con PelisDark' })).toBeFocused();
});
