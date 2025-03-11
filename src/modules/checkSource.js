import { promiseFetcher } from "./utils/promiseFetcher.js";
import { Messages } from "./utils/messages.js";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const boolUrl = (Source) => {
  try {
    new URL(Source);
    return true;
  } catch {
    return false;
  }
};

export { checkSource };
