import { supabase } from "@/lib/supabase";
import type { Announcement, MenuItem } from "@/types";

interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  priority: Announcement["priority"];
  created_at: string;
}

function mapAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    priority: row.priority,
    createdAt: row.created_at,
  };
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as AnnouncementRow[]).map(mapAnnouncement);
}

export async function createAnnouncement(params: {
  title: string;
  body: string;
  priority: Announcement["priority"];
}): Promise<void> {
  const { error } = await supabase.from("announcements").insert(params);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

// ------------------------- Menu -------------------------

interface MenuItemRow {
  id: string;
  day_of_week: string;
  meal: MenuItem["meal"];
  name: string;
  is_veg: boolean;
  calories: number | null;
}

function mapMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    meal: row.meal,
    name: row.name,
    isVeg: row.is_veg,
    calories: row.calories ?? undefined,
  };
}

export async function getWeeklyMenu(): Promise<MenuItem[]> {
  const { data, error } = await supabase.from("menu_items").select("*");
  if (error) throw error;
  return (data as MenuItemRow[]).map(mapMenuItem);
}

export async function addMenuItem(params: {
  dayOfWeek: string;
  meal: MenuItem["meal"];
  name: string;
  isVeg: boolean;
  calories?: number;
}): Promise<void> {
  const { error } = await supabase.from("menu_items").insert({
    day_of_week: params.dayOfWeek,
    meal: params.meal,
    name: params.name,
    is_veg: params.isVeg,
    calories: params.calories,
  });
  if (error) throw error;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw error;
}
