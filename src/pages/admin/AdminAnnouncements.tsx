import { useState, useEffect, useCallback } from "react";
import { Plus, Bell, Trash2, Loader2 } from "lucide-react";
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from "@/lib/api/content";
import { timeAgo, cn } from "@/lib/utils";
import type { Announcement } from "@/types";

const priorityBadge: Record<Announcement["priority"], string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", priority: "medium" as Announcement["priority"] });

  const load = useCallback(async () => {
    const data = await getAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.title || !form.body) return;
    setSubmitting(true);
    try {
      await createAnnouncement(form);
      setForm({ title: "", body: "", priority: "medium" });
      setShowForm(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    await deleteAnnouncement(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">Broadcast updates to all students</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {showForm && (
        <div className="card p-5 border-2 border-brand-200">
          <h2 className="font-display font-semibold text-gray-900 mb-4">New Announcement</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(prev => ({ ...prev, priority: e.target.value as Announcement["priority"] }))}
                className="input mt-1"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</label>
              <input
                className="input mt-1" placeholder="Announcement title..."
                value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</label>
              <textarea
                className="input mt-1 min-h-[100px] resize-none" placeholder="Write the announcement..."
                value={form.body} onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={submit} disabled={submitting} className="btn-primary disabled:opacity-60">
                {submitting ? "Publishing..." : "Publish"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>
      ) : announcements.length === 0 ? (
        <div className="card p-12 text-center text-gray-400 text-sm">No announcements yet</div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("badge capitalize", priorityBadge[a.priority])}>{a.priority}</span>
                      <span className="text-xs text-gray-400">{timeAgo(a.createdAt)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{a.body}</p>
                  </div>
                </div>
                <button onClick={() => remove(a.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
