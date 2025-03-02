import { Messages } from "./utils/messages.js";
import { config } from "../config/config.js";
import readline from "node:readline";

const getUser = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askUsername = () => {
      Messages.info("Use 'anon' user for not saving stats");

      rl.question("Type your username: ", (user) => {
        if (!user.trim()) {
          Messages.log("\n\n");

          Messages.error("User is not defined");
          Messages.info("Try again...");

          Messages.log("\n\n");
          return askUsername();
        }

        config["u"] = user.trim();
        rl.close();

        resolve(true);
      });
    };

    askUsername();
  });
};

export { getUser };
