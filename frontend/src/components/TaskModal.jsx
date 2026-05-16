import { Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "./Button";
import Input from "./Input";

const blankTask = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  assigneeId: "",
  dueDate: ""
};

export default function TaskModal({ task, members, isAdmin, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(blankTask);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "TODO",
        priority: task.priority || "MEDIUM",
        assigneeId: task.assigneeId || "",
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ""
      });
    } else {
      setForm(blankTask);
    }
  }, [task]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (isAdmin && !form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    const payload = isAdmin
      ? {
          ...form,
          assigneeId: form.assigneeId || null,
          dueDate: form.dueDate ? new Date(`${form.dueDate}T23:59:00`).toISOString() : null
        }
      : { status: form.status };

    try {
      await onSave(payload);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save task.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="text-lg font-black">{task?.id ? "Task Details" : "New Task"}</h2>
          <button type="button" className="rounded-md p-2 hover:bg-mint" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="grid gap-4 p-5">
          {isAdmin ? (
            <>
              <Input label="Title" value={form.title} onChange={(e) => update("title", e.target.value)} />
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink/80">Description</span>
                <textarea
                  className="focus-ring min-h-28 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </label>
            </>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink/80">Status</span>
              <select
                className="focus-ring min-h-11 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </label>
            {isAdmin ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink/80">Priority</span>
                <select
                  className="focus-ring min-h-11 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"
                  value={form.priority}
                  onChange={(e) => update("priority", e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </label>
            ) : null}
          </div>
          {isAdmin ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink/80">Assignee</span>
                <select
                  className="focus-ring min-h-11 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"
                  value={form.assigneeId}
                  onChange={(e) => update("assigneeId", e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </label>
              <Input label="Due date" type="date" value={form.dueDate} onChange={(e) => update("dueDate", e.target.value)} />
            </div>
          ) : null}
          {error ? <div className="rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">{error}</div> : null}
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-ink/10 px-5 py-4">
          {isAdmin && task?.id ? (
            <Button type="button" variant="danger" onClick={() => onDelete(task.id)}>
              <Trash2 size={17} />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save size={17} />
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
