import { englishTwisters, hindiTwisters, Twister } from "../data/twisters";

export interface DailyChallengeInfo {
  twister: Twister;
  language: "english" | "hindi";
}

export function getDailyChallenge(): DailyChallengeInfo {
  const combined = [
    ...englishTwisters.map(t => ({ ...t, lang: "english" as const })),
    ...hindiTwisters.map(t => ({ ...t, lang: "hindi" as const }))
  ];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const date = now.getDate(); // 1-31

  // Create a deterministic seed: YYYYMMDD
  const seed = year * 10000 + (month + 1) * 100 + date;
  
  // Use seed to select a twister from the pool
  const index = seed % combined.length;
  const selected = combined[index];

  return {
    twister: {
      id: selected.id,
      difficulty: selected.difficulty,
      text: selected.text
    },
    language: selected.lang
  };
}
