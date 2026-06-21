import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ChefHat, Loader2, X } from "lucide-react";
import { getWeeklyMenu, addMenuItem, deleteMenuItem } from "@/lib/api/content";
import type { MenuItem } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["breakfast", "lunch", "dinner"] as const;

export default function ManageMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [addingTo, setAddingTo] = useState<typeof MEALS[number] | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemVeg, setNewItemVeg] = useState(true);

  const load = useCallback(async () => {
    const data = await getWeeklyMenu();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const dayItems = items.filter(i => i.dayOfWeek === selectedDay);

  const handleAdd = async (meal: typeof MEALS[number]) => {
    if (!newItemName.trim()) return;
    await addMenuItem({ dayOfWeek: selectedDay, meal, name: newItemName.trim(), isVeg: newItemVeg });
    setNewItemName("");
    setAddingTo(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteMenuItem(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Manage Menu</h1>
        <p className="text-gray-500 text-sm mt-1">Edit the weekly meal plan — changes are visible to students immediately</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 flex-wrap">
        {DAYS.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedDay === d ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {MEALS.map(meal => {
              const mealItems = dayItems.filter(i => i.meal === meal);
              return (
                <div key={meal} className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold capitalize text-gray-900">{meal}</h3>
                    <button onClick={() => setAddingTo(addingTo === meal ? null : meal)} className="text-brand-500 hover:text-brand-700">
                      {addingTo === meal ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>

                  {addingTo === meal && (
                    <div className="mb-3 p-3 rounded-xl bg-brand-50 space-y-2">
                      <input
                        autoFocus
                        className="input text-sm py-2"
                        placeholder="Item name..."
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAdd(meal)}
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-gray-600">
                          <input type="checkbox" checked={newItemVeg} onChange={e => setNewItemVeg(e.target.checked)} />
                          Vegetarian
                        </label>
                        <button onClick={() => handleAdd(meal)} className="btn-primary text-xs py-1.5 px-3">Add</button>
                      </div>
                    </div>
                  )}

                  {mealItems.length === 0 ? (
                    <p className="text-xs text-gray-300">No items yet</p>
                  ) : (
                    <div className="space-y-2">
                      {mealItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-sm text-gray-800">{item.name}</span>
                          </div>
                          <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Preview */}
          <div className="card p-5 bg-gray-900">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ChefHat className="w-3.5 h-3.5" /> Student Preview — {selectedDay}
            </p>
            {MEALS.map(meal => {
              const mealItems = dayItems.filter(i => i.meal === meal);
              if (mealItems.length === 0) return null;
              return (
                <div key={meal} className="mb-3">
                  <p className="text-xs text-gray-400 capitalize mb-1.5">{meal}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mealItems.map(item => (
                      <span key={item.id} className={`text-xs px-2 py-1 rounded-lg font-medium ${item.isVeg ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
