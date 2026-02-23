/**
 * Top-level admin email: notifications (contact form) and schedule "Unavailable" permission.
 * Set ADMIN_NOTIFY_EMAIL in env; defaults to the single current admin (stayrange@gmail.com).
 * Later: can be loaded from DB (e.g. profiles where is_admin = true).
 */
const DEFAULT_ADMIN_EMAIL = 'stayrange@gmail.com';

export function getAdminNotifyEmail() {
  return process.env.ADMIN_NOTIFY_EMAIL || DEFAULT_ADMIN_EMAIL;
}

/** Same as getAdminNotifyEmail; use for any "is admin?" check (e.g. schedule Unavailable). */
export function getAdminEmail() {
  return getAdminNotifyEmail();
}
