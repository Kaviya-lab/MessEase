import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import type { User } from "@/types";

interface AppLayoutProps {
  user: User;
  onLogout: () => void | Promise<void>;
}

export default function AppLayout({ user, onLogout }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
