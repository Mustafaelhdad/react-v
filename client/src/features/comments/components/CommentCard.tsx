import Card from "@/features/shared/components/ui/Card";
import { CommentForList } from "../types";
import { useState } from "react";
import CommentEditForm from "./CommentEditForm";
import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/features/shared/components/ui/Dialog";
import { trpc } from "@/router";
import { useToast } from "@/features/shared/hooks/useToast";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import Link from "@/features/shared/components/ui/Link";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

type CommentCardProps = {
  comment: CommentForList;
};

export default function CommentCard({ comment }: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <CommentEditForm comment={comment} setIsEditing={setIsEditing} />;
  }

  return (
    <Card className="space-y-4">
      <CommentCardHeader comment={comment} />
      <CommentCardContent comment={comment} />
      <CommentCardButtons comment={comment} setIsEditing={setIsEditing} />
    </Card>
  );
}

type CommentCardHeaderProps = Pick<CommentCardProps, "comment">;

function CommentCardHeader({ comment }: CommentCardHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Link to="/users/$userId" params={{ userId: comment.userId }}>
        <UserAvatar user={comment.user} />
      </Link>
      <time className="text-sm text-neutral-500">
        {new Date(comment.createdAt).toLocaleDateString()}
      </time>
    </div>
  );
}

type CommentCardContentProps = Pick<CommentCardProps, "comment">;

function CommentCardContent({ comment }: CommentCardContentProps) {
  return <div>{comment.content}</div>;
}

type CommentCardButtonsProps = Pick<CommentCardProps, "comment"> & {
  setIsEditing: (isEditing: boolean) => void;
};

function CommentCardButtons({
  comment,
  setIsEditing,
}: CommentCardButtonsProps) {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const { currentUser } = useCurrentUser();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = trpc.comments.delete.useMutation({
    onSuccess: async () => {
      await utils.comments.byExperienceId.invalidate({
        experienceId: comment.experienceId,
      });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isCommentOwner = currentUser?.id === comment.userId;
  const isExperienceOwner = currentUser?.id === comment.experience.userId;

  if (!isCommentOwner && !isExperienceOwner) {
    return null;
  }

  return (
    <div className="flex gap-4">
      {isCommentOwner && (
        <Button variant="link" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      )}

      {(isCommentOwner || isExperienceOwner) && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive-link">Delete</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Comment</DialogTitle>
            </DialogHeader>
            <p className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMutation.mutate({ id: comment.id });
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
