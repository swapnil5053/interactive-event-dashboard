"use client";

import React from "react";
import { Smile, Meh, Frown } from "lucide-react";

interface SentimentTrackerProps {
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  comments: { text: string; sentiment: string }[];
}

export function SentimentTracker({
  positiveCount,
  neutralCount,
  negativeCount,
  comments,
}: SentimentTrackerProps) {
  const total = positiveCount + neutralCount + negativeCount || 1;
  const posPct = Math.round((positiveCount / total) * 100);
  const neuPct = Math.round((neutralCount / total) * 100);
  const negPct = Math.round((negativeCount / total) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-950 p-4 border border-zinc-900 text-center">
          <Smile className="mx-auto h-5 w-5 text-emerald-400 mb-1" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Positive</span>
          <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block">{posPct}%</span>
          <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">{positiveCount} ratings</span>
        </div>
        <div className="bg-zinc-950 p-4 border border-zinc-900 text-center">
          <Meh className="mx-auto h-5 w-5 text-blue-400 mb-1" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Neutral</span>
          <span className="text-xl font-mono font-bold text-blue-400 mt-1 block">{neuPct}%</span>
          <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">{neutralCount} ratings</span>
        </div>
        <div className="bg-zinc-950 p-4 border border-zinc-900 text-center">
          <Frown className="mx-auto h-5 w-5 text-rose-400 mb-1" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Negative</span>
          <span className="text-xl font-mono font-bold text-rose-400 mt-1 block">{negPct}%</span>
          <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">{negativeCount} ratings</span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recent Comments Sentiment Stream</h4>
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
          {comments.map((comment, index) => (
            <div
              key={index}
              className="p-3 bg-zinc-900/40 border border-zinc-900 text-xs text-zinc-300 leading-relaxed flex items-start justify-between gap-3"
            >
              <p className="flex-1 italic">"{comment.text}"</p>
              <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 px-2 py-0.5 ${
                comment.sentiment === "positive"
                  ? "bg-emerald-950 text-emerald-300"
                  : comment.sentiment === "negative"
                  ? "bg-rose-950 text-rose-300"
                  : "bg-blue-950 text-blue-300"
              }`}>
                {comment.sentiment}
              </span>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center py-6 text-zinc-500 italic text-[11px]">No feedback submitted yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
