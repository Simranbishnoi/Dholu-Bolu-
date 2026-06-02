import { Attempt } from "./db";

export interface Checkpoint {
  id: string;
  name: string;
  type: "food" | "medal" | "rank";
  energyRequired: number;
  icon: string;
  description: string;
  haryanviQuote: string;
  isUnlocked: boolean;
  athleteReference?: string;
}

// Keep Badge alias for backward compatibility with practice page
export type Badge = Checkpoint;

export interface WrestlerLevel {
  level: number;
  title: string;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
}

export interface GamificationProfile {
  totalEnergy: number;
  levelInfo: WrestlerLevel;
  badges: Checkpoint[]; // Alias for backward compatibility
  checkpoints: Checkpoint[];
  daysCompleted: number;
}

/**
 * Computes wrestler rank level and progress from total energy.
 */
export function calculateLevel(totalEnergy: number): WrestlerLevel {
  // Simple fallback level matching the energy
  return {
    level: 1,
    title: "पहलवान (Wrestler)",
    xpInCurrentLevel: totalEnergy,
    xpNeededForNextLevel: 1000,
    progressPercentage: Math.min(100, Math.round((totalEnergy / 1000) * 100)),
  };
}

/**
 * Evaluates the user's gamification stats, leveling, and achievements.
 */
export function getGamificationProfile(attempts: Attempt[], _streak: number): GamificationProfile {
  // Calculate total Ghee-Choorma Energy
  const totalEnergy = attempts.reduce((sum, att) => {
    const base = 10;
    const accuracyBonus = Math.round(att.accuracyScore * 0.5);
    const loopBonus = att.detectedLoops * 10;
    return sum + base + accuracyBonus + loopBonus;
  }, 0);

  const levelInfo = calculateLevel(totalEnergy);

  // Compute unique days practiced
  const uniqueDates = new Set<string>();
  attempts.forEach((att) => {
    try {
      const dateStr = att.timestamp.split("T")[0];
      if (dateStr) {
        uniqueDates.add(dateStr);
      }
    } catch {
      // Ignore
    }
  });
  const daysCompleted = uniqueDates.size;

  const checkpoints: Checkpoint[] = [
    {
      id: "choorma_challenge",
      name: "30-दिन का चूरमा (Ultimate Choorma)",
      type: "food",
      energyRequired: 0,
      icon: "🍪",
      description: "Complete the 30-day challenge by practicing on 30 unique days.",
      haryanviQuote: "ले भाई! 30 दिन की पूरी तपस्या के बाद अल्टीमेट घी-चूरमा! जमा लाठ गाड़ दिया पहलवान!",
      isUnlocked: daysCompleted >= 30,
    },
  ];

  return {
    totalEnergy,
    levelInfo,
    badges: checkpoints, // Alias for backward compatibility
    checkpoints,
    daysCompleted,
  };
}
