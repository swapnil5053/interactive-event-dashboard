import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { enforcePermission } from "../permissions/auth.permissions";
import { UserRole } from "@/lib/auth";

export async function submitFeedbackAction(
  userId: string,
  userRole: UserRole,
  sessionId: string,
  rating: number,
  comment: string
) {
  await enforcePermission(userRole, "feedback:write");

  // Local rule-based Sentiment Analysis
  const posKeywords = ["great", "excellent", "love", "awesome", "perfect", "good", "mindblown", "incredible", "stellar", "clean", "beautiful"];
  const negKeywords = ["poor", "bad", "boring", "hard", "difficult", "worst", "hate", "slow", "terrible", "confusing"];
  
  let sentiment = "neutral";
  const text = comment.toLowerCase();
  
  if (posKeywords.some((w) => text.includes(w))) {
    sentiment = "positive";
  } else if (negKeywords.some((w) => text.includes(w))) {
    sentiment = "negative";
  }

  await db.insert(schema.feedback).values({
    id: `fb_${Math.random().toString(36).substring(2, 11)}`,
    userId,
    sessionId,
    rating,
    comment,
    sentiment,
    createdAt: Date.now(),
  });

  return { success: true, sentiment };
}
