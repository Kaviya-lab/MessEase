import { useState, useEffect, useCallback } from "react";
import { IndianRupee, Loader2, Plus, X } from "lucide-react";
import { getAllPayments, createPaymentForAllStudents, markPaymentPaid } from "@/lib/api/payments";
import { getAllStudents } from "@/lib/api/auth";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Payment } from "@/types";

const statusStyle: Record<Payment["status"], string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBillForm, setShowBillForm] = useState(false);
  const [billing, setBilling] = useState(false);
  const [form, setForm] = useState({ amount: "2800", month: "", dueDate: "" });

  const load = useCallback(async () => {
    const [p, students] = await Promise.all([getAllPayments(), getAllStudents()]);
    setPayments(p);
    setStudentCount(students.length);
    setLoading(false);
    return students;
  }, []);

  useEffect(() => { load(); }, [load]);

  const billAllStudents = async () => {
    if (!form.amount || !form.month || !form.dueDate) return;
    setBilling(true);
    try {
      const students = await getAllStudents();
      await createPaymentForAllStudents({
        studentIds: students.map(s => s.id),
        amount: Number(form.amount),
        month: form.month,
        dueDate: form.dueDate,
      });
      setShowBillForm(false);
      setForm({ amount: "2800", month: "", dueDate: "" });
      await load();
    } finally {
      setBilling(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    await markPaymentPaid(id);
    await load();
  };

  const paid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter(p => p.status === "overdue" || p.status === "pending").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Track and bill mess fees</p>
        </div>
        <button onClick={() => setShowBillForm(!showBillForm)} className="btn-primary flex items-center gap-2">
          {showBillForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          Bill All Students
        </button>
      </div>

      {showBillForm && (
        <div className="card p-5 border-2 border-brand-200">
          <h2 className="font-display font-semibold text-gray-900 mb-1">Bill All Students</h2>
          <p className="text-xs text-gray-400 mb-4">
            Creates a pending payment due for all {studentCount} registered students
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount (₹)</label>
              <input className="input mt-1" type="number" value={form.amount} onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Month Label</label>
              <input className="input mt-1" placeholder="July 2026" value={form.month} onChange={e => setForm(prev => ({ ...prev, month: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</label>
              <input className="input mt-1" type="date" value={form.dueDate} onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))} />
            </div>
          </div>
          <button onClick={billAllStudents} disabled={billing} className="btn-primary mt-4 disabled:opacity-60">
            {billing ? "Billing..." : `Bill ${studentCount} Students`}
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Collected", value: formatCurrency(paid), color: "text-green-600" },
          { label: "Pending / Overdue", value: formatCurrency(overdue), color: "text-red-500" },
          { label: "Total Records", value: payments.length, color: "text-gray-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
            <p className={`text-xl font-display font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-brand-500" />
          <h2 className="font-display font-semibold text-gray-900">All Payments</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-brand-400 animate-spin" /></div>
        ) : payments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No payment records yet — bill students to get started</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Student", "Month", "Amount", "Due Date", "Paid On", "Status", ""].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{p.studentName ?? "Unknown"}</td>
                    <td className="px-5 py-3.5 text-gray-600">{p.month}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(p.dueDate)}</td>
                    <td className="px-5 py-3.5 text-gray-500">{p.paidOn ? formatDate(p.paidOn) : "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("badge capitalize", statusStyle[p.status])}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.status !== "paid" && (
                        <button onClick={() => handleMarkPaid(p.id)} className="text-xs text-brand-600 font-semibold hover:underline">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
