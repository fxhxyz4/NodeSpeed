import { Messages } from "../../lib/messages.js";
import { config } from "../config/config.js";
import readline from "node:readline";

const getUser = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askUsername = () => {
      Messages.info("Use 'anon' user for not saving stats");

      rl.question("Type your username: ", (user) => {
        if (!user.trim() || user.length > 49) {
          Messages.log("\n\n");

          Messages.error("User is not defined or user name > 49 symbols");
          Messages.info("Try again...");

          Messages.log("\n\n");
          return askUsername();
        }

        config.u = user.trim();
        rl.close();

        resolve(true);
      });
    };

    askUsername();
  });
};

export { getUser };
