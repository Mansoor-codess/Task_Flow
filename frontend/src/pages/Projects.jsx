import { FolderKanban, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { user } = useAuth();
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

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Projects</h1>
          <p className="mt-1 text-ink/60">Every project you own or belong to.</p>
        </div>
      </div>
      {user?.role === "ADMIN" ? (
        <form onSubmit={createProject} className="rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="font-black">Create Project</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Button type="submit">
              <Plus size={17} />
              Create
            </Button>
          </div>
          {error ? <div className="mt-3 text-sm text-coral">{error}</div> : null}
        </form>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="rounded-lg border border-ink/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-md bg-mint p-2 text-forest">
              <FolderKanban size={22} />
            </div>
            <h2 className="text-lg font-black">{project.name}</h2>
            <p className="mt-2 min-h-12 text-sm text-ink/60">{project.description || "No description yet."}</p>
            <div className="mt-4 flex justify-between text-sm font-semibold text-ink/60">
              <span>{project.members.length} members</span>
              <span>{project._count.tasks} tasks</span>
            </div>
          </Link>
        ))}
      </section>
      {!projects.length ? <div className="rounded-lg border border-ink/10 bg-white p-6 text-ink/60">No projects found.</div> : null}
    </div>
  );
}
