import { Button } from "@/features/shared/components/ui/Button";
import { router } from "@/router";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { trpc } from "@/trpc";
import { useToast } from "@/features/shared/hooks/useToast";
import Card from "@/features/shared/components/ui/Card";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ChangeEmailDialog } from "@/features/auth/components/ChangeEmailDialog";
import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  loader: async ({ context: { trpcQueryUtils } }) => {
    const currentUser = await trpcQueryUtils.auth.currentUser.ensureData();

    if (!currentUser) {
      return redirect({ to: "/login" });
    }
  },
});

function SettingsPage() {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const { currentUser } = useCurrentUser();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      // Reset the current user query data immediately
      await utils.auth.currentUser.invalidate();

      // Navigate to login page
      router.navigate({ to: "/login" });

      toast({
        title: "Logged out",
        description: "You are now logged out",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to logout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const settings = [
    {
      label: currentUser?.email,
      component: <ChangeEmailDialog />,
    },
    {
      label: "Change password",
      component: <ChangePasswordDialog />,
    },
    {
      label: "Sign out of your account",
      component: (
        <Button
          variant="destructive"
          disabled={logoutMutation.isPending}
          onClick={() => {
            logoutMutation.mutate();
          }}
        >
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      ),
    },
  ];
  return (
    <main className="space-y-4">
      {settings.map((setting) => (
        <Card key={setting.label} className="flex items-center justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">
            {setting.label}
          </span>
          {setting.component}
        </Card>
      ))}
    </main>
  );
}
