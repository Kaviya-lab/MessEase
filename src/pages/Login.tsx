import { useState } from "react";
import { ChefHat, GraduationCap, Shield, ArrowRight, Loader2 } from "lucide-react";

interface LoginProps {
  onStudentLogin: (name: string, rollNo: string, roomNo?: string) => Promise<void>;
  onAdminLogin: (username: string, password: string) => void;
}

export default function Login({ onStudentLogin, onAdminLogin }: LoginProps) {
  const [role, setRole] = useState<"student" | "admin">("student");

  // student fields
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [roomNo, setRoomNo] = useState("");

  // admin fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (role === "student") {
      if (!name.trim() || !rollNo.trim()) {
        setError("Please enter your name and roll number.");
        return;
      }
      setLoading(true);
      try {
        await onStudentLogin(name, rollNo, roomNo);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // admin
    if (!username.trim() || !password.trim()) {
      setError("Please enter the admin username and password.");
      return;
    }
    try {
      onAdminLogin(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4 shadow-lg shadow-brand-200">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900">MessEase</h1>
          <p className="text-gray-500 mt-2 text-sm">Smart Hostel Mess Management Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setRole("student"); setError(""); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === "student" ? "bg-white text-brand-600 shadow-sm" : "text-gray-500"
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => { setRole("admin"); setError(""); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === "admin" ? "bg-white text-brand-600 shadow-sm" : "text-gray-500"
              }`}
            >
              <Shield className="w-4 h-4" /> Mess Admin
            </button>
          </div>

          {role === "student" ? (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Your Name</label>
                <input
                  autoFocus
                  className="input mt-1.5"
                  placeholder="e.g. Divya Shree"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Roll Number</label>
                <input
                  className="input mt-1.5"
                  placeholder="e.g. 21CS045"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  First time? This creates your account. Returning? Just enter the same roll number.
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Room No. (optional)</label>
                <input
                  className="input mt-1.5"
                  placeholder="A-204"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</label>
                <input
                  autoFocus
                  className="input mt-1.5"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  className="input mt-1.5"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          {role === "student"
            ? "No password needed — your roll number is your login."
            : "There is one fixed mess admin account."}
        </p>
      </div>
    </div>
  );
}
