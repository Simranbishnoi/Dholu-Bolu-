/**
 * Client-side local storage utility to manage practice attempts and scores.
 * Safeguards calls against SSR issues in Next.js environment.
 */

export interface Attempt {
  id: string;
  twisterId: number;
  language: "english" | "hindi";
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  twisterText: string;
  transcription: string;
  accuracyScore: number;
  detectedLoops: number;
  repeatTarget: number;
  wrongWordsCount: number;
  missingWordsCount: number;
  extraWordsCount: number;
  timestamp: string;
}

const STORAGE_KEY = "dholubolu_attempts";

/**
 * Retrieves all saved attempts from localStorage.
 */
export function getAttempts(): Attempt[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to read attempts from localStorage:", error);
    return [];
  }
}

/**
 * Appends a new attempt to localStorage.
 */
export function saveAttempt(attemptData: Omit<Attempt, "id" | "timestamp">): Attempt {
  const attempt: Attempt = {
    ...attemptData,
    id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const attempts = getAttempts();
      attempts.push(attempt);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error("Failed to save attempt to localStorage:", error);
    }
  }

  return attempt;
}

/**
 * Clears all attempts from localStorage.
 */
export function clearAttempts(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear attempts in localStorage:", error);
    }
  }
}
