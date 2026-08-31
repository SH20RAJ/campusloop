/**
 * Realtime Safety & PII Sanitizer for CampusLoop Random Loop
 */

const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const INSTA_HANDLE_REGEX = /(?:^|\s)@([a-zA-Z0-9._]{3,30})/g;
const EXTERNAL_URL_REGEX = /\b(?:https?:\/\/|www\.)\S+\b/gi;

export interface SafetyCheckResult {
  allowed: boolean;
  sanitizedBody: string;
  warning?: string;
  piiDetected?: boolean;
}

export function sanitizeRandomLoopMessage(text: string): SafetyCheckResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { allowed: false, sanitizedBody: "", warning: "Message cannot be empty." };
  }

  // Check for Phone numbers
  if (PHONE_REGEX.test(trimmed)) {
    return {
      allowed: false,
      sanitizedBody: trimmed,
      piiDetected: true,
      warning: "🛡️ Phone numbers are not allowed. Please keep all conversations safe inside CampusLoop.",
    };
  }

  // Check for Email addresses
  if (EMAIL_REGEX.test(trimmed)) {
    return {
      allowed: false,
      sanitizedBody: trimmed,
      piiDetected: true,
      warning: "🛡️ Sharing email addresses is restricted in Random Loop for your safety.",
    };
  }

  // Block suspicious external URLs
  if (EXTERNAL_URL_REGEX.test(trimmed)) {
    return {
      allowed: false,
      sanitizedBody: trimmed,
      piiDetected: true,
      warning: "🛡️ External links are blocked in Random Loop to prevent phishing and spam.",
    };
  }

  // Scrub or allow
  return {
    allowed: true,
    sanitizedBody: trimmed,
  };
}

export const RANDOM_LOOP_STARTERS = [
  "What's one thing your college desperately needs right now?",
  "What's the most overrated thing about college life?",
  "Which campus food stall or canteen item deserves a Michelin star?",
  "What's your current academic or assignment crisis?",
  "If your college had a reality show, what would it be called?",
  "What's the most useful thing you've learned outside of class?",
  "What's your most controversial campus opinion?",
  "Who is actually surviving tomorrow's 8:00 AM lecture?",
  "What was your first impression when you stepped into this campus?",
  "What's a hobby you picked up recently that you didn't expect to love?",
  "What's the weirdest rumor you've ever heard about your college?",
  "If you could skip one subject forever without consequences, which one?",
];
