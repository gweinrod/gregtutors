# Release checklist: push to Git and reload the server

Use this when you’ve made changes locally and want to get them live on the VPS.

---

## 1. On your PC (before pushing)

- [ ] Don’t commit `.env`, `.env.local`, or `.env.production` (they’re in `.gitignore`).
- [ ] Don’t commit `.next/` (build output; also in `.gitignore`).

---

## 2. Push to Git (on your PC)

From the repo root (e.g. `c:\Cursor Coding\Tutoring Web Application\gregtutors`):

```powershell
git add -A
git status
git commit -m "Your short description of the change"
git push origin main
```

Use your real branch name if it’s not `main` (e.g. `master`).

---

## 3. Reload the app on the VPS

SSH into the server, then run from the app directory:

```bash
cd /var/www/gregtutors
git pull origin main
npm ci
npm run build
pm2 restart gregtutors
```

**One-liner (same directory):**

```bash
cd /var/www/gregtutors && git pull origin main && npm ci && npm run build && pm2 restart gregtutors
```

---

## 4. Quick checks on the VPS

| What you want | Command |
|---------------|--------|
| App status | `pm2 status` |
| Live logs | `pm2 logs gregtutors` |
| Restart only (no new code) | `pm2 restart gregtutors` |
| Stop app | `pm2 stop gregtutors` |
| Start app | `pm2 start gregtutors` |

---

## 5. If something broke after a release

**Rollback to previous commit on the server:**

```bash
cd /var/www/gregtutors
git log --oneline -5
git checkout <previous-commit-hash>
npm ci
npm run build
pm2 restart gregtutors
```

Then fix the issue locally and push again. To go back to the latest code: `git checkout main` (or your branch name) and repeat build + restart.

---

## Summary

1. **PC:** `git add -A` → `git commit -m "..."` → `git push origin main`
2. **VPS:** `cd /var/www/gregtutors` → `git pull origin main` → `npm ci` → `npm run build` → `pm2 restart gregtutors`
