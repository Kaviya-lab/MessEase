import { useState, useEffect, useCallback } from "react";
import { Plus, MessageSquare, Loader2 } from "lucide-react";
import { getMyComplaints, createComplaint } from "@/lib/api/complaints";
import { formatDate, cn } from "@/lib/utils";
import type { Complaint, User } from "@/types";

interface Props { user: User }

const statusStyle: Record<Complaint["status"], string> = {
  open: "bg-red-100 text-red-700",
  "in-progress": "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

export default function Complaints({ user }: Props) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "food" as Complaint["category"] });

  const load = useCallback(async () => {
    const data = await getMyComplaints(user.id);
    setComplaints(data);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.title || !form.description) return;
    setSubmitting(true);
    try {
      await createComplaint({ studentId: user.id, ...form });
      setForm({ title: "", description: "", category: "food" });
      setShowForm(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-500 text-sm mt-1">Raise and track mess complaints</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Complaint
        </button>
      </div>

      {showForm && (
        <div className="card p-5 border-2 border-brand-200">
          <h2 className="font-display font-semibold text-gray-900 mb-4">New Complaint</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value as Complaint["category"] }))}
                className="input mt-1"
              >
                {["food", "hygiene", "service", "billing", "other"].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</label>
              <input
                className="input mt-1" placeholder="Brief summary..."
                value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</label>
              <textarea
                className="input mt-1 min-h-[100px] resize-none" placeholder="Describe the issue in detail..."
                value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={submit} disabled={submitting} className="btn-primary disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>
      ) : complaints.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No complaints yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="badge bg-gray-100 text-gray-600 capitalize">{c.category}</span>
                    <span className={cn("badge capitalize", statusStyle[c.status])}>{c.status.replace("-", " ")}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">{formatDate(c.createdAt)}{c.resolvedAt && ` · Resolved ${formatDate(c.resolvedAt)}`}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
