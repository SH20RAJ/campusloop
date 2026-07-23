import { useState } from "react";
import { toast } from "sonner";
import {
  voteOnPost,
  voteOnPoll,
  repostPost as repostApi,
  deletePost as deleteApi,
  reportPost as reportApi,
} from "@/lib/api";

export function usePostActions(onMutationSuccess?: () => void) {
  const [isActionPending, setIsActionPending] = useState(false);

  async function handleVote(postId: string, currentVote: number, targetValue: number) {
    const nextValue = currentVote === targetValue ? 0 : targetValue;
    try {
      await voteOnPost(postId, nextValue);
      onMutationSuccess?.();
      return nextValue;
    } catch (err) {
      toast.error("Failed to update vote");
      throw err;
    }
  }

  async function handlePollVote(postId: string, optionId: string) {
    try {
      const res = await voteOnPoll(postId, optionId);
      onMutationSuccess?.();
      toast.success("Vote recorded!");
      return res;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit vote");
      throw err;
    }
  }

  async function handleRepost(postId: string, comment?: string) {
    setIsActionPending(true);
    try {
      await repostApi(postId, comment);
      toast.success("Post reposted to your campus feed!");
      onMutationSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to repost");
    } finally {
      setIsActionPending(false);
    }
  }

  async function handleDelete(postId: string) {
    setIsActionPending(true);
    try {
      await deleteApi(postId);
      toast.success("Post deleted successfully");
      onMutationSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setIsActionPending(false);
    }
  }

  async function handleReport(postId: string, reason: string, details?: string) {
    try {
      await reportApi(postId, reason, details);
      toast.success("Report submitted. Thank you for keeping CampusLoop safe.");
    } catch (err) {
      toast.error("Failed to submit report");
    }
  }

  return {
    isActionPending,
    handleVote,
    handlePollVote,
    handleRepost,
    handleDelete,
    handleReport,
  };
}
