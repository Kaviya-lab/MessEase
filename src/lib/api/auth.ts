import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

interface ProfileRow {
  id: string;
  name: string;
  roll_no: string;
  room_no: string | null;
  balance: number | null;
}

function mapProfile(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    role: "student",
    rollNo: row.roll_no,
    roomNo: row.room_no ?? undefined,
    balance: row.balance ?? 0,
  };
}

/**
 * Student "login": roll number is the unique key, but the name typed
 * must match the name on file once a roll number is registered.
 * - First time a roll number is used: creates the student with that name.
 * - After that: the same roll number must be paired with the same name
 *   (case/whitespace-insensitive) — otherwise login is rejected, so a
 *   different person can't just type someone else's roll number with
 *   their own name and get in as them.
 */
export async function loginOrRegisterStudent(params: {
  name: string;
  rollNo: string;
  roomNo?: string;
}): Promise<User> {
  const rollNo = params.rollNo.trim();
  const name = params.name.trim();
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("*")
    .eq("roll_no", rollNo)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing) {
    const row = existing as ProfileRow;
    if (normalize(row.name) !== normalize(name)) {
      throw new Error(
        `Roll number ${rollNo} is already registered under a different name. ` +
        `Please enter the name exactly as you used the first time, or check your roll number.`
      );
    }
    return mapProfile(row);
  }

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ name, roll_no: rollNo, room_no: params.roomNo || null })
    .select()
    .single();

  if (insertError) {
    // Unique constraint race: someone else just created this roll no
    // between our lookup and insert. Re-check with the same name rule.
    if (insertError.code === "23505") {
      const { data: retry, error: retryError } = await supabase
        .from("profiles")
        .select("*")
        .eq("roll_no", rollNo)
        .single();
      if (retryError) throw retryError;
      const retryRow = retry as ProfileRow;
      if (normalize(retryRow.name) !== normalize(name)) {
        throw new Error(
          `Roll number ${rollNo} is already registered under a different name.`
        );
      }
      return mapProfile(retryRow);
    }
    throw insertError;
  }

  return mapProfile(created as ProfileRow);
}

export async function getAllStudents(): Promise<User[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data as ProfileRow[]).map(mapProfile);
}

export async function getStudentById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : null;
}
