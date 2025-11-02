import { z } from "zod";
import { changePasswordSchema } from "@advanced-react/shared/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogTrigger } from "@/features/shared/components/ui/Dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import { Button } from "@/features/shared/components/ui/Button";
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/features/shared/components/ui/Dialog";
import Input from "@/features/shared/components/ui/Input";
import { useState } from "react";
import { trpc } from "@/trpc";
import { useToast } from "@/features/shared/hooks/useToast";

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onError: (error) => {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();

      form.reset();

      setOpen(false);

      toast({
        title: "Password changed successfully",
        description: "You can now use your new password to login",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    changePasswordMutation.mutate(data);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Update password</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="********" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="********" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending
                  ? "Changing password..."
                  : "Change password"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
