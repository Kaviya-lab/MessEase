import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { getAllComplaints, updateComplaintStatus } from "@/lib/api/complaints";
import { formatDate, cn } from "@/lib/utils";
import type { Complaint } from "@/types";

const statusStyle: Record<Complaint["status"], string> = {
  open: "bg-red-100 text-red-700",
  "in-progress": "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Complaint["status"] | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getAllComplaints();
    setComplaints(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? complaints : complaints.filter(c => c.status === filter);

  const updateStatus = async (id: string, status: Complaint["status"]) => {
    setUpdatingId(id);
    try {
      await updateComplaintStatus(id, status);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Complaints</h1>
        <p className="text-gray-500 text-sm mt-1">Review and resolve student complaints</p>
      </div>

      <div className="flex gap-2">
        {(["all", "open", "in-progress", "resolved"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              filter === s ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
            }`}
          >
            {s.replace("-", " ")} {s === "all" && `(${complaints.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No complaints in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="badge bg-gray-100 text-gray-600 capitalize">{c.category}</span>
                    <span className={cn("badge capitalize", statusStyle[c.status])}>{c.status.replace("-", " ")}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {c.studentName ?? "Unknown student"} · {formatDate(c.createdAt)}
                  </p>
                </div>
                {c.status !== "resolved" && (
                  <div className="flex flex-col gap-2">
                    {c.status === "open" && (
                      <button
                        onClick={() => updateStatus(c.id, "in-progress")}
                        disabled={updatingId === c.id}
                        className="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors whitespace-nowrap disabled:opacity-60"
                      >
                        Start Review
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(c.id, "resolved")}
                      disabled={updatingId === c.id}
                      className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-60"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
