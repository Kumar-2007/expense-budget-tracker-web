import { Eye, Pencil, Trash2 } from "lucide-react";
import { CATEGORY_COLORS, formatINR, type Expense } from "../types";

interface Props {
  expenses: Expense[];
  onView: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  emptyText?: string;
}

export default function TransactionList({ expenses, onView, onEdit, onDelete, emptyText }: Props) {
  if (expenses.length === 0) {
    return <p className="empty">{emptyText ?? "No expenses yet. Add your first expense to get started."}</p>;
  }
  return (
    <ul className="tx-list">
      {expenses.map((e) => (
        <li key={e.id} className="tx">
          <span className="dot" style={{ background: CATEGORY_COLORS[e.category] }} />
          <div className="tx-main">
            <strong>{e.title}</strong>
            <small>
              {e.category} · {new Date(e.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </small>
          </div>
          <span className="tx-amount">{formatINR(e.amount)}</span>
          <div className="tx-actions">
            <button className="icon-btn" onClick={() => onView(e)} aria-label="View"><Eye size={16} /></button>
            <button className="icon-btn" onClick={() => onEdit(e)} aria-label="Edit"><Pencil size={16} /></button>
            <button className="icon-btn danger" onClick={() => onDelete(e)} aria-label="Delete"><Trash2 size={16} /></button>
          </div>
        </li>
      ))}
    </ul>
  );
}
