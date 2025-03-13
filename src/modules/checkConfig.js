import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url); // jshint ignore:line
const __dirname = path.dirname(__filename); // jshint ignore:line

const textPath = path.resolve(__dirname, "../data/data.json");
const text = JSON.parse(fs.readFileSync(textPath, "utf-8"));

import { checkSource } from "./checkSource.js";
import { Messages } from "./utils/messages.js";
import { config } from "../config/config.js";

const checkConfig = async () => {
  const { c, l, m, t, s } = config;

  if (s === "random") {
    const textData = text.text[l];

    if (!textData) {
      Messages.error(`Language: ${l} not found`);
      return;
    }

    const levelData = textData[c];

    if (!levelData) {
      Messages.error(`Level: ${c} not found for language ${l}`);
      return;
    }

    const randomIndex = Math.floor(Math.random() * levelData.length);
    const randomText = levelData[randomIndex];

    return [randomText, m, t];
  }

  const resultText = await checkSource(s);
  return resultText;
};

export { checkConfig };
