import { useState, useEffect, useCallback } from "react";
import { UtensilsCrossed, IndianRupee, MessageSquare, Bell, TrendingUp, Check, X, Loader2 } from "lucide-react";
import { getWeeklyMenu, getAnnouncements } from "@/lib/api/content";
import { getMyPayments, markPaymentPaid } from "@/lib/api/payments";
import { getMyComplaints } from "@/lib/api/complaints";
import { getMyTodayAttendance } from "@/lib/api/attendance";
import { formatCurrency, timeAgo } from "@/lib/utils";
import type { Announcement, Attendance, MenuItem, Payment, User, Complaint } from "@/types";

interface Props { user: User }

const mealTime = () => {
  const h = new Date().getHours();
  if (h < 9) return "breakfast";
  if (h < 14) return "lunch";
  return "dinner";
};

const TODAY_NAME = new Date().toLocaleDateString("en-US", { weekday: "long" });

export default function StudentDashboard({ user }: Props) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const currentMeal = mealTime();

  const load = useCallback(async () => {
    const [m, a, p, c, att] = await Promise.all([
      getWeeklyMenu(),
      getAnnouncements(),
      getMyPayments(user.id),
      getMyComplaints(user.id),
      getMyTodayAttendance(user.id),
    ]);
    setMenu(m);
    setAnnouncements(a);
    setPayments(p);
    setComplaints(c);
    setAttendance(att);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  const todayMenu = menu.filter(m => m.dayOfWeek === TODAY_NAME);
  const pendingPayment = payments.find(p => p.status !== "paid");
  const openComplaints = complaints.filter(c => c.status !== "resolved").length;
  const attendingCount = attendance.filter(a => a.attending).length;
  const latestAnnouncement = announcements[0];

  const handlePay = async () => {
    if (!pendingPayment) return;
    setPaying(true);
    await new Promise(resolve => setTimeout(resolve, 900));
    await markPaymentPaid(pendingPayment.id);
    await load();
    setPaying(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Good {currentMeal === "breakfast" ? "morning" : currentMeal === "lunch" ? "afternoon" : "evening"}, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your mess summary for today</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Payment Status",
            value: pendingPayment ? "Due" : "Up to date",
            icon: IndianRupee,
            color: pendingPayment ? "text-red-500" : "text-green-600",
            bg: pendingPayment ? "bg-red-50" : "bg-green-50",
          },
          { label: "Meals Attending Today", value: `${attendingCount}/${attendance.length || 3}`, icon: UtensilsCrossed, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Open Complaints", value: openComplaints, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Announcements", value: announcements.length, icon: Bell, color: "text-brand-600", bg: "bg-brand-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-xl font-display font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's menu */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-brand-500" />
            Today's Menu — {TODAY_NAME}
          </h2>
          {todayMenu.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No menu added for today yet</p>
          ) : (
            (["breakfast", "lunch", "dinner"] as const).map(meal => {
              const items = todayMenu.filter(m => m.meal === meal);
              if (items.length === 0) return null;
              return (
                <div key={meal} className={`mb-3 p-3 rounded-xl ${meal === currentMeal ? "bg-brand-50 border border-brand-200" : "bg-gray-50"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${meal === currentMeal ? "text-brand-600" : "text-gray-400"}`}>
                    {meal} {meal === currentMeal && "← Now"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map(item => (
                      <span key={item.id} className={`text-xs px-2 py-1 rounded-lg font-medium ${item.isVeg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          {/* Attendance today */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              Today's Attendance
            </h2>
            {attendance.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                You haven't marked attendance yet — go to "My Attendance" to let the mess know
              </p>
            ) : (
              <div className="flex gap-3">
                {attendance.map(a => (
                  <div key={a.id} className={`flex-1 flex flex-col items-center p-3 rounded-xl ${a.attending ? "bg-green-50" : "bg-gray-100"}`}>
                    {a.attending
                      ? <Check className="w-5 h-5 text-green-600 mb-1" />
                      : <X className="w-5 h-5 text-gray-400 mb-1" />
                    }
                    <p className="text-xs font-medium capitalize text-gray-700">{a.meal}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment status */}
          {pendingPayment && (
            <div className="card p-5 border-l-4 border-red-400">
              <p className="text-sm font-semibold text-red-600 mb-1">Payment Due</p>
              <p className="text-xs text-gray-500 mb-3">{pendingPayment.month}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-display font-bold text-gray-900">
                  {formatCurrency(pendingPayment.amount)}
                </span>
                <button onClick={handlePay} disabled={paying} className="btn-primary text-xs py-2 px-4 disabled:opacity-60">
                  {paying ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          )}

          {/* Latest announcement */}
          {latestAnnouncement && (
            <div className="card p-5">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Latest</p>
              <p className="font-semibold text-gray-900 text-sm">{latestAnnouncement.title}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{latestAnnouncement.body}</p>
              <p className="text-xs text-gray-400 mt-2">{timeAgo(latestAnnouncement.createdAt)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
