import { readFile, writeFile } from "node:fs/promises";

const FILE = "./scores.json"

interface ScoreEntry {
  userId: string;
  score: number;
  timestamp: string;
}

interface PuzzleData {
  scores: ScoreEntry[];
}

interface LeaderboardEntry {
  userId: string;
  score: number;
  timestamp: string;
}

function getDateKey(
  timestamp: string,
  timeZone: string
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));

  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export async function getDailyLeaderboard(gameName: string) {
  const data = JSON.parse(
    await readFile(FILE, "utf8")
  );

  const gameKey = Object.keys(data).find(
    key => key.toLowerCase() === gameName.toLowerCase()
  );

  if (!gameKey) {
    return null;
  }

  const today = getDateKey(new Date().toISOString(), "America/Chicago");

  const bestScores = new Map<string, LeaderBoardEntry>();
  const puzzles = data[gameKey] ?? {};


  for (const puzzle of Object.values(puzzles) as PuzzleData[]) {
    for (const entry of puzzle ?? []) {
      if (getDateKey(entry.timestamp, "America/Chicago") !== today) {
        continue;
      }
      const existing = bestScores.get(entry.userId);

      if (
        !existing || 
        entry.score > existing.score ||
        (
          entry.score === existing.score &&
          new Date(entry.timestamp).getTime() < new Date(existing.timestamp).getTime()
        )
      ) {
        bestScores.set(entry.userId, {
          userId: entry.userId,
          score: entry.score,
          timestamp: entry.timestamp,
        });
      }
    }
  }

  return [...bestScores.values()].sort(
    (a, b) =>
      b.score - a.score ||
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export async function recordKrillionScore(
  puzzle: number,
  userId: string,
  score: number,
) {
  let data: Record<string, any> = {};

  try {
    data = JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    // File doesn't exist yet or something?
    console.log("could not parse score file");
  }

  data ??= {};
  data.Krillion ??= {};
  data.Krillion[puzzle] ??= [];

  const previousScores = data.Krillion[puzzle];
  const previousHigh = Math.max(0, ...previousScores.map((x: any) => x.score));

  previousScores.push({
    userId,
    score,
    timestamp: new Date().toISOString()
  });

  await writeFile(FILE, JSON.stringify(data, null, 2));

  return {
    isRecord: score > previousHigh,
    previousHigh,
    score,
    puzzle,
    userId
  };
}

export async function recordRabbitHoleScore(
  date: string,
  userId: string,
  score: number,
) {
  let data: Record<string, any> = {};

  try {
    data = JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    // File doesn't exist yet or something?
    console.log("could not parse score file");
  }

  data ??= {};
  data.Rabbithole ??= {};
  data.Rabbithole[date] ??= [];

  const previousScores = data.Rabbithole[date];
  const previousHigh = Math.max(0, ...previousScores.map((x: any) => x.score));

  previousScores.push({
    userId,
    score,
    timestamp: new Date().toISOString()
  });

  await writeFile(FILE, JSON.stringify(data, null, 2));

  return {
    isRecord: score > previousHigh,
    previousHigh,
    score,
    date,
    userId
  };
}

export async function recordEncloseHorseScore(
  day: number,
  userId: string,
  score: number,
) {
  let data: Record<string, any> = {};

  try {
    data = JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    // File doesn't exist yet or something?
    console.log("could not parse score file");
  }

  data ??= {}
  data.EncloseHorse ??= {};
  data.EncloseHorse[day] ??= [];

  const previousScores = data.EncloseHorse[day];
  const previousHigh = Math.max(0, ...previousScores.map((x: any) => x.score));

  previousScores.push({
    userId,
    score,
    timestamp: new Date().toISOString()
  });

  await writeFile(FILE, JSON.stringify(data, null, 2));

  return {
    isRecord: score > previousHigh,
    previousHigh,
    score,
    day,
    userId
  };
}

export async function recordBracketCityScore(
  date: string,
  userId: string,
  score: number,
) {
  let data: Record<string, any> = {};

  try {
    data = JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    console.log("could not parse score file");
  }

  data ??= {};
  data.BracketCity ??= {};
  data.BracketCity[date] ??= [];

  const previousScores = data.BracketCity[date];
  const previousHigh = Math.max(0, ...previousScores.map((x: any) => x.score));

  previousScores.push({
    userId,
    score,
    timestamp: new Date().toISOString()
  });

  await writeFile(FILE, JSON.stringify(data, null, 2));

  return {
    isRecord: score > previousHigh,
    previousHigh,
    score,
    date,
    userId
  };
}

export async function recordStackdleScore(
  puzzle: number,
  userId: string,
  score: number,
) {
  let data: Record<string, any> = {};

  try {
    data = JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    // File doesn't exist yet or something?
    console.log("could not parse score file");
  }

  data ??= {};
  data.Stackdle ??= {};
  data.Stackdle[puzzle] ??= [];

  const previousScores = data.Stackdle[puzzle];
  const previousHigh = Math.max(0, ...previousScores.map((x: any) => x.score));

  previousScores.push({
    userId,
    score,
    timestamp: new Date().toISOString()
  });

  await writeFile(FILE, JSON.stringify(data, null, 2));

  return {
    isRecord: score > previousHigh,
    previousHigh,
    score,
    puzzle,
    userId
  };
}

export async function recordFivefoldScore(
  puzzle: number,
  userId: string,
  time: number,
) {
  let data: Record<string, any> = {};

  try {
    data = JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    // File doesn't exist yet or something?
    console.log("could not parse score file");
  }

  data ??= {};
  data.Fivefold ??= {};
  data.Fivefold[puzzle] ??= [];

  const score = 600 - time;
  const previousScores = data.Fivefold[puzzle];
  const previousHigh = Math.max(0, ...previousScores.map((x: any) => x.score));

  previousScores.push({
    userId,
    score,
    timestamp: new Date().toISOString()
  });

  await writeFile(FILE, JSON.stringify(data, null, 2));

  return {
    isRecord: score > previousHigh,
    previousHigh,
    score,
    puzzle,
    userId
  };
}

export async function recordTiledWordsScore(
  puzzleDate: string,
  userId: string,
  time: number,
) {
  let data: Record<string, any> = {};

  try {
    data = JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    // File doesn't exist yet or something?
    console.log("could not parse score file");
  }

  data ??= {};
  data.TiledWords ??= {};
  data.TiledWords[puzzleDate] ??= [];

  const score = 10000 - time;
  const previousScores = data.TiledWords[puzzleDate];
  const previousHigh = Math.max(0, ...previousScores.map((x: any) => x.score));

  previousScores.push({
    userId,
    score,
    timestamp: new Date().toISOString()
  });

  await writeFile(FILE, JSON.stringify(data, null, 2));

  return {
    isRecord: score > previousHigh,
    previousHigh,
    score,
    puzzleDate,
    userId
  };
}

export async function recordFlipsiesScore(
  puzzle: number,
  userId: string,
  score: number,
) {
  let data: Record<string, any> = {};

  try {
    data = JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    // File doesn't exist yet or something?
    console.log("could not parse score file");
  }

  data ??= {};
  data.Flipsies ??= {};
  data.Flipsies[puzzle] ??= [];

  const previousScores = data.Flipsies[puzzle];
  const previousHigh = Math.max(0, ...previousScores.map((x: any) => x.score));

  previousScores.push({
    userId,
    score,
    timestamp: new Date().toISOString()
  });

  await writeFile(FILE, JSON.stringify(data, null, 2));

  return {
    isRecord: score > previousHigh,
    previousHigh,
    score,
    puzzle,
    userId
  };
}
