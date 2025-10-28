import { commentValidationSchema } from "@advanced-react/shared/schema/comment";
import { z } from "zod";
import { Comment } from "@advanced-react/server/database/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/router";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import { TextArea } from "@/features/shared/components/ui/TextArea";
import { Button } from "@/features/shared/components/ui/Button";
import { useToast } from "@/features/shared/hooks/useToast";

type CommentEditFormData = z.infer<typeof commentValidationSchema>;

type CommentEditFormProps = {
  comment: Comment;
  setIsEditing: (isEditing: boolean) => void;
};

export default function CommentEditForm({
  comment,
  setIsEditing,
}: CommentEditFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const form = useForm<CommentEditFormData>({
    resolver: zodResolver(commentValidationSchema),
    defaultValues: {
      content: comment.content,
    },
  });

  const editMutation = trpc.comments.edit.useMutation({
    onError: (error) => {
      toast({
        title: "Failed to edit comment",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: async ({ experienceId }) => {
      await utils.comments.byExperienceId.invalidate({
        experienceId,
      });

      setIsEditing(false);

      toast({
        title: "Comment edited successfully",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    editMutation.mutate({
      id: comment.id,
      content: data.content,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextArea {...field} placeholder="Edit your comment..." />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={editMutation.isPending}>
            {editMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            variant="link"
            onClick={() => setIsEditing(false)}
            disabled={editMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
