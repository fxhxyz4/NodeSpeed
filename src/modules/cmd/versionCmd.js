import { PackageJSON } from "../utils/packageJson.js";
import { Messages } from "../utils/messages.js";

const versionCmd = () => {
  Messages.log(`\x1b[94mNodeSpeed version: \x1b[31m${PackageJSON.VERSION}`);
  Messages.log("\n\n");

  process.exit(0);
};

export { versionCmd };
