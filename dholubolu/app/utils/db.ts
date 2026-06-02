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

export interface DashboardStats {
  totalAttempts: number;
  averageAccuracy: number;
  totalLoops: number;
  uniqueSolved: number;
  englishAttempts: number;
  hindiAttempts: number;
}

/**
 * Computes the consecutive active daily practice streak.
 * Timezone-safe and handles month/year transitions correctly.
 */
export function getDailyStreak(): number {
  const attempts = getAttempts();
  if (attempts.length === 0) {
    return 0;
  }

  // Extract unique local dates (YYYY-MM-DD)
  const uniqueDates = new Set<string>();
  attempts.forEach((att) => {
    try {
      const dateStr = att.timestamp.split("T")[0]; // YYYY-MM-DD
      if (dateStr) {
        uniqueDates.add(dateStr);
      }
    } catch {
      // Ignore
    }
  });

  const dateList = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a));
  if (dateList.length === 0) {
    return 0;
  }

  // Helper to format Date object into local YYYY-MM-DD
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatLocalDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  const mostRecentDate = dateList[0];

  // If the most recent attempt wasn't today or yesterday, streak is broken
  if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  const checkDate = new Date(mostRecentDate);

  while (true) {
    const checkStr = formatLocalDate(checkDate);
    if (uniqueDates.has(checkStr)) {
      streak++;
      // Go back one day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Computes statistics from saved practice attempts.
 */
export function getDashboardStats(): DashboardStats {
  const attempts = getAttempts();
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageAccuracy: 0,
      totalLoops: 0,
      uniqueSolved: 0,
      englishAttempts: 0,
      hindiAttempts: 0,
    };
  }

  let totalAccuracy = 0;
  let totalLoops = 0;
  let englishAttempts = 0;
  let hindiAttempts = 0;
  const solvedTwisters = new Set<string>(); // format: "lang_id"

  attempts.forEach((att) => {
    totalAccuracy += att.accuracyScore;
    totalLoops = Math.max(totalLoops, att.detectedLoops);
    if (att.language === "english") {
      englishAttempts++;
    } else {
      hindiAttempts++;
    }
    // A twister is solved if accuracy is at least 80%
    if (att.accuracyScore >= 80) {
      solvedTwisters.add(`${att.language}_${att.twisterId}`);
    }
  });

  return {
    totalAttempts: attempts.length,
    averageAccuracy: Math.round(totalAccuracy / attempts.length),
    totalLoops,
    uniqueSolved: solvedTwisters.size,
    englishAttempts,
    hindiAttempts,
  };
}
