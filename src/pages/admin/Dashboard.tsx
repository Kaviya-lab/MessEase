import { useState, useEffect, useCallback } from "react";
import { Users, TrendingUp, MessageSquare, IndianRupee, UtensilsCrossed, Loader2 } from "lucide-react";
import { getTodaysAttendanceSummary, subscribeToAttendance } from "@/lib/api/attendance";
import { getAllStudents } from "@/lib/api/auth";
import { getAllComplaints } from "@/lib/api/complaints";
import { getAllPayments } from "@/lib/api/payments";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import type { AttendanceSummary, Complaint, Payment, User } from "@/types";

const statusStyle: Record<Complaint["status"], string> = {
  open: "bg-red-100 text-red-700",
  "in-progress": "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

export default function AdminDashboard() {
  const [students, setStudents] = useState<User[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [s, sum, c, p] = await Promise.all([
      getAllStudents(),
      getTodaysAttendanceSummary(),
      getAllComplaints(),
      getAllPayments(),
    ]);
    setStudents(s);
    setSummary(sum);
    setComplaints(c);
    setPayments(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
    // Live updates: whenever any student marks attendance, this dashboard
    // refreshes automatically — no page reload needed.
    const unsubscribe = subscribeToAttendance(loadAll);
    return unsubscribe;
  }, [loadAll]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  const lunchSummary = summary.find(s => s.meal === "lunch");
  const totalAttendingToday = summary.reduce((sum, s) => sum + s.attendingCount, 0);
  const pendingComplaints = complaints.filter(c => c.status !== "resolved").length;
  const monthlyRevenue = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Live mess operations — updates automatically</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: students.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50", sub: "registered" },
          { label: "Marked Attending Today", value: totalAttendingToday, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", sub: "across all meals" },
          { label: "Pending Complaints", value: pendingComplaints, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50", sub: "need action" },
          { label: "Revenue Collected", value: formatCurrency(monthlyRevenue), icon: IndianRupee, color: "text-brand-600", bg: "bg-brand-50", sub: "all time" },
        ].map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="card p-4">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-xl font-display font-bold text-gray-900 mt-0.5">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* THE answer to "how many students are coming" */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-brand-500" />
            Today's Headcount by Meal
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Live count from students who've marked attendance — refreshes automatically as they toggle
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(["breakfast", "lunch", "dinner"] as const).map(meal => {
              const s = summary.find(x => x.meal === meal);
              const attending = s?.attendingCount ?? 0;
              const totalMarked = s?.totalMarked ?? 0;
              const pct = students.length > 0 ? Math.round((attending / students.length) * 100) : 0;

              return (
                <div key={meal} className="p-4 rounded-xl bg-gray-50 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{meal}</p>
                  <p className="text-3xl font-display font-bold text-brand-600">{attending}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    of {students.length} students ({pct}%)
                  </p>
                  <p className="text-[11px] text-gray-300 mt-1">{totalMarked} have responded</p>
                </div>
              );
            })}
          </div>
          {!lunchSummary && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              No attendance marked yet today — counts will appear as students respond.
            </p>
          )}
        </div>

        {/* Recent complaints */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-gray-900 mb-4">Recent Complaints</h2>
          {complaints.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No complaints yet</p>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 4).map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-800 leading-snug">{c.title}</p>
                    <span className={cn("badge shrink-0 capitalize", statusStyle[c.status])}>{c.status.replace("-", " ")}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{c.studentName ?? "Unknown"} · {timeAgo(c.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
