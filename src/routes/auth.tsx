import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => <Navigate to="/login" replace />,
});
