import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { CATEGORIES, type Category, type Expense } from "../types";

interface Props {
  initial?: Expense | null;
  onSave: (expense: Expense) => void;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm({ initial, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "Food");
  const [date, setDate] = useState(initial?.date ?? today());
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!title.trim()) return setError("Please enter a title.");
    if (!Number.isFinite(value) || value <= 0) return setError("Amount must be greater than zero.");
    if (!date) return setError("Please choose a date.");
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      title: title.trim(),
      amount: Math.round(value * 100) / 100,
      category,
      date,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal card" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial ? "Edit expense" : "Add expense"}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lunch" autoFocus />
        </label>
        <label>
          Amount (₹)
          <input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </label>
        <div className="row">
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <label>
          Note (optional)
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">{initial ? "Save changes" : "Add expense"}</button>
        </div>
      </form>
    </div>
  );
}
