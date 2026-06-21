import { useState, useEffect } from "react";
import { Leaf, Drumstick, Loader2 } from "lucide-react";
import { getWeeklyMenu } from "@/lib/api/content";
import type { MenuItem } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["breakfast", "lunch", "dinner"] as const;

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeeklyMenu().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Weekly Menu</h1>
        <p className="text-gray-500 text-sm mt-1">Current week's meal plan</p>
      </div>

      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1.5 rounded-full font-medium">
          <Leaf className="w-3.5 h-3.5" /> Vegetarian
        </span>
        <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-full font-medium">
          <Drumstick className="w-3.5 h-3.5" /> Non-Vegetarian
        </span>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center text-gray-400 text-sm">
          No menu has been added yet. Check back soon, or ask your mess admin to add one.
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.filter(day => items.some(i => i.dayOfWeek === day)).map(day => (
            <div key={day} className="card overflow-hidden">
              <div className="bg-gray-900 px-5 py-3">
                <h2 className="font-display font-semibold text-white">{day}</h2>
              </div>
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {MEALS.map(meal => {
                  const mealItems = items.filter(i => i.dayOfWeek === day && i.meal === meal);
                  return (
                    <div key={meal} className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{meal}</p>
                      {mealItems.length === 0 ? (
                        <p className="text-xs text-gray-300">—</p>
                      ) : (
                        <div className="space-y-2">
                          {mealItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                                <span className="text-sm text-gray-800">{item.name}</span>
                              </div>
                              {item.calories && <span className="text-xs text-gray-400">{item.calories} cal</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
