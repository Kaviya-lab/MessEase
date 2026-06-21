import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { getAnnouncements } from "@/lib/api/content";
import { timeAgo, cn } from "@/lib/utils";
import type { Announcement } from "@/types";

const priorityStyle: Record<Announcement["priority"], string> = {
  high: "border-l-red-400 bg-red-50",
  medium: "border-l-amber-400 bg-amber-50",
  low: "border-l-blue-300 bg-blue-50",
};
const priorityBadge: Record<Announcement["priority"], string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnnouncements().then(data => {
      setAnnouncements(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500 text-sm mt-1">Updates from the mess administration</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>
      ) : announcements.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className={cn("card p-5 border-l-4", priorityStyle[a.priority])}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
