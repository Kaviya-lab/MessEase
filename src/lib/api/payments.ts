import { supabase } from "@/lib/supabase";
import type { Payment } from "@/types";

interface PaymentRow {
  id: string;
  student_id: string;
  amount: number;
  month: string;
  status: Payment["status"];
  due_date: string;
  paid_on: string | null;
  profiles?: { name: string } | null;
}

function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.profiles?.name,
    amount: row.amount,
    month: row.month,
    status: row.status,
    dueDate: row.due_date,
    paidOn: row.paid_on ?? undefined,
  };
}

export async function getMyPayments(studentId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("student_id", studentId)
    .order("due_date", { ascending: false });

  if (error) throw error;
  return (data as PaymentRow[]).map(mapPayment);
}

export async function getAllPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*, profiles(name)")
    .order("due_date", { ascending: false });

  if (error) throw error;
  return (data as PaymentRow[]).map(mapPayment);
}

export async function markPaymentPaid(id: string): Promise<void> {
  const { error } = await supabase
    .from("payments")
    .update({ status: "paid", paid_on: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Admin creates a fee due for one student (e.g. monthly mess bill). */
export async function createPayment(params: {
  studentId: string;
  amount: number;
  month: string;
  dueDate: string; // YYYY-MM-DD
}): Promise<void> {
  const { error } = await supabase.from("payments").insert({
    student_id: params.studentId,
    amount: params.amount,
    month: params.month,
    due_date: params.dueDate,
    status: "pending",
  });
  if (error) throw error;
}

/** Admin bills every student at once (e.g. "charge June mess fee to everyone"). */
export async function createPaymentForAllStudents(params: {
  studentIds: string[];
  amount: number;
  month: string;
  dueDate: string;
}): Promise<void> {
  const rows = params.studentIds.map(studentId => ({
    student_id: studentId,
    amount: params.amount,
    month: params.month,
    due_date: params.dueDate,
    status: "pending" as const,
  }));
  const { error } = await supabase.from("payments").insert(rows);
  if (error) throw error;
}
