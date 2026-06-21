import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, CalendarCheck, MessageSquare,
  CreditCard, Bell, Settings, LogOut, ChefHat, Users, BarChart3,
} from "lucide-react";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: User;
  onLogout: () => void | Promise<void>;
}

const studentLinks = [
  { to: "/student", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/student/menu", icon: UtensilsCrossed, label: "Weekly Menu" },
  { to: "/student/attendance", icon: CalendarCheck, label: "My Attendance" },
  { to: "/student/complaints", icon: MessageSquare, label: "Complaints" },
  { to: "/student/payments", icon: CreditCard, label: "Payments" },
  { to: "/student/announcements", icon: Bell, label: "Announcements" },
];

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/menu", icon: ChefHat, label: "Manage Menu" },
  { to: "/admin/students", icon: Users, label: "Students" },
  { to: "/admin/complaints", icon: MessageSquare, label: "Complaints" },
  { to: "/admin/payments", icon: CreditCard, label: "Payments" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/announcements", icon: Bell, label: "Announcements" },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const links = user.role === "admin" ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-gray-900">MessEase</span>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role}{user.roomNo ? ` · ${user.roomNo}` : ""}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/student" || to === "/admin"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        <NavLink
          to="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          Settings
        </NavLink>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}
