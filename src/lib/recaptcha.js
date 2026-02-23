/**
 * reCAPTCHA v3 client helper for the main page.
 * Loads the script and returns a function to execute and get a token.
 */

const SCRIPT_URL = 'https://www.google.com/recaptcha/api.js';

export function getRecaptchaSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY || '';
}

let scriptLoaded = false;
let loadPromise = null;

function loadRecaptchaScript(siteKey) {
  if (scriptLoaded && typeof window.grecaptcha !== 'undefined') {
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window undefined'));
      return;
    }
    if (window.grecaptcha && window.grecaptcha.ready) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `${SCRIPT_URL}?render=${siteKey}`;
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('recaptcha script failed to load'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

/**
 * Run reCAPTCHA v3 and return the token.
 * @param {string} siteKey - NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY
 * @param {string} action - e.g. 'homepage'
 * @returns {Promise<string>} token to send to verify API
 */
export async function executeRecaptcha(siteKey, action = 'homepage') {
  if (!siteKey) return '';
  await loadRecaptchaScript(siteKey);
  return new Promise((resolve) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(siteKey, { action }).then(resolve).catch(() => resolve(''));
    });
  });
}

/**
 * Minimum score per action (for gating in UI).
 * Use these so you can review action metrics in Google reCAPTCHA admin.
 */
export const RECAPTCHA_THRESHOLDS = {
  homepage: 0.5,
  schedule: 0.6,
  classes: 0.6,
  contact: 0.6,
  login: 0.7,
  logout: 0.6,
};

/**
 * Execute reCAPTCHA with the given action and verify via our API.
 * Returns { ok, score }. Use RECAPTCHA_THRESHOLDS[action] to gate.
 */
export async function executeAndVerify(action = 'homepage') {
  const siteKey = getRecaptchaSiteKey();
  if (!siteKey) return { ok: true, score: 1 };
  const token = await executeRecaptcha(siteKey, action);
  if (!token) return { ok: false, score: 0 };
  try {
    const res = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    });
    const data = await res.json();
    return { ok: !!data.ok, score: typeof data.score === 'number' ? data.score : 0 };
  } catch {
    return { ok: false, score: 0 };
  }
}

/**
 * Run reCAPTCHA for an action and return whether the score meets the threshold.
 */
export async function checkActionAllowed(action) {
  const threshold = RECAPTCHA_THRESHOLDS[action] ?? 0.5;
  const { ok, score } = await executeAndVerify(action);
  return { allowed: ok && score >= threshold, score };
}
