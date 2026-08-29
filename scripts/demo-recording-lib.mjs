/**
 * Utilitaires communs pour les démos vidéo IAHome (Playwright + ffmpeg).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import jwt from 'jsonwebtoken';

const require = createRequire(import.meta.url);

export const OUT_DIR = 'C:\\Users\\AAA\\Videos\\Davinci\\medias\\Videos\\Ecran';
export const TARGET_DURATION_SEC = 15;
export const JWT_SECRET = 'votre-jwt-secret-tres-securise-changez-cela-immediatement';
export const USER_ID = 'a98e083e-d4e3-498f-bc1e-c0747c888f99';
export const USER_EMAIL = 'formateur_tic@hotmail.com';
export const SAMPLE_IMAGE = path.join(process.cwd(), 'public', 'og-image.jpg');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function ffmpegPath() {
  try {
    const mod = require('ffmpeg-static');
    if (mod) return mod;
  } catch {
    /* fallback */
  }
  return 'ffmpeg';
}

export function probeDurationSeconds(inputPath) {
  const r = spawnSync(ffmpegPath(), ['-i', inputPath], { encoding: 'utf8' });
  const m = (r.stderr || '').match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!m) return null;
  return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseFloat(m[3]);
}

export function finalizeVideo(rawPath, outputPath, targetSec = TARGET_DURATION_SEC) {
  const duration = probeDurationSeconds(rawPath);
  if (!duration) return false;

  const speed = Math.max(duration / targetSec, 1);
  const padSec = Math.max(0, targetSec - duration / speed).toFixed(3);
  const filters =
    speed > 1.02
      ? [`setpts=PTS/${speed.toFixed(5)}`, `tpad=stop_mode=clone:stop_duration=${padSec}`].join(',')
      : `tpad=stop_mode=clone:stop_duration=${Math.max(0, targetSec - duration).toFixed(3)}`;

  const r = spawnSync(
    ffmpegPath(),
    [
      '-y',
      '-i',
      rawPath,
      '-filter:v',
      filters,
      '-t',
      String(targetSec),
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-an',
      outputPath,
    ],
    { encoding: 'utf8' }
  );
  if (r.status !== 0 && r.stderr) console.warn(r.stderr.slice(0, 300));
  return r.status === 0;
}

export function buildToken(moduleId, moduleTitle = moduleId) {
  return jwt.sign(
    {
      userId: USER_ID,
      userEmail: USER_EMAIL,
      moduleId,
      moduleTitle,
      accessLevel: 'premium',
      expiresAt: 4102444800000,
      permissions: ['read', 'access', 'write', 'advanced_features'],
      issuedAt: Date.now(),
      iat: Math.floor(Date.now() / 1000),
      exp: 4102444800,
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );
}

export function buildAppUrl(baseUrl, token) {
  if (baseUrl.startsWith('/')) {
    return `https://iahome.fr${baseUrl}?token=${encodeURIComponent(token)}`;
  }
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}token=${encodeURIComponent(token)}`;
}

export function outFile(slug) {
  return path.join(OUT_DIR, `${slug}-demo-fonctionnement.mp4`);
}

export async function scrollSteps(page, steps = 5, pauseMs = 180) {
  await page.evaluate(
    async ({ steps: s, pauseMs: p }) => {
      const scrollable = document.scrollingElement || document.documentElement;
      for (let i = 0; i <= s; i++) {
        scrollable.scrollTop = (scrollable.scrollHeight * i) / s;
        await new Promise((r) => setTimeout(r, p));
      }
    },
    { steps, pauseMs }
  );
}

export async function dismissModals(page) {
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await page
      .getByRole('button', { name: /No Thanks|Accepter|Fermer|Skip|Okay|Got it/i })
      .first()
      .click({ timeout: 800, force: true })
      .catch(() => {});
    await sleep(250);
  }
}

export async function clickFirstButton(page, pattern) {
  const btn = page.getByRole('button', { name: pattern }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click({ timeout: 5000 }).catch(() => {});
    return true;
  }
  return false;
}

export async function waitForEnabledTextarea(page, timeout = 60000) {
  await page.waitForFunction(
    () => {
      const areas = [...document.querySelectorAll('textarea')];
      return areas.some((ta) => !ta.disabled && ta.offsetParent !== null);
    },
    null,
    { timeout }
  );
}

export async function fillFirstTextarea(page, text) {
  await waitForEnabledTextarea(page).catch(() => {});

  const selectors = [
    'textarea:not([disabled]):visible',
    '.gradio-textbox textarea:not([disabled])',
    '[data-testid="textbox"]:not([disabled])',
    'textarea:visible',
  ];

  for (const sel of selectors) {
    const ta = page.locator(sel).first();
    if (!(await ta.count())) continue;
    try {
      await ta.fill(text, { timeout: 8000 });
      return true;
    } catch {
      /* try next selector */
    }
  }

  const filled = await page.evaluate((value) => {
    const ta =
      document.querySelector('textarea:not([disabled])') ||
      document.querySelector('.gradio-textbox textarea') ||
      document.querySelector('textarea');
    if (!ta) return false;
    ta.disabled = false;
    ta.focus();
    ta.value = value;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, text);
  return filled;
}

export async function fillGradioPrompt(page, containerSelector, text) {
  const box = page.locator(`${containerSelector} textarea`).first();
  if (await box.count()) {
    await waitForEnabledTextarea(page).catch(() => {});
    await box.fill(text);
    return;
  }
  await fillFirstTextarea(page, text);
}

export async function uploadFirstFile(page, filePath) {
  if (!fs.existsSync(filePath)) return false;
  const input = page.locator('input[type="file"]').first();
  if (await input.count()) {
    await input.setInputFiles(filePath);
    return true;
  }
  return false;
}

export async function cardIntro(page, slug) {
  await page.goto(`https://iahome.fr/card/${slug}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(1400);
  await scrollSteps(page, 3, 200);
  await sleep(700);
}

export function cleanupTmp(tmpDir) {
  if (!fs.existsSync(tmpDir)) return;
  for (const f of fs.readdirSync(tmpDir)) {
    fs.unlinkSync(path.join(tmpDir, f));
  }
  fs.rmdirSync(tmpDir);
}
