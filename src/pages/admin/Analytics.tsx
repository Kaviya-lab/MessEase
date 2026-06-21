import { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Loader2 } from "lucide-react";
import { getAllComplaints } from "@/lib/api/complaints";
import { getAllPayments } from "@/lib/api/payments";
import { getTodaysAttendanceSummary } from "@/lib/api/attendance";
import type { Complaint, Payment, AttendanceSummary } from "@/types";

const COLORS = ["#ea5517", "#f0713a", "#f69e6a", "#fac5a3", "#fde3d1"];
const CATEGORIES: Complaint["category"][] = ["food", "hygiene", "service", "billing", "other"];

export default function Analytics() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllComplaints(), getAllPayments(), getTodaysAttendanceSummary()])
      .then(([c, p, a]) => {
        setComplaints(c);
        setPayments(p);
        setAttendance(a);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>;
  }

  const complaintData = CATEGORIES
    .map(cat => ({ name: cat.charAt(0).toUpperCase() + cat.slice(1), value: complaints.filter(c => c.category === cat).length }))
    .filter(d => d.value > 0);

  const attendanceChartData = (["breakfast", "lunch", "dinner"] as const).map(meal => {
    const s = attendance.find(a => a.meal === meal);
    return { meal: meal.charAt(0).toUpperCase() + meal.slice(1), attending: s?.attendingCount ?? 0, skipping: s?.skippingCount ?? 0 };
  });

  const totalRevenue = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status !== "paid").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Data-driven mess insights</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's attendance */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-gray-900 mb-4">Today's Attendance by Meal</h2>
          {attendanceChartData.every(d => d.attending === 0 && d.skipping === 0) ? (
            <p className="text-sm text-gray-400 text-center py-16">No attendance data yet today</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="meal" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="attending" fill="#ea5517" name="Attending" radius={[4, 4, 0, 0]} />
                <Bar dataKey="skipping" fill="#fde3d1" name="Skipping" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Complaint categories */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-gray-900 mb-4">Complaints by Category</h2>
          {complaintData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-16">No complaints yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={complaintData}
                  cx="50%" cy="50%" outerRadius={80}
                  dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {complaintData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue summary */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display font-semibold text-gray-900 mb-4">Revenue Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-50 text-center">
              <p className="text-2xl font-display font-bold text-green-600">₹{totalRevenue.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-500 mt-1">Collected</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 text-center">
              <p className="text-2xl font-display font-bold text-red-500">₹{totalPending.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-500 mt-1">Pending / Overdue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
