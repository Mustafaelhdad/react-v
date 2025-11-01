import { z } from "zod";
import { changeEmailSchema } from "@advanced-react/shared/schema/auth";
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

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export function ChangeEmailDialog() {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const changeEmailMutation = trpc.auth.changeEmail.useMutation({
    onError: (error) => {
      toast({
        title: "Failed to change email",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();

      form.reset();

      setOpen(false);

      toast({
        title: "Email changed successfully",
        description: "You can now use your new email to login",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    changeEmailMutation.mutate(data);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Update email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="dev@example.come"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
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
                disabled={changeEmailMutation.isPending}
              >
                {changeEmailMutation.isPending
                  ? "Changing email..."
                  : "Change email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
