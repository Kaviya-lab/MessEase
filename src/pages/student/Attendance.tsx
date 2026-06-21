import { useState, useEffect, useCallback } from "react";
import { Check, X, Calendar, Loader2 } from "lucide-react";
import { getMyTodayAttendance, setAttendance as setAttendanceApi } from "@/lib/api/attendance";
import type { Attendance as AttendanceRecord, User } from "@/types";

interface Props { user: User }

const MEALS = ["breakfast", "lunch", "dinner"] as const;

export default function Attendance({ user }: Props) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMeal, setSavingMeal] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await getMyTodayAttendance(user.id);
    setAttendance(rows);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const getMealRecord = (meal: typeof MEALS[number]) =>
    attendance.find(a => a.meal === meal);

  const toggle = async (meal: typeof MEALS[number]) => {
    const current = getMealRecord(meal);
    const nextAttending = current ? !current.attending : true;

    setSavingMeal(meal);
    try {
      await setAttendanceApi(user.id, meal, nextAttending);
      await load();
    } finally {
      setSavingMeal(null);
    }
  };

  const attendingCount = MEALS.filter(m => getMealRecord(m)?.attending ?? false).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">
          Mark your meal attendance for today — the mess manager sees this live
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-green-600">{attendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Attending Today</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-red-500">{3 - attendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Skipping Today</p>
        </div>
      </div>

      {/* Today's toggle */}
      <div className="card p-5">
        <h2 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-500" />
          Today
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Tap a meal to mark whether you'll be attending. This updates instantly for the mess admin.
        </p>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {MEALS.map(meal => {
              const record = getMealRecord(meal);
              const attending = record?.attending ?? false;
              const isUnset = !record;
              const isSaving = savingMeal === meal;

              return (
                <button
                  key={meal}
                  onClick={() => toggle(meal)}
                  disabled={isSaving}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all disabled:opacity-60 ${
                    isUnset
                      ? "border-dashed border-gray-300 bg-white"
                      : attending
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isUnset ? "bg-gray-100" : attending ? "bg-green-500" : "bg-gray-200"
                  }`}>
                    {isSaving
                      ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      : isUnset
                      ? <span className="text-gray-300 text-xs font-bold">?</span>
                      : attending
                      ? <Check className="w-5 h-5 text-white" />
                      : <X className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                  <p className="text-sm font-semibold capitalize text-gray-800">{meal}</p>
                  <p className={`text-xs mt-1 font-medium ${
                    isUnset ? "text-gray-400" : attending ? "text-green-600" : "text-gray-400"
                  }`}>
                    {isUnset ? "Tap to mark" : attending ? "Attending" : "Skipping"}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
