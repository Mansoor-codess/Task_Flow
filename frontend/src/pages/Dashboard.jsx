import { AlertCircle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";

const statusLabels = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  OVERDUE: "Overdue"
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then(({ data }) => setDashboard(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-lg border border-ink/10 bg-white p-6">Loading dashboard...</div>;
  }

  const cards = [
    { label: "Total Tasks", value: dashboard.totalTasks, icon: ListTodo, color: "text-forest" },
    { label: "In Progress", value: dashboard.tasksByStatus.IN_PROGRESS, icon: Clock3, color: "text-gold" },
    { label: "Done", value: dashboard.tasksByStatus.DONE, icon: CheckCircle2, color: "text-forest" },
    { label: "Overdue", value: dashboard.tasksByStatus.OVERDUE, icon: AlertCircle, color: "text-coral" }
  ];

  const maxValue = Math.max(1, ...Object.values(dashboard.tasksByStatus));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="mt-1 text-ink/60">A quick read on active workload, completion, and risk.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-ink/10 bg-white p-5">
            <div className={`mb-4 inline-flex rounded-md bg-mint p-2 ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div className="text-3xl font-black">{card.value}</div>
            <div className="text-sm font-semibold text-ink/60">{card.label}</div>
          </div>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="font-black">Tasks by Status</h2>
          <div className="mt-5 grid gap-4">
            {Object.entries(dashboard.tasksByStatus).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1 flex justify-between text-sm font-semibold">
                  <span>{statusLabels[status]}</span>
                  <span>{count}</span>
                </div>
                <div className="h-3 rounded-full bg-mint">
                  <div className="h-3 rounded-full bg-forest" style={{ width: `${(count / maxValue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="font-black">Recent Activity</h2>
          <div className="mt-4 divide-y divide-ink/10">
            {dashboard.recentActivity.length ? (
              dashboard.recentActivity.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <div className="font-semibold">{task.title}</div>
                    <div className="text-sm text-ink/55">{task.project.name}</div>
                  </div>
                  <span className="rounded-md bg-mint px-2 py-1 text-xs font-bold text-forest">{statusLabels[task.status]}</span>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-ink/55">No activity yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
