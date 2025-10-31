import { createFileRoute } from "@tanstack/react-router";
import Card from "@/features/shared/components/ui/Card";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <main>
      <Card>
        <LoginForm />
      </Card>
    </main>
  );
}
