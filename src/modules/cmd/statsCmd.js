import { Messages } from "../../../lib/messages.mjs";
import { resultPath } from "../utils/resultPath.js";
import { readUserFile } from "../utils/checkUser.js";
import { config } from "../../config/config.js";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";

dotenv.config({ path: "./env/.env" });

const readLocalResults = () => {
  const { jsonFile } = resultPath();

  if (!fs.existsSync(jsonFile) || fs.statSync(jsonFile).size === 0) return [];

  try {
    return JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
  } catch (e) {
    Messages.error(`Could not parse local results: ${e.message}`);
    return [];
  }
};

const wpmOf = (Entry) => {
  const sourceWords = Number(Entry.sourceWords) || 0;
  const incorrect = Number(Entry.incorrectWords) || 0;
  const minutes = (Number(Entry.pastTime) || 0) / 60;

  if (minutes <= 0) return 0;
  return Math.max(0, sourceWords - incorrect) / minutes;
};

const accuracyOf = (Entry) => {
  const sourceWords = Number(Entry.sourceWords) || 0;
  const incorrect = Number(Entry.incorrectWords) || 0;

  if (sourceWords <= 0) return 0;
  return Math.max(0, (1 - incorrect / sourceWords) * 100);
};

const renderLocalStats = (Entries) => {
  Messages.log("\n");
  Messages.log("======================= Local stats =======================");

  if (Entries.length === 0) {
    Messages.log("\n");
    Messages.info("No local attempts recorded yet. Run a test first!");
    Messages.log("\n");
    return;
  }

  const totalAttempts = Entries.length;
  const totalWords = Entries.reduce((sum, e) => sum + (Number(e.sourceWords) || 0), 0);
  const totalIncorrect = Entries.reduce((sum, e) => sum + (Number(e.incorrectWords) || 0), 0);
  const totalTime = Entries.reduce((sum, e) => sum + (Number(e.pastTime) || 0), 0);

  const avgWpm = Entries.reduce((sum, e) => sum + wpmOf(e), 0) / totalAttempts;
  const avgAccuracy = Entries.reduce((sum, e) => sum + accuracyOf(e), 0) / totalAttempts;

  const best = Entries.reduce((best, e) => (wpmOf(e) > wpmOf(best) ? e : best), Entries[0]);
  const last = Entries[Entries.length - 1];

  Messages.log("\n");
  Messages.log(`Total attempts:     ${totalAttempts}`);
  Messages.log(`Total words typed:  ${totalWords}`);
  Messages.log(`Total incorrect:    ${totalIncorrect}`);
  Messages.log(`Total time spent:   ${totalTime.toFixed(2)}s`);
  Messages.log("\n");
  Messages.log(`Average speed:      ${avgWpm.toFixed(1)} wpm`);
  Messages.log(`Average accuracy:   ${avgAccuracy.toFixed(2)}%`);
  Messages.log("\n");
  Messages.log(`Best attempt:       ${wpmOf(best).toFixed(1)} wpm on [${best.date}]`);
  Messages.log(`Last attempt:       ${wpmOf(last).toFixed(1)} wpm on [${last.date}]`);

  Messages.log("\n");
  Messages.log("======================= Local stats =======================");
};

const renderGlobalStats = async (Username) => {
  Messages.log("\n\n");
  Messages.log("======================= Global stats =======================");
  Messages.log("\n");

  if (!Username || Username === "anon") {
    Messages.info("Global stats are only tracked for logged-in users (not 'anon').");
    Messages.log("\n");
    Messages.log("======================= Global stats =======================");
    return;
  }

  try {
    const { data } = await axios.get(`${process.env.URL}:3001/stats/${encodeURIComponent(Username)}`);

    Messages.log(`Username:           ${data.username?.trim?.() ?? Username}`);
    Messages.log(`Total attempts:     ${data.total_attempts}`);

    Messages.log(`Total words typed:  ${data.total_words}`);
    Messages.log(`Total incorrect:    ${data.total_incorrect}`);

    Messages.log(`Total time spent:   ${Number(data.total_time).toFixed(2)}s`);
    Messages.log(`Accuracy:           ${data.accuracy}`);

    Messages.log(`Last attempt:       ${data.last_attempt ?? "n/a"}`);
  } catch (e) {
    if (e.response?.status === 404) {
      Messages.info("No global stats yet for this user — submit a result first.");
    } else {
      Messages.error(`Could not reach the stats server: ${e.message}`);
    }
  }

  Messages.log("\n");
  Messages.log("======================= Global stats =======================");
};

const statsCmd = async () => {
  const username = readUserFile()?.UserName || config.u;
  const entries = readLocalResults();

  renderLocalStats(entries);
  await renderGlobalStats(username);

  Messages.log("\n\n");
  process.exit(0);
};

export { statsCmd };
