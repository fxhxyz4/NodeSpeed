import { promiseFetcher } from "./utils/promiseFetcher.js";
import { Messages } from "../../lib/messages.js";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // jshint ignore:line

const boolUrl = (Source) => {
  try {
    new URL(Source); // jshint ignore:line
    return true;
  } catch {
    return false;
  }
};

const checkSource = (Source) => {
  if (!Source) {
    Messages.error(`Source: ${Source} is not valid`);
    Messages.info("Use: --helpCmd=source");
  }

  const isUrl = boolUrl(Source);

  if (isUrl) {
    const result = promiseFetcher(Source);
    return result;
  }

  const fullPath = path.resolve(__dirname, Source);

  if (!fs.existsSync(fullPath)) {
    Messages.error(`File not found: ${fullPath}`);
    return;
  }

  const result = fs.readFileSync(fullPath, { encoding: "utf-8" });
  return result;
};

export { checkSource };
