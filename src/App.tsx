import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";

import StudentDashboard from "@/pages/student/Dashboard";
import Menu from "@/pages/student/Menu";
import Attendance from "@/pages/student/Attendance";
import Complaints from "@/pages/student/Complaints";
import Payments from "@/pages/student/Payments";
import Announcements from "@/pages/student/Announcements";

import AdminDashboard from "@/pages/admin/Dashboard";
import ManageMenu from "@/pages/admin/ManageMenu";
import Students from "@/pages/admin/Students";
import AdminComplaints from "@/pages/admin/AdminComplaints";
import AdminPayments from "@/pages/admin/AdminPayments";
import Analytics from "@/pages/admin/Analytics";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";

export default function App() {
  const { user, loginStudent, loginAdmin, logout, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isLoggedIn || !user ? (
          <Route path="*" element={<Login onStudentLogin={loginStudent} onAdminLogin={loginAdmin} />} />
        ) : user.role === "student" ? (
          <Route element={<AppLayout user={user} onLogout={logout} />}>
            <Route path="/student" element={<StudentDashboard user={user} />} />
            <Route path="/student/menu" element={<Menu />} />
            <Route path="/student/attendance" element={<Attendance user={user} />} />
            <Route path="/student/complaints" element={<Complaints user={user} />} />
            <Route path="/student/payments" element={<Payments user={user} />} />
            <Route path="/student/announcements" element={<Announcements />} />
            <Route path="*" element={<Navigate to="/student" replace />} />
          </Route>
        ) : (
          <Route element={<AppLayout user={user} onLogout={logout} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/menu" element={<ManageMenu />} />
            <Route path="/admin/students" element={<Students />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
