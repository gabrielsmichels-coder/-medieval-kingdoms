import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
const dir = mkdtempSync(path.join(tmpdir(), 'kingdom-browser-'));
const database = path.join(dir, 'browser.db');
writeFileSync(database, '');
const env = { ...process.env, DATABASE_URL: `file:${database}`, GAME_SPEED: '12', PORT: '3002' };
execFileSync(path.resolve('node_modules/.bin/prisma'), ['migrate', 'deploy'], {
  env,
  stdio: 'pipe',
});
const server = spawn(process.execPath, ['dist-server/index.js'], { env, stdio: 'pipe' });
const base = 'http://127.0.0.1:3002';
for (let i = 0; i < 50; i++) {
  try {
    if ((await fetch(base + '/api/health')).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 100));
}
mkdirSync('test-results', { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
try {
  await page.goto(base);
  await page.getByRole('heading', { name: 'A village. A vision. A kingdom.' }).waitFor();
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Close building details' }).click();
  assert.equal(await page.getByRole('heading', { name: 'Headquarters', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Zoom in village map' }).click();
  await page.getByText('140%', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Zoom out village map' }).click();
  await page.getByText('100%', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Timber Camp, level 1' }).click();
  await page.getByRole('heading', { name: 'Timber Camp', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Upgrade building', exact: true }).click();
  await page.getByText('Lv. 2', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Buildings', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Military', exact: true }).click();
  await page.getByRole('heading', { name: 'Raise your banners' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Locked', exact: true }).count(), 6);
  await page.getByRole('button', { name: 'Research', exact: true }).click();
  await page.getByRole('heading', { name: 'The art of advancement' }).waitFor();
  await page.getByRole('button', { name: 'Rally Point', exact: true }).click();
  await page.getByRole('heading', { name: 'The rally point', exact: true }).waitFor();
  await page.getByRole('button', { name: /Reports/ }).click();
  await page.getByRole('button', { name: 'Mark all read' }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Village name').fill('Oakheart');
  await page.getByRole('button', { name: 'Save village name' }).click();
  await page.getByRole('button', { name: 'Saved', exact: true }).waitFor();
  await page.reload();
  await page.getByRole('heading', { name: 'A village. A vision. A kingdom.' }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    'No horizontal overflow',
  );
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Military', exact: true }).click();
  await page.getByRole('heading', { name: 'Raise your banners' }).waitFor();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/mobile-military.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  console.log(
    'Browser checks passed: desktop, map selection, purchase, navigation, settings persistence, mobile layout, no runtime errors.',
  );
} finally {
  await browser.close();
  server.kill('SIGTERM');
  await new Promise((r) => server.once('exit', r));
  rmSync(dir, { recursive: true, force: true });
}
