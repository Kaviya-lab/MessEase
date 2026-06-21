import { supabase } from "@/lib/supabase";
import type { Complaint } from "@/types";

interface ComplaintRow {
  id: string;
  student_id: string;
  title: string;
  description: string;
  category: Complaint["category"];
  status: Complaint["status"];
  created_at: string;
  resolved_at: string | null;
  profiles?: { name: string } | null;
}

function mapComplaint(row: ComplaintRow): Complaint {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.profiles?.name,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
  };
}

export async function getMyComplaints(studentId: string): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ComplaintRow[]).map(mapComplaint);
}

/** Admin view — includes student name via join. */
export async function getAllComplaints(): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*, profiles(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ComplaintRow[]).map(mapComplaint);
}

export async function createComplaint(params: {
  studentId: string;
  title: string;
  description: string;
  category: Complaint["category"];
}): Promise<void> {
  const { error } = await supabase.from("complaints").insert({
    student_id: params.studentId,
    title: params.title,
    description: params.description,
    category: params.category,
  });
  if (error) throw error;
}

export async function updateComplaintStatus(
  id: string,
  status: Complaint["status"]
): Promise<void> {
  const { error } = await supabase
    .from("complaints")
    .update({
      status,
      ...(status === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);
  if (error) throw error;
}
