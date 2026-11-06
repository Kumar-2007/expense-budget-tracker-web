import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Info,
  LayoutDashboard,
  ListOrdered,
  Moon,
  PiggyBank,
  Plus,
  Receipt,
  Settings,
  ShieldCheck,
  Sun,
  Wallet,
  X,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ExpenseForm from "./components/ExpenseForm";
import TransactionList from "./components/TransactionList";
import { CATEGORIES, CATEGORY_COLORS, formatINR, type Expense, type Theme, type View } from "./types";

const KEYS = { expenses: "ebt.expenses", budget: "ebt.budget", theme: "ebt.theme" };
const DEFAULT_BUDGET = 1000;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const monthKey = (date: string) => date.slice(0, 7);
const currentMonth = () => new Date().toISOString().slice(0, 7);
const monthLabel = (key: string) =>
  new Date(key + "-01T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => load(KEYS.expenses, []));
  const [budget, setBudget] = useState<number>(() => load(KEYS.budget, DEFAULT_BUDGET));
  const [theme, setTheme] = useState<Theme>(() =>
    load<Theme>(KEYS.theme, window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  );
  const [view, setView] = useState<View>("dashboard");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [viewing, setViewing] = useState<Expense | null>(null);
  const [budgetDraft, setBudgetDraft] = useState(String(budget));

  useEffect(() => localStorage.setItem(KEYS.expenses, JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem(KEYS.budget, JSON.stringify(budget)), [budget]);
  useEffect(() => {
    localStorage.setItem(KEYS.theme, JSON.stringify(theme));
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const sorted = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [expenses],
  );
  const thisMonth = currentMonth();
  const monthExpenses = sorted.filter((e) => monthKey(e.date) === thisMonth);
  const monthSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const remaining = budget - monthSpent;
  const usage = budget > 0 ? (monthSpent / budget) * 100 : 0;

  const categoryData = CATEGORIES.map((c) => ({
    name: c,
    value: monthExpenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  }));

  const monthlySummary = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const e of expenses) {
      const k = monthKey(e.date);
      const cur = map.get(k) ?? { total: 0, count: 0 };
      map.set(k, { total: cur.total + e.amount, count: cur.count + 1 });
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  }, [expenses]);

  const alert =
    usage >= 100
      ? { level: "danger", text: `You've exceeded your monthly budget by ${formatINR(monthSpent - budget)}.` }
      : usage >= 90
        ? { level: "warn", text: `You've used ${usage.toFixed(0)}% of your budget. Only ${formatINR(remaining)} left.` }
        : usage >= 70
          ? { level: "info", text: `Heads up: ${usage.toFixed(0)}% of this month's budget is spent.` }
          : null;

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (e: Expense) => {
    setViewing(null);
    setEditing(e);
    setFormOpen(true);
  };
  const save = (exp: Expense) => {
    setExpenses((list) => (list.some((e) => e.id === exp.id) ? list.map((e) => (e.id === exp.id ? exp : e)) : [...list, exp]));
    setFormOpen(false);
    setEditing(null);
  };
  const remove = (exp: Expense) => {
    if (confirm(`Delete "${exp.title}"?`)) {
      setExpenses((list) => list.filter((e) => e.id !== exp.id));
      setViewing(null);
    }
  };
  const saveBudget = () => {
    const v = Number(budgetDraft);
    if (Number.isFinite(v) && v > 0) setBudget(Math.round(v * 100) / 100);
    else setBudgetDraft(String(budget));
  };

  const nav: { id: View; label: string; icon: typeof Wallet }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: Receipt },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const listProps = { onView: setViewing, onEdit: openEdit, onDelete: remove };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <Wallet size={22} /> <span>Budget Tracker</span>
        </div>
        <nav>
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-btn ${view === id ? "active" : ""}`} onClick={() => setView(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <button className="nav-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />} {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </aside>

      <main className="content">
        <header className="topbar">
          <h1>{nav.find((n) => n.id === view)?.label}</h1>
          <div className="topbar-actions">
            <button className="icon-btn mobile-only" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="btn primary" onClick={openAdd}>
              <Plus size={18} /> <span>Add expense</span>
            </button>
          </div>
        </header>

        {view === "dashboard" && (
          <>
            {alert && (
              <div className={`alert ${alert.level}`}>
                <AlertTriangle size={18} /> {alert.text}
              </div>
            )}
            <section className="stats">
              <Stat icon={<Receipt size={20} />} label="Spent this month" value={formatINR(monthSpent)} />
              <Stat icon={<Wallet size={20} />} label="Monthly budget" value={formatINR(budget)} />
              <Stat
                icon={<PiggyBank size={20} />}
                label="Remaining"
                value={formatINR(remaining)}
                tone={remaining < 0 ? "negative" : undefined}
              />
              <Stat icon={<ListOrdered size={20} />} label="Transactions" value={String(expenses.length)} />
            </section>

            <section className="card">
              <div className="progress-head">
                <span>Budget used</span>
                <strong>{usage.toFixed(0)}%</strong>
              </div>
              <div className="progress">
                <div
                  className={`progress-bar ${usage >= 100 ? "danger" : usage >= 90 ? "warn" : usage >= 70 ? "info" : ""}`}
                  style={{ width: `${Math.min(usage, 100)}%` }}
                />
              </div>
            </section>

            <div className="grid-2">
              <section className="card">
                <h2>Spending by category</h2>
                <p className="muted">{monthLabel(thisMonth)}</p>
                {monthSpent === 0 ? (
                  <p className="empty">No spending recorded this month.</p>
                ) : (
                  <div className="chart">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
                        <Tooltip
                          formatter={(v) => formatINR(Number(v))}
                          cursor={{ fill: "var(--hover)" }}
                          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
                        />
                        <Bar dataKey="value" name="Spent" radius={[6, 6, 0, 0]}>
                          {categoryData.map((d) => (
                            <Cell key={d.name} fill={CATEGORY_COLORS[d.name]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section className="card">
                <h2>Monthly summary</h2>
                {monthlySummary.length === 0 ? (
                  <p className="empty">Your monthly totals appear here.</p>
                ) : (
                  <ul className="summary">
                    {monthlySummary.map(([k, s]) => (
                      <li key={k}>
                        <span>
                          {monthLabel(k)}
                          <small>{s.count} transaction{s.count === 1 ? "" : "s"}</small>
                        </span>
                        <strong>{formatINR(s.total)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <section className="card">
              <h2>Recent transactions</h2>
              <TransactionList expenses={sorted.slice(0, 5)} {...listProps} />
            </section>
          </>
        )}

        {view === "transactions" && (
          <section className="card">
            <TransactionList expenses={sorted} {...listProps} />
          </section>
        )}

        {view === "settings" && (
          <>
            <section className="card">
              <h2>Monthly budget</h2>
              <div className="budget-row">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={budgetDraft}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveBudget()}
                />
                <button className="btn primary" onClick={saveBudget}>Save</button>
              </div>
              <p className="muted">Alerts appear at 70%, 90% and 100% of this amount.</p>
            </section>

            <section className="card">
              <h2>Appearance</h2>
              <div className="segmented">
                <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}><Sun size={16} /> Light</button>
                <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}><Moon size={16} /> Dark</button>
              </div>
            </section>

            <section className="card">
              <h2>FamPay connection</h2>
              <div className="alert info">
                <Info size={18} /> No official, authorized FamPay integration is available yet. Please add your expenses manually.
              </div>
              <p className="muted">
                <ShieldCheck size={14} className="inline-icon" /> This app will never ask for your FamPay password, OTP, PIN or card details.
                Never share them with any website.
              </p>
            </section>

            <section className="card">
              <h2>Data</h2>
              <p className="muted">All data is stored only in this browser using localStorage.</p>
              <button
                className="btn danger"
                onClick={() => confirm("Delete all expenses? This cannot be undone.") && setExpenses([])}
                disabled={expenses.length === 0}
              >
                Clear all expenses
              </button>
            </section>
          </>
        )}
      </main>

      <nav className="bottom-nav">
        {nav.map(({ id, label, icon: Icon }) => (
          <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {formOpen && <ExpenseForm initial={editing} onSave={save} onClose={() => setFormOpen(false)} />}

      {viewing && (
        <div className="modal-backdrop" onClick={() => setViewing(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{viewing.title}</h2>
              <button className="icon-btn" onClick={() => setViewing(null)} aria-label="Close"><X size={18} /></button>
            </div>
            <dl className="details">
              <dt>Amount</dt><dd>{formatINR(viewing.amount)}</dd>
              <dt>Category</dt><dd>{viewing.category}</dd>
              <dt>Date</dt><dd>{new Date(viewing.date + "T00:00:00").toLocaleDateString("en-IN", { dateStyle: "long" })}</dd>
              {viewing.note && (<><dt>Note</dt><dd>{viewing.note}</dd></>)}
            </dl>
            <div className="modal-actions">
              <button className="btn danger" onClick={() => remove(viewing)}>Delete</button>
              <button className="btn primary" onClick={() => openEdit(viewing)}>Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone?: "negative" }) {
  return (
    <div className="card stat">
      <span className="stat-icon">{icon}</span>
      <div>
        <small>{label}</small>
        <strong className={tone}>{value}</strong>
      </div>
    </div>
  );
}
