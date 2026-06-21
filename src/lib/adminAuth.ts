import type { User } from "@/types";

/**
 * The mess admin uses ONE fixed account — not stored in the database.
 * Credentials come from env vars so they're not hardcoded in source
 * control. Defaults below match the values set up for this project;
 * override them in .env if you want different ones.
 *
 * This is a simple, demo-appropriate check — not a secure auth system.
 * Anyone with the browser devtools open can read these values out of
 * the bundled JS, since this all runs client-side. Fine for a closed
 * class project; do not rely on this for real access control.
 */
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "messease2026";

const ADMIN_USER: User = {
  id: "admin-fixed",
  name: "Mess Admin",
  role: "admin",
};

export function checkAdminCredentials(username: string, password: string): User | null {
  if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return ADMIN_USER;
  }
  return null;
}
