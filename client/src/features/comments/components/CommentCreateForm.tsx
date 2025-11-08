import { Experience } from "@advanced-react/server/database/schema";
import { z } from "zod";
import { commentValidationSchema } from "@advanced-react/shared/schema/comment";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl } from "@/features/shared/components/ui/Form";
import { TextArea } from "@/features/shared/components/ui/TextArea";
import {
  Form,
  FormField,
  FormItem,
} from "@/features/shared/components/ui/Form";
import { trpc } from "@/router";
import { Button } from "@/features/shared/components/ui/Button";
import { useToast } from "@/features/shared/hooks/useToast";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

type CommentCreateFormSchema = z.infer<typeof commentValidationSchema>;

type CommentCreateFormProps = {
  experienceId: Experience["id"];
};

export function CommentCreateForm({ experienceId }: CommentCreateFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { currentUser } = useCurrentUser();

  const form = useForm<CommentCreateFormSchema>({
    resolver: zodResolver(commentValidationSchema),
    defaultValues: {
      content: "",
    },
  });

  const { handleSubmit, reset } = form;

  const { mutateAsync: addComment } = trpc.comments.add.useMutation();

  const onSubmit = form.handleSubmit(async (data) => {
    await addComment(
      {
        experienceId,
        content: data.content,
      },
      {
        onSuccess: async () => {
          reset();
          await utils.comments.byExperienceId.invalidate({ experienceId });
        },
        onError: (error) => {
          toast({
            title: "Failed to add comment",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  });

  if (!currentUser) {
    return (
      <div className="text-center text-neutral-500">
        Please log in to add comments
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextArea {...field} placeholder="Add a comment..." />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={false}>
          Add Comment
        </Button>
      </form>
    </Form>
  );
}
