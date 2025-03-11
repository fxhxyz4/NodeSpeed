import { showAscii } from "./modules/utils/showAscii.js";
import { parseArgs } from "./modules/utils/parseArgs.js";
import { cli } from "./modules/utils/cli.js";

/*
 * @start program
 */
const main = () => {
  const ARGV = process.argv.slice(2);
  const PARSE = parseArgs(ARGV);

  showAscii();
  cli(PARSE);
};

main();
