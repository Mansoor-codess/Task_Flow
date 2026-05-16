import { Plus, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";
import TaskModal from "../components/TaskModal";
import { useAuth } from "../context/AuthContext";

const columns = [
  { key: "TODO", label: "Todo" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "DONE", label: "Done" },
  { key: "OVERDUE", label: "Overdue" }
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: "", role: "MEMBER" });
  const [error, setError] = useState("");

  const loadProject = async () => {
    const { data } = await api.get(`/projects/${id}`);
    setProject(data);
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const membership = useMemo(() => project?.members.find((member) => member.user.id === user?.id), [project, user]);
  const isAdmin = user?.role === "ADMIN" || membership?.role === "ADMIN";

  const tasksByStatus = useMemo(() => {
    const grouped = Object.fromEntries(columns.map((column) => [column.key, []]));
    for (const task of project?.tasks || []) {
      grouped[task.status]?.push(task);
    }
    return grouped;
  }, [project]);

  const addMember = async (event) => {
    event.preventDefault();
    setError("");
    if (!memberForm.email.includes("@")) {
      setError("Enter a valid member email.");
      return;
    }

    try {
      await api.post(`/projects/${id}/members`, memberForm);
      setMemberForm({ email: "", role: "MEMBER" });
      await loadProject();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add member.");
    }
  };

  const removeMember = async (userId) => {
    await api.delete(`/projects/${id}/members/${userId}`);
    await loadProject();
  };

  const saveTask = async (payload) => {
    if (payload.dueDate && new Date(payload.dueDate).getTime() < Date.now()) {
      const validationError = new Error("Due date cannot be in the past.");
      validationError.response = { data: { message: validationError.message } };
      throw validationError;
    }

    if (selectedTask?.id) {
      await api.put(`/tasks/${selectedTask.id}`, payload);
    } else {
      await api.post(`/projects/${id}/tasks`, payload);
    }
    setShowTaskModal(false);
    setSelectedTask(null);
    await loadProject();
  };

  const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    setShowTaskModal(false);
    setSelectedTask(null);
    await loadProject();
  };

  if (!project) {
    return <div className="rounded-lg border border-ink/10 bg-white p-6">Loading project...</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">{project.name}</h1>
          <p className="mt-1 max-w-3xl text-ink/60">{project.description || "No description yet."}</p>
        </div>
        {isAdmin ? (
          <Button
            onClick={() => {
              setSelectedTask(null);
              setShowTaskModal(true);
            }}
          >
            <Plus size={17} />
            New Task
          </Button>
        ) : null}
      </div>
      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="grid content-start gap-4">
          <div className="rounded-lg border border-ink/10 bg-white p-5">
            <h2 className="font-black">Members</h2>
            <div className="mt-4 grid gap-3">
              {project.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-2 rounded-md bg-[#f7faf8] px-3 py-2">
                  <div>
                    <div className="font-semibold">{member.user.name}</div>
                    <div className="text-xs text-ink/55">{member.role}</div>
                  </div>
                  {isAdmin && member.user.id !== project.ownerId ? (
                    <button className="rounded-md p-1.5 text-coral hover:bg-coral/10" onClick={() => removeMember(member.user.id)} aria-label="Remove member">
                      <X size={16} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          {isAdmin ? (
            <form onSubmit={addMember} className="rounded-lg border border-ink/10 bg-white p-5">
              <h2 className="font-black">Add Member</h2>
              <div className="mt-4 grid gap-3">
                <Input label="Email" type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} />
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-ink/80">Project role</span>
                  <select
                    className="focus-ring min-h-11 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
                <Button type="submit">
                  <UserPlus size={17} />
                  Add
                </Button>
                {error ? <div className="text-sm text-coral">{error}</div> : null}
              </div>
            </form>
          ) : null}
        </aside>
        <section className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <div key={column.key} className="min-h-[520px] rounded-lg border border-ink/10 bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black">{column.label}</h2>
                <span className="rounded-md bg-mint px-2 py-1 text-xs font-bold text-forest">{tasksByStatus[column.key].length}</span>
              </div>
              <div className="grid gap-3">
                {tasksByStatus[column.key].map((task) => (
                  <button
                    key={task.id}
                    className="rounded-md border border-ink/10 bg-[#f7faf8] p-3 text-left transition hover:border-forest/30 hover:bg-mint/35"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                  >
                    <div className="font-bold">{task.title}</div>
                    <p className="mt-1 line-clamp-2 text-sm text-ink/60">{task.description || "No description."}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-md bg-white px-2 py-1">{task.priority}</span>
                      <span className="rounded-md bg-white px-2 py-1">{task.assignee?.name || "Unassigned"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      </section>
      {showTaskModal ? (
        <TaskModal
          task={selectedTask}
          members={project.members}
          isAdmin={isAdmin}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={saveTask}
          onDelete={deleteTask}
        />
      ) : null}
    </div>
  );
}
