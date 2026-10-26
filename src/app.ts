import "dotenv/config";
import { App } from "@slack/bolt";
import cron from "node-cron";
import { recordKrillionScore, recordRabbitHoleScore, recordEncloseHorseScore, recordBracketCityScore, recordStackdleScore, recordFivefoldScore, recordTiledWordsScore, recordFlipsiesScore, getDailyLeaderboard } from "./scores.ts";


const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const TARGET_CHANNEL = process.env.SLACK_CHANNEL_ID;

const gameList = ["BracketCity", "Krillion", "EncloseHorse", "Rabbithole", "Stackdle", "Fivefold", "TiledWords", "Flipsies"]
const leaderboardMessages: Record<string, string> = {};

// LEADERBOARD LISTENER
// app.message(/^\s*!leaderboard\s+(\S+)\s*$/i, async ({message, client, context }) => {
//   if (!("text" in message) || !message.channel) {
//     return;
//   }

//   // extract game name from message
//   const gameName = context.matches[1];

//   const leaderboard = await getDailyLeaderboard(gameName);

//   // unknown game
//   if (leaderboard === null) {
//     await client.chat.postMessage({
//       channel: message.channel,
//       text:
//       `I don't recognize the game "${gameName}".\n` +
//       `Try: krillion, rabbithole, enclosehorse, stackdle...`
//     });

//     return;
//   }

//   // No scores today
//   if (leaderboard.length === 0) {
//     await client.chat.postMessage({
//       channel: message.channel,
//       text: `No ${gameName} scores recorded today yet!`
//     });

//     return;
//   }

//   const rankingsPromises = leaderboard.map(async (entry, index) => {
//     const medal = ["🥇", "🥈", "🥉"][index] ?? `${index + 1}.`;

//     // get entry name
//     const user = await client.users.info({ user: entry.userId });
//     const name = user.user?.profile?.display_name || user.user?.real_name || entry.userId;
//     return `${medal} ${name} - ${entry.score}`;
//   });

//   const rankings = await Promise.all(rankingsPromises);

//   await client.chat.postMessage({
//     channel: message.channel,
//     text: `🏆 *${gameName} Leaderboard — Today*\n\n` +
//           rankings.join("\n")
//   });
// });

// KRILLION LISTENER
app.message(/Krillion/i, async ({ message, client }) => {
  // Ignore bot messages and messages without text/user data
  if (
    !("text" in message) ||
    !("user" in message) ||
    !("channel" in message) ||
    !message.user ||
    message.channel !== TARGET_CHANNEL
  ) {
    return;
  }

  const text = message.text;

  const match = text.match(/Krillion\s+#(\d+)[^\r\n]*\r?\n\s*(\d+)\s*(?:\r?\n|$)/i);

  if (!match) {
    console.log("Krillion message found, but no score parsed:", text);
    return;
  }

  const puzzleNumber = Number(match[1]);
  const score = Number(match[2]);
  const userId = message.user;

  const result = await recordKrillionScore(puzzleNumber, userId, score);

  // if (result.isRecord) {
  //   await client.chat.postMessage({
  //     channel: message.channel,
  //     text:
  //     `🏆 New Krillion #${puzzleNumber} high score!\n` +
  //     `<@${message.user}> scored ${score}!`,
  //   });
  // }

  const ltext = await createLeaderboard("Krillion");

  await app.client.chat.update({
    channel: message.channel,
    ts: leaderboardMessages["Krillion"],
    text: ltext
  });
});

// RABBITHOLE LISTENER
app.message(/Rabbithole/i, async ({ message, client }) => {
  // Ignore bot messages and messages without text/user data
  if (
    !("text" in message) ||
    !("user" in message) ||
    !("channel" in message) ||
    !message.user ||
    message.channel !== TARGET_CHANNEL
  ) {
    return;
  }

  const text = message.text;

  const match = text.match(/I got (\d+) of (\d+) points on Rabbithole.*?([A-Z][a-z]+ \d{1,2}, \d{4})/i);

  if (!match) {
    console.log("Rabbithole message found, but no score parsed:", text);
    return;
  }

  const score = Number(match[1]);
  const date = match[3];
  const userId = message.user;

  const result = await recordRabbitHoleScore(date, userId, score);

  // if (result.isRecord) {
  //   await client.chat.postMessage({
  //     channel: message.channel,
  //     text:
  //     `🏆 New Rabbithole high score for #${date}!\n` +
  //     `<@${message.user}> scored ${score}!`,
  //   });
  // }

  const ltext = await createLeaderboard("Rabbithole");

  await app.client.chat.update({
    channel: message.channel,
    ts: leaderboardMessages["Rabbithole"],
    text: ltext
  });
});

// ENCLOSE HORSE LISTENER
app.message(/enclose.horse/i, async ({ message, client }) => {
  // Ignore bot messages and messages without text/user data
  if (
    !("text" in message) ||
    !("user" in message) ||
    !("channel" in message) ||
    !message.user ||
    message.channel !== TARGET_CHANNEL
  ) {
    return;
  }

  const text = message.text;

  const match = text.match(/<https:\/\/enclose\.horse\|[^>]+>\s+Day\s+(\d+)[\s\S]*?(\d+)%/i);

  if (!match) {
    console.log("Enclose Horse message found, but no score parsed:", text);
    return;
  }

  const day = Number(match[1]);
  const score = Number(match[2]);
  const userId = message.user;

  const result = await recordEncloseHorseScore(day, userId, score);

  // if (result.isRecord) {
  //   await client.chat.postMessage({
  //     channel: message.channel,
  //     text:
  //     `🏆 New Enclose Horse Day ${day} high score!\n` +
  //     `<@${message.user}> scored ${score}%!`,
  //   });
  // }

  const ltext = await createLeaderboard("EncloseHorse");

  await app.client.chat.update({
    channel: message.channel,
    ts: leaderboardMessages["EncloseHorse"],
    text: ltext
  });
});

// BRACKET CITY LISTENER
app.message(/\[Bracket City\]/i, async ({message, client, context }) => {
  // Ignore bot messages and messages without text/user data
  if (
    !("text" in message) ||
    !("user" in message) ||
    !("channel" in message) ||
    !message.user ||
    message.channel !== TARGET_CHANNEL
  ) {
    return;
  }

  const text = message.text;

  const match = text.match(/\[Bracket City\]\s*(\w+\s+\d{1,2},\s+\d{4})[\s\S]*?Total Score:\s*([\d.]+)/i);

  if (!match) {
    console.log("Bracket City message found, but no score parsed:", text);
    return;
  }

  const date = match[1];
  const score = Number(match[2]);
  const userId = message.user;

  const result = await recordBracketCityScore(date, userId, score);

  // if (result.isRecord) {
  //   await client.chat.postMessage({
  //     channel: message.channel,
  //     text:
  //     `🏆 New Bracket City high score for #${date}!\n` +
  //     `<@${message.user}> scored ${score}!`,
  //   });
  // }

  const ltext = await createLeaderboard("BracketCity");

  await app.client.chat.update({
    channel: message.channel,
    ts: leaderboardMessages["BracketCity"],
    text: ltext
  });
});

// STACKDLE LISTENER
app.message(/Stackdle/i, async ({ message, client }) => {
  // Ignore bot messages and messages without text/user data
  if (
    !("text" in message) ||
    !("user" in message) ||
    !("channel" in message) ||
    !message.user ||
    message.channel !== TARGET_CHANNEL
  ) {
    return;
  }

  const text = message.text;

  const match = text.match(/Stackdle\s+#(\d+)\s*[\r\n]+\s*(\d+)\s*cm\b/i);

  if (!match) {
    console.log("Stackdle message found, but no score parsed:", text);
    return;
  }

  const puzzleNumber = Number(match[1]);
  const score = Number(match[2]);
  const userId = message.user;

  const result = await recordStackdleScore(puzzleNumber, userId, score);

  // if (result.isRecord) {
  //   await client.chat.postMessage({
  //     channel: message.channel,
  //     text:
  //     `🏆 New Stackdle #${puzzleNumber} high score!\n` +
  //     `<@${message.user}> scored ${score} cm!`,
  //   });
  // }

  const ltext = await createLeaderboard("Stackdle");

  await app.client.chat.update({
    channel: message.channel,
    ts: leaderboardMessages["Stackdle"],
    text: ltext
  });
});

// FIVEFOLD LISTENER
app.message(/Fivefold/i, async ({ message, client }) => {
  // Ignore bot messages and messages without text/user data
  if (
    !("text" in message) ||
    !("user" in message) ||
    !("channel" in message) ||
    !message.user ||
    message.channel !== TARGET_CHANNEL
  ) {
    return;
  }

  const text = message.text;

  const match = text.match(/Fivefold\s+#(\d+)\s*\([^)]*\)[\s\S]*?(\d+):(\d{2})(?!\d)/i);

  if (!match) {
    console.log("Fivefold message found, but no score parsed:", text);
    return;
  }

  const puzzleNumber = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const timeInSeconds = minutes * 60 + seconds
  const userId = message.user;

  const result = await recordFivefoldScore(puzzleNumber, userId, timeInSeconds);

  // if (result.isRecord) {
  //   await client.chat.postMessage({
  //     channel: message.channel,
  //     text:
  //     `🏆 New Fivefold #${puzzleNumber} quickest time!\n` +
  //     `<@${message.user}> finished in ${minutes} minutes and ${seconds} seconds!`,
  //   });
  // }

  const ltext = await createLeaderboard("Fivefold");

  await app.client.chat.update({
    channel: message.channel,
    ts: leaderboardMessages["Fivefold"],
    text: ltext
  });
});

// TILEDWORDS LISTENER
app.message(/#TiledWords/i, async ({ message, client }) => {
  // Ignore bot messages and messages without text/user data
  if (
    !("text" in message) ||
    !("user" in message) ||
    !("channel" in message) ||
    !message.user ||
    message.channel !== TARGET_CHANNEL
  ) {
    return;
  }

  const text = message.text;

  const match = text.match(/I solved today's #TiledWords puzzle![\s\S]*?(\d+)\s+minutes?,\s+(\d+)\s+seconds?[\s\S]*?(\d+)\/(\d+)\s+reveals used[\s\S]*?tiledwords\.com\/puzzles\/(\d{4}-\d{2}-\d{2})/i);

  if (!match) {
    console.log("Fivefold message found, but no score parsed:", text);
    return;
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const revealsUsed = Number(match[3])
  const puzzleDate = match[5];
  const timeInSeconds = (minutes * 60 + seconds) + (1000 * revealsUsed)
  const userId = message.user;

  const result = await recordTiledWordsScore(puzzleDate, userId, timeInSeconds);

  const ltext = await createLeaderboard("TiledWords");

  await app.client.chat.update({
    channel: message.channel,
    ts: leaderboardMessages["TiledWords"],
    text: ltext
  });
});

// FLIPSIES LISTENER
app.message(/flipsies/i, async ({ message, client }) => {
  // Ignore bot messages and messages without text/user data
  if (
    !("text" in message) ||
    !("user" in message) ||
    !("channel" in message) ||
    !message.user ||
    message.channel !== TARGET_CHANNEL
  ) {
    return;
  }

  const text = message.text;

  const match = text.match(/flipsies\s+no\.\s*(\d+)\s*·\s*(\d+)\s*pts/i);

  if (!match) {
    console.log("Fivefold message found, but no score parsed:", text);
    return;
  }

  const puzzleNumber = Number(match[1]);
  const score = Number(match[2]);
  const userId = message.user;

  const result = await recordFlipsiesScore(puzzleNumber, userId, score);

  const ltext = await createLeaderboard("Flipsies");

  await app.client.chat.update({
    channel: message.channel,
    ts: leaderboardMessages["Flipsies"],
    text: ltext
  });
});

// leaderboard helper function
const createLeaderboard = async (gameName: string) => {
  const leaderboard = await getDailyLeaderboard(gameName);

  const rankingsPromises = leaderboard.map(async (entry, index) => {
    const medal = ["🥇", "🥈", "🥉"][index] ?? `${index + 1}.`;

    // get entry name
    const user = await app.client.users.info({ user: entry.userId });
    const name = user.user?.profile?.display_name || user.user?.real_name || entry.userId;
    return `${medal} ${name} - ${entry.score}`;
  });

  const rankings = await Promise.all(rankingsPromises);

  const text = `🏆 *${gameName} Leaderboard* 🏆\n\n` +
          rankings.join("\n")

  return text;
}

// this method schedules a leaderboard log
// cron.schedule(
//   "0 7 * * *",
//   async () => {
//     console.log("Creating daily leaderboards...");

//     gameList.forEach(async (gameName: string) => {
//       const ltext = await createLeaderboard(gameName);
//       const messageId = await app.client.chat.postMessage({
//         channel: TARGET_CHANNEL,
//         text: ltext
//       });

//       leaderboardMessages[gameName] = messageId.ts;
//     });
//   },
//   { timezone: "America/Chicago" }
// );

(async () => {
  await app.start();
  console.log("Wordle Librarian is running!");

  // This method logs leaderboards when you start up
  console.log("Creating daily leaderboards...");

  gameList.forEach(async (gameName: string) => {
    const ltext = await createLeaderboard(gameName);
    const messageId = await app.client.chat.postMessage({
      channel: TARGET_CHANNEL,
      text: ltext
    });

    leaderboardMessages[gameName] = messageId.ts;
  });
})();
