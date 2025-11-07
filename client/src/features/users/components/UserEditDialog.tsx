import { userEditSchema } from "@advanced-react/shared/schema/auth";
import { z } from "zod";
import { User } from "@advanced-react/server/database/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogFooter,
} from "@/features/shared/components/ui/Dialog";
import { useState } from "react";
import {
  Form,
  FormItem,
  FormControl,
  FormField,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import { TextArea } from "@/features/shared/components/ui/TextArea";
import { Button } from "@/features/shared/components/ui/Button";
import Input from "@/features/shared/components/ui/Input";
import { trpc } from "@/trpc";
import { useToast } from "@/features/shared/hooks/useToast";

type UserFormData = z.infer<typeof userEditSchema>;

type UserEditDialogProps = {
  user: User;
};

export function UserEditDialog({ user }: UserEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      id: user.id,
      name: user.name,
      bio: user.bio ?? "",
    },
  });

  const editMutation = trpc.users.edit.useMutation({
    onError: (error) => {
      toast({
        title: "Failed to edit user",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: async ({ id }) => {
      await Promise.all([
        utils.users.byId.invalidate({ id }),
        utils.auth.currentUser.invalidate(),
      ]);

      form.reset();

      setIsOpen(false);

      toast({
        title: "User edited successfully",
        description: "Your profile has been updated",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob);
      }
    }
    editMutation.mutate(formData);
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Edit profile</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Edit your name..." />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TextArea {...field} placeholder="Edit your bio..." />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
