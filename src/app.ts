import "dotenv/config";
import { App } from "@slack/bolt";
import { recordKrillionScore, recordRabbitHoleScore, recordEncloseHorseScore, recordBracketCityScore, getDailyLeaderboard } from "./scores.ts";


const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const TARGET_CHANNEL = process.env.SLACK_CHANNEL_ID;

// LEADERBOARD LISTENER
app.message(/^\s*!leaderboard\s+(\S+)\s*$/i, async ({message, client, context }) => {
  if (!("text" in message) || !message.channel) {
    return;
  }

  // extract game name from message
  const gameName = context.matches[1];

  const leaderboard = await getDailyLeaderboard(gameName);

  // unknown game
  if (leaderboard === null) {
    await client.chat.postMessage({
      channel: message.channel,
      text:
      `I don't recognize the game "${gameName}".\n` +
      `Try: krillion, rabbithole, enclosehorse`
    });

    return;
  }

  // No scores today
  if (leaderboard.length === 0) {
    await client.chat.postMessage({
      channel: message.channel,
      text: `No ${gameName} scores recorded today yet!`
    });

    return;
  }

  const rankingsPromises = leaderboard.map(async (entry, index) => {
    const medal = ["🥇", "🥈", "🥉"][index] ?? `${index + 1}.`;

    // get entry name
    const user = await client.users.info({ user: entry.userId });
    const name = user.user?.profile?.display_name || user.user?.real_name || entry.userId;
    return `${medal} ${name} - ${entry.score}`;
  });

  const rankings = await Promise.all(rankingsPromises);

  await client.chat.postMessage({
    channel: message.channel,
    text: `🏆 *${gameName} Leaderboard — Today*\n\n` +
          rankings.join("\n")
  });
});

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

  if (result.isRecord) {
    await client.chat.postMessage({
      channel: message.channel,
      text:
      `🏆 New Krillion #${puzzleNumber} high score!\n` +
      `<@${message.user}> scored ${score}!`,
    });
  }
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

  if (result.isRecord) {
    await client.chat.postMessage({
      channel: message.channel,
      text:
      `🏆 New Rabbithole high score for #${date}!\n` +
      `<@${message.user}> scored ${score}!`,
    });
  }
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

  if (result.isRecord) {
    await client.chat.postMessage({
      channel: message.channel,
      text:
      `🏆 New Enclose Horse Day ${day} high score!\n` +
      `<@${message.user}> scored ${score}%!`,
    });
  }
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

  if (result.isRecord) {
    await client.chat.postMessage({
      channel: message.channel,
      text:
      `🏆 New Bracket City high score for #${date}!\n` +
      `<@${message.user}> scored ${score}!`,
    });
  }
});

(async () => {
  await app.start();
  console.log("Wordle Librarian is running!");
})();