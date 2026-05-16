import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminPanel from "./pages/AdminPanel";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import Projects from "./pages/Projects";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <AuthPage mode="login" /> },
  { path: "/signup", element: <AuthPage mode="signup" /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/projects", element: <Projects /> },
          { path: "/projects/:id", element: <ProjectDetail /> },
          {
            element: <ProtectedRoute adminOnly />,
            children: [{ path: "/admin", element: <AdminPanel /> }]
          }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
