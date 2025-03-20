import { PackageJSON } from "../utils/packageJson.js";
import { Messages } from "../../../lib/messages.js";

const { AUTHOR_NAME, AUTHOR_EMAIL, AUTHOR_URL } = PackageJSON;

const contactCmd = () => {
  Messages.log("\n");
  Messages.log(`author: ${AUTHOR_NAME}`);

  Messages.log(`email: ${AUTHOR_EMAIL}`);
  Messages.log(`website: ${AUTHOR_URL.replace("https://", "")}`);

  Messages.log("\n");
  process.exit(0);
};

export { contactCmd };
