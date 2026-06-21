import { supabase } from "@/lib/supabase";
import type { Attendance, AttendanceSummary } from "@/types";

interface AttendanceRow {
  id: string;
  student_id: string;
  date: string;
  meal: "breakfast" | "lunch" | "dinner";
  attending: boolean;
}

function mapAttendance(row: AttendanceRow): Attendance {
  return {
    id: row.id,
    studentId: row.student_id,
    date: row.date,
    meal: row.meal,
    attending: row.attending,
  };
}

const todayISO = () => new Date().toISOString().split("T")[0];

/** Get one student's attendance for today (breakfast/lunch/dinner rows). */
export async function getMyTodayAttendance(studentId: string): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("student_id", studentId)
    .eq("date", todayISO());

  if (error) throw error;
  return (data as AttendanceRow[]).map(mapAttendance);
}

/**
 * Mark / update attendance for one meal. Uses upsert so a student can
 * toggle their choice any number of times before the mess cutoff.
 */
export async function setAttendance(
  studentId: string,
  meal: "breakfast" | "lunch" | "dinner",
  attending: boolean,
  date: string = todayISO()
): Promise<void> {
  const { error } = await supabase
    .from("attendance")
    .upsert(
      { student_id: studentId, date, meal, attending },
      { onConflict: "student_id,date,meal" }
    );
  if (error) throw error;
}

/**
 * THE ANSWER TO "how will the mess manager know how many students are
 * coming?" — live counts per meal for today, computed server-side from
 * the todays_attendance_summary view (defined in supabase/schema.sql).
 */
export async function getTodaysAttendanceSummary(): Promise<AttendanceSummary[]> {
  const { data, error } = await supabase
    .from("todays_attendance_summary")
    .select("*");

  if (error) throw error;
  return (data as { meal: "breakfast" | "lunch" | "dinner"; attending_count: number; skipping_count: number; total_marked: number }[])
    .map(r => ({
      meal: r.meal,
      attendingCount: r.attending_count,
      skippingCount: r.skipping_count,
      totalMarked: r.total_marked,
    }));
}

/** Subscribe to live attendance changes (admin dashboard auto-updates). */
export function subscribeToAttendance(onChange: () => void) {
  const channel = supabase
    .channel("attendance-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "attendance" },
      onChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
