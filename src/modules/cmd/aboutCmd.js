import { PackageJSON } from "../utils/packageJson.js";
import { Messages } from "../utils/messages.js";

const aboutCmd = () => {
  let { NAME, DESC, HOME_PAGE, BUGS_URL, LICENSE } = PackageJSON;

  Messages.log(`\x1b[95m${NAME} — ${DESC}`);
  Messages.log("\n");

  Messages.log(`\x1b[92mLicense: ${LICENSE}`);

  Messages.log(`\x1b[96mWeb: ${HOME_PAGE}`);
  Messages.log(`\x1b[91mBugs: ${BUGS_URL}`);

  Messages.log("\n\n");
  process.exit(0);
};

export { aboutCmd };
