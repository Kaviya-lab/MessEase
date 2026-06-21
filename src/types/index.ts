export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  rollNo?: string; // students only — unique login key
  roomNo?: string;
  avatar?: string;
  balance?: number;
}

export interface MenuItem {
  id: string;
  dayOfWeek: string;
  meal: "breakfast" | "lunch" | "dinner";
  name: string;
  isVeg: boolean;
  calories?: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  meal: "breakfast" | "lunch" | "dinner";
  attending: boolean;
}

export interface AttendanceSummary {
  meal: "breakfast" | "lunch" | "dinner";
  attendingCount: number;
  skippingCount: number;
  totalMarked: number;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName?: string; // joined from profiles when needed
  title: string;
  description: string;
  category: "food" | "hygiene" | "service" | "billing" | "other";
  status: "open" | "in-progress" | "resolved";
  createdAt: string;
  resolvedAt?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName?: string;
  amount: number;
  month: string;
  status: "paid" | "pending" | "overdue";
  paidOn?: string;
  dueDate: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  priority: "low" | "medium" | "high";
}

export interface Stats {
  totalStudents: number;
  todayAttendance: number;
  pendingComplaints: number;
  monthlyRevenue: number;
  foodWastage: number;
  satisfactionScore: number;
}
