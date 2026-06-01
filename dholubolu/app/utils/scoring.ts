/**
 * Utility for scoring tongue twister pronunciation and repetitions.
 * Uses a word-level sequence alignment algorithm (Levenshtein distance at word level)
 * with a character-level threshold for word similarity to catch minor transcription typos.
 */

export interface PracticeScoreResult {
  accuracyScore: number;
  detectedLoops: number;
  wrongWordsCount: number;
  missingWordsCount: number;
  extraWordsCount: number;
}

/**
 * Computes character-level Levenshtein edit distance between two words.
 */
export function charLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // Deletion
        dp[i][j - 1] + 1, // Insertion
        dp[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Normalizes text by removing punctuation and splitting into words.
 */
export function normalizeText(text: string, language: "english" | "hindi"): string[] {
  if (!text) return [];
  let clean = text;
  if (language === "english") {
    clean = text.toLowerCase();
  }
  // Remove punctuation (including Devanagari danda '।')
  clean = clean.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।]/g, " ");
  // Replace multiple spaces with a single space
  clean = clean.replace(/\s+/g, " ").trim();
  return clean ? clean.split(" ") : [];
}

/**
 * Determines if two words are phonetically or spelling-wise similar.
 * Allows higher tolerance for longer words.
 */
export function isWordSimilar(w1: string, w2: string, language: "english" | "hindi"): boolean {
  if (w1 === w2) return true;

  const dist = charLevenshtein(w1, w2);
  const maxLen = Math.max(w1.length, w2.length);

  if (language === "english") {
    if (maxLen <= 3) return dist === 0;
    if (maxLen <= 5) return dist <= 1;
    return dist <= 2; // Allow up to 2 character differences for longer words
  } else {
    // Hindi transcription (Devanagari)
    if (maxLen <= 2) return dist === 0;
    if (maxLen <= 4) return dist <= 1;
    return dist <= 2; // Allow up to 2 edits for longer Hindi words due to combining code units (nuktas)
  }
}

/**
 * Evaluates the user's transcription against the tongue twister reference.
 */
export function calculatePracticeScore(
  transcription: string,
  twisterText: string,
  language: "english" | "hindi",
  repeatTarget: number
): PracticeScoreResult {
  const refWords = normalizeText(twisterText, language);
  const userWords = normalizeText(transcription, language);

  const N = refWords.length;
  if (N === 0) {
    return {
      accuracyScore: 0,
      detectedLoops: 0,
      wrongWordsCount: 0,
      missingWordsCount: 0,
      extraWordsCount: 0,
    };
  }

  // If user didn't speak anything
  if (userWords.length === 0) {
    return {
      accuracyScore: 0,
      detectedLoops: 0,
      wrongWordsCount: 0,
      missingWordsCount: N * repeatTarget,
      extraWordsCount: 0,
    };
  }

  // Estimate total repetitions to align against.
  // Align against at least the target, and up to the length of user words plus some cushion.
  const estRepetitions = Math.max(repeatTarget, Math.ceil(userWords.length / N)) + 1;
  const refRepetitions: string[] = [];
  for (let k = 0; k < estRepetitions; k++) {
    refRepetitions.push(...refWords);
  }

  const U = userWords.length;
  const R = refRepetitions.length;

  // Word-level DP alignment
  const dp: number[][] = Array.from({ length: U + 1 }, () => Array(R + 1).fill(0));

  for (let i = 0; i <= U; i++) dp[i][0] = i;
  for (let j = 0; j <= R; j++) dp[0][j] = j;

  for (let i = 1; i <= U; i++) {
    for (let j = 1; j <= R; j++) {
      const cost = isWordSimilar(userWords[i - 1], refRepetitions[j - 1], language) ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // Insertion (extra word spoken)
        dp[i][j - 1] + 1, // Deletion (missing word)
        dp[i - 1][j - 1] + cost // Match or Substitution (wrong word)
      );
    }
  }

  // Backtrack to find alignment path using fitting alignment logic
  let j_best = 0;
  let min_distance = dp[U][0];
  for (let jCol = 1; jCol <= R; jCol++) {
    if (dp[U][jCol] <= min_distance) {
      min_distance = dp[U][jCol];
      j_best = jCol;
    }
  }

  let i = U;
  let j = j_best;
  interface AlignmentNode {
    type: "match" | "wrong" | "missing" | "extra";
    userWord?: string;
    refWord?: string;
    refIndex?: number;
  }
  const alignment: AlignmentNode[] = [];

  // Add trailing missing words for the remaining reference repetitions
  for (let k = j_best; k < R; k++) {
    alignment.push({
      type: "missing",
      refWord: refRepetitions[k],
      refIndex: k,
    });
  }

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const cost = isWordSimilar(userWords[i - 1], refRepetitions[j - 1], language) ? 0 : 1;
      const scoreSub = dp[i - 1][j - 1] + cost;
      const scoreDel = dp[i][j - 1] + 1;

      if (dp[i][j] === scoreDel) {
        alignment.push({
          type: "missing",
          refWord: refRepetitions[j - 1],
          refIndex: j - 1,
        });
        j--;
      } else if (dp[i][j] === scoreSub) {
        alignment.push({
          type: cost === 0 ? "match" : "wrong",
          userWord: userWords[i - 1],
          refWord: refRepetitions[j - 1],
          refIndex: j - 1,
        });
        i--;
        j--;
      } else {
        alignment.push({
          type: "extra",
          userWord: userWords[i - 1],
        });
        i--;
      }
    } else if (j > 0) {
      alignment.push({
        type: "missing",
        refWord: refRepetitions[j - 1],
        refIndex: j - 1,
      });
      j--;
    } else {
      alignment.push({
        type: "extra",
        userWord: userWords[i - 1],
      });
      i--;
    }
  }

  alignment.reverse();

  // Group stats by loop repetitions
  interface RepetitionStats {
    matches: number;
    wrongs: number;
    missing: number;
    extra: number;
  }
  const repStats: RepetitionStats[] = Array.from({ length: estRepetitions }, () => ({
    matches: 0,
    wrongs: 0,
    missing: 0,
    extra: 0,
  }));

  // Track which repetition we are in for attributing extra words
  let currentRepIndex = 0;

  for (const node of alignment) {
    if (node.refIndex !== undefined) {
      const repIdx = Math.floor(node.refIndex / N);
      if (repIdx < estRepetitions) {
        currentRepIndex = repIdx;
        if (node.type === "match") {
          repStats[repIdx].matches++;
        } else if (node.type === "wrong") {
          repStats[repIdx].wrongs++;
        } else if (node.type === "missing") {
          repStats[repIdx].missing++;
        }
      }
    } else {
      // Extra word: associate with currentRepIndex
      if (currentRepIndex < estRepetitions) {
        repStats[currentRepIndex].extra++;
      }
    }
  }

  // Count detected loops based on attempt & accuracy thresholds:
  // - Attempted at least 70% of the words: (matches + wrongs) >= N * 0.7
  // - Correctly pronounced at least 50% of the words: matches >= N * 0.5
  let detectedLoops = 0;
  let maxAttemptedRep = -1;

  for (let k = 0; k < estRepetitions; k++) {
    const stats = repStats[k];
    const attemptedWords = stats.matches + stats.wrongs;

    if (attemptedWords > 0 || stats.extra > 0) {
      maxAttemptedRep = k;
    }

    if (attemptedWords >= N * 0.7 && stats.matches >= N * 0.5) {
      detectedLoops++;
    }
  }

  // Calculate pronunciation accuracy over the attempted range (from loop 0 to maxAttemptedRep)
  if (maxAttemptedRep === -1) {
    return {
      accuracyScore: 0,
      detectedLoops: 0,
      wrongWordsCount: 0,
      missingWordsCount: N * repeatTarget,
      extraWordsCount: 0,
    };
  }

  let totalMatches = 0;
  let totalWrongs = 0;
  let totalMissing = 0;
  let totalExtra = 0;

  for (let k = 0; k <= maxAttemptedRep; k++) {
    totalMatches += repStats[k].matches;
    totalWrongs += repStats[k].wrongs;
    totalMissing += repStats[k].missing;
    totalExtra += repStats[k].extra;
  }

  const denominator = totalMatches + totalWrongs + totalMissing + totalExtra;
  const accuracyScore = denominator > 0 ? Math.round((totalMatches / denominator) * 100) : 0;

  return {
    accuracyScore,
    detectedLoops,
    wrongWordsCount: totalWrongs,
    missingWordsCount: totalMissing,
    extraWordsCount: totalExtra,
  };
}
