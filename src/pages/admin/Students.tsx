import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllStudents } from "@/lib/api/auth";
import { getAllPayments } from "@/lib/api/payments";
import type { User, Payment } from "@/types";

export default function Students() {
  const [students, setStudents] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([getAllStudents(), getAllPayments()]).then(([s, p]) => {
      setStudents(s);
      setPayments(p);
      setLoading(false);
    });
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCountFor = (studentId: string) =>
    payments.filter(p => p.studentId === studentId && p.status !== "paid").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Students</h1>
        <p className="text-gray-500 text-sm mt-1">{students.length} registered students</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input pl-10"
          placeholder="Search by name or roll number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Student", "Roll No", "Room", "Payment Status"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(s => {
                const pendingCount = pendingCountFor(s.id);
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <p className="font-medium text-gray-900">{s.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-600">{s.rollNo || "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{s.roomNo || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${pendingCount > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {pendingCount > 0 ? `${pendingCount} due` : "All paid"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">No students found</p>
          )}
        </div>
      )}
    </div>
  );
}
