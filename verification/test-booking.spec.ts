import { test, expect } from '@playwright/test';

test('booking flow', async ({ page, request }) => {
  // 1. Get a formation ID from API
  const response = await request.get('http://localhost:3001/formations');
  expect(response.ok()).toBeTruthy();
  const formations = await response.json();
  const formation = formations.find((f: any) => f.title === 'Introduction to NestJS');

  expect(formation).toBeDefined();

  console.log(`Testing with formation: ${formation.title} (${formation.id})`);

  // 2. Go to formation page
  await page.goto(`http://localhost:3000/formation/${formation.id}`);

  // Wait for the booking widget to appear
  await expect(page.locator('text=Réserver cette formation')).toBeVisible();

  // Step 1: Zone
  await page.click('text=Sélectionner une zone');
  await expect(page.locator('text=Bruxelles')).toBeVisible();
  await page.click('text=Bruxelles');

  // Step 2: Trainer
  await expect(page.locator('text=2. Choisissez un formateur')).toBeVisible();
  await page.click('text=Sélectionner un formateur');
  await expect(page.locator('text=Jean Dupont')).toBeVisible();
  await page.click('text=Jean Dupont');

  // Step 3: Calendar
  await expect(page.locator('text=3. Choisissez une date')).toBeVisible();

  // Wait for calendar to be interactive
  await page.waitForTimeout(1000);

  // Debug: print some info about days
  const dayButtons = page.locator('.rdp-day_button');
  console.log('Total day buttons found:', await dayButtons.count());

  const enabledDays = page.locator('button.rdp-day_button:not([disabled])');
  const count = await enabledDays.count();
  console.log('Enabled day buttons found:', count);

  if (count === 0) {
     console.log('No enabled days in current month, trying next month');
     const nextMonthBtn = page.locator('button[name="next-month"]');
     if (await nextMonthBtn.isVisible()) {
        await nextMonthBtn.click();
     } else {
        await page.locator('button[aria-label="Next month"]').click();
     }

     await page.waitForTimeout(500);
     await page.locator('button.rdp-day_button:not([disabled])').first().click();
  } else {
     await enabledDays.first().click();
  }

  // Check if reserve button is enabled
  const reserveBtn = page.locator('button:has-text("Réserver")');
  await expect(reserveBtn).toBeEnabled();

  // Click it and handle alert
  page.on('dialog', async dialog => {
      console.log(`Alert message: ${dialog.message()}`);
      await dialog.accept();
  });

  await reserveBtn.click();
});
