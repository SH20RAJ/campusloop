"use client";

import { useState } from "react";
import { FeedPost } from "@/hooks/use-feed";

interface PollCardProps {
  post: FeedPost;
}

export function PollCard({ post }: PollCardProps) {
  const [hasVoted, setHasVoted] = useState(post.hasVotedPoll || false);
  const [options, setOptions] = useState(post.pollOptions || []);
  const [totalVotes, setTotalVotes] = useState(post.totalPollVotes || 0);
  const [isLoading, setIsLoading] = useState(false);

  async function handleVote(optionId: string) {
    if (isLoading || hasVoted) return;

    // Optimistic Update
    setIsLoading(true);
    setHasVoted(true);
    setTotalVotes(totalVotes + 1);
    setOptions(prev => prev.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, votesCount: opt.votesCount + 1, userVoted: true };
      }
      return opt;
    }));

    try {
      const res = await fetch(`/api/posts/${post.id}/poll-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      if (!res.ok) {
        throw new Error("Failed to cast poll vote");
      }
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      setHasVoted(false);
      setTotalVotes(totalVotes);
      setOptions(post.pollOptions || []);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3 mt-3">
      {options.map((option) => {
        const percentage = totalVotes > 0 ? Math.round((option.votesCount / totalVotes) * 100) : 0;
        
        return (
          <div key={option.id} className="relative overflow-hidden rounded-lg border border-border">
            {hasVoted ? (
              <>
                {/* Progress bar background fill */}
                <div 
                  className={`absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500 ${option.userVoted ? "bg-primary/20" : ""}`}
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative flex justify-between items-center px-4 py-3 text-sm text-foreground">
                  <span className={`font-medium ${option.userVoted ? "text-primary" : ""}`}>
                    {option.text} {option.userVoted && "✓"}
                  </span>
                  <span className="font-semibold text-muted-foreground">{percentage}%</span>
                </div>
              </>
            ) : (
              <button
                onClick={() => handleVote(option.id)}
                disabled={isLoading}
                className="w-full text-left px-4 py-3 text-sm text-foreground font-medium hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {option.text}
              </button>
            )}
          </div>
        );
      })}
      
      {hasVoted && (
        <p className="text-xs text-muted-foreground px-1">{totalVotes} {totalVotes === 1 ? "vote" : "votes"}</p>
      )}
    </div>
  );
}
