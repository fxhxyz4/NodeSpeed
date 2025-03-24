import { checkUserFile } from "./modules/utils/checkUser.js";
import { showAscii } from "./modules/utils/showAscii.js";
import { parseArgs } from "./modules/utils/parseArgs.js";
import { processPass } from "./modules/utils/getSecret.js";
import { Messages } from "../lib/messages.js";
import { cli } from "./modules/utils/cli.js";
import { config } from "./config/config.js";
import { getToken } from "./auth/auth.js";
/*
 * @start program
 */
const main = async () => {
  showAscii();

  Messages.error("Pass never updated!");
  const secret = await processPass();

  if (checkUserFile()) {
    config.u = await getToken();
  }

  const ARGV = process.argv.slice(2);
  const PARSE = parseArgs(ARGV);

  cli(PARSE, secret);
};

main();
