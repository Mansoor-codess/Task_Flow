import { FolderPlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";

export default function AdminPanel() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const loadProjects = async () => {
    const { data } = await api.get("/projects");
    setProjects(data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      await api.post("/projects", form);
      setForm({ name: "", description: "" });
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create project.");
    }
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    await loadProjects();
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Admin Panel</h1>
        <p className="mt-1 text-ink/60">Create and remove projects. Member and task management lives inside each project.</p>
      </div>
      <form onSubmit={createProject} className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="font-black">New Project</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit">
            <FolderPlus size={17} />
            Create
          </Button>
        </div>
        {error ? <div className="mt-3 text-sm text-coral">{error}</div> : null}
      </form>
      <section className="rounded-lg border border-ink/10 bg-white">
        <div className="border-b border-ink/10 p-5">
          <h2 className="font-black">Projects</h2>
        </div>
        <div className="divide-y divide-ink/10">
          {projects.map((project) => (
            <div key={project.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <div className="font-bold">{project.name}</div>
                <div className="text-sm text-ink/55">
                  {project.members.length} members · {project._count.tasks} tasks
                </div>
              </div>
              <Button variant="danger" onClick={() => deleteProject(project.id)}>
                <Trash2 size={17} />
                Delete
              </Button>
            </div>
          ))}
          {!projects.length ? <div className="p-5 text-sm text-ink/55">No projects yet.</div> : null}
        </div>
      </section>
    </div>
  );
}
