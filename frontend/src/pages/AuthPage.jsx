import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const { isAuthenticated, login, signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MEMBER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (isSignup && !form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }

    if (form.password.length < (isSignup ? 8 : 1)) {
      setError(isSignup ? "Password must be at least 8 characters." : "Password is required.");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signup(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f7faf8] lg:grid-cols-[1fr_1.05fr]">
      <section className="hidden bg-forest px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-2xl font-black">Team Task Manager</div>
        <div className="max-w-xl">
          <h1 className="text-5xl font-black leading-tight">Plan work, assign clearly, and keep progress visible.</h1>
          <div className="mt-8 grid gap-3 text-white/85">
            {["Role-based project control", "Task boards with priorities and due dates", "Automatic overdue tracking"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={20} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-white/65">Built with React, Express, Prisma, PostgreSQL, and JWT auth.</p>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">{isSignup ? "Create account" : "Welcome back"}</h2>
          <p className="mt-1 text-sm text-ink/60">
            {isSignup ? "Create an Admin account to manage projects, or join as a Member." : "Sign in to continue to your workspace."}
          </p>
          <div className="mt-6 grid gap-4">
            {isSignup ? <Input label="Name" value={form.name} onChange={(e) => update("name", e.target.value)} /> : null}
            <Input label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} />
            {isSignup ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink/80">Role</span>
                <select
                  className="focus-ring min-h-11 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
            ) : null}
          </div>
          {error ? <div className="mt-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">{error}</div> : null}
          <Button className="mt-6 w-full" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
          </Button>
          <p className="mt-5 text-center text-sm text-ink/65">
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <Link className="font-semibold text-forest" to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
