import { useState, useEffect, useCallback } from "react";
import { loginOrRegisterStudent, getStudentById } from "@/lib/api/auth";
import { checkAdminCredentials } from "@/lib/adminAuth";
import type { User } from "@/types";

const SESSION_KEY = "messease.session";

interface StoredSession {
  role: "student" | "admin";
  studentId?: string; // only for students — re-fetched fresh on load
}

function saveSession(session: StoredSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore a previous session if there is one.
  useEffect(() => {
    const session = readSession();
    if (!session) {
      setLoading(false);
      return;
    }

    if (session.role === "admin") {
      setUser({ id: "admin-fixed", name: "Mess Admin", role: "admin" });
      setLoading(false);
      return;
    }

    if (session.role === "student" && session.studentId) {
      getStudentById(session.studentId)
        .then((profile) => setUser(profile))
        .finally(() => setLoading(false));
      return;
    }

    setLoading(false);
  }, []);

  const loginStudent = useCallback(async (name: string, rollNo: string, roomNo?: string) => {
    const profile = await loginOrRegisterStudent({ name, rollNo, roomNo });
    saveSession({ role: "student", studentId: profile.id });
    setUser(profile);
  }, []);

  const loginAdmin = useCallback((username: string, password: string) => {
    const adminUser = checkAdminCredentials(username, password);
    if (!adminUser) {
      throw new Error("Incorrect admin username or password.");
    }
    saveSession({ role: "admin" });
    setUser(adminUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return { user, loginStudent, loginAdmin, logout, isLoggedIn: !!user, loading };
}
