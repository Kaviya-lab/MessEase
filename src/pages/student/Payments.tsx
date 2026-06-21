import { useState, useEffect, useCallback } from "react";
import { CreditCard, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { getMyPayments, markPaymentPaid } from "@/lib/api/payments";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Payment, User } from "@/types";

interface Props { user: User }

const statusIcon = { paid: CheckCircle, pending: Clock, overdue: AlertCircle };
const statusStyle: Record<Payment["status"], string> = {
  paid: "text-green-600 bg-green-50",
  pending: "text-amber-600 bg-amber-50",
  overdue: "text-red-600 bg-red-50",
};

export default function Payments({ user }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getMyPayments(user.id);
    setPayments(data);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  const overdue = payments.find(p => p.status === "overdue");
  const pending = payments.filter(p => p.status !== "paid");

  // Dummy payment — no real gateway involved. Simulates a short
  // processing delay, then marks the payment as paid in the database.
  const handlePay = async (id: string) => {
    setPayingId(id);
    await new Promise(resolve => setTimeout(resolve, 900));
    await markPaymentPaid(id);
    await load();
    setPayingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 text-sm mt-1">Mess fee payment history</p>
      </div>

      {overdue && (
        <div className="card p-5 border-l-4 border-red-400 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-red-700">Payment Overdue — {overdue.month}</p>
              <p className="text-sm text-red-500 mt-0.5">Due date: {formatDate(overdue.dueDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-display font-bold text-red-700">{formatCurrency(overdue.amount)}</p>
              <button
                onClick={() => handlePay(overdue.id)}
                disabled={payingId === overdue.id}
                className="btn-primary bg-red-500 hover:bg-red-600 text-xs py-1.5 px-3 mt-2 disabled:opacity-60"
              >
                {payingId === overdue.id ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-500" />
          Payment History
        </h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-brand-400 animate-spin" /></div>
        ) : payments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No payment records yet</p>
        ) : (
          <div className="space-y-3">
            {payments.map(p => {
              const Icon = statusIcon[p.status];
              const isPending = p.status !== "paid";
              const isPaying = payingId === p.id;
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", statusStyle[p.status])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{p.month}</p>
                      <p className="text-xs text-gray-400">
                        {p.paidOn ? `Paid on ${formatDate(p.paidOn)}` : `Due ${formatDate(p.dueDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(p.amount)}</p>
                      <span className={cn("badge capitalize text-xs", statusStyle[p.status])}>{p.status}</span>
                    </div>
                    {isPending && (
                      <button
                        onClick={() => handlePay(p.id)}
                        disabled={isPaying}
                        className="btn-primary text-xs py-1.5 px-3 disabled:opacity-60 whitespace-nowrap"
                      >
                        {isPaying ? "Processing..." : "Pay Now"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pending.length === 0 && payments.length > 0 && !loading && (
        <p className="text-center text-sm text-green-600 font-medium">
          ✓ All payments are up to date
        </p>
      )}
    </div>
  );
}
