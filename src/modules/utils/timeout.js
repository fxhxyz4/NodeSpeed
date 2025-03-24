import { Messages } from "../../../lib/messages.js";
import { startProgram } from "../startProgram.js";
import { getUser } from "./getUser.js";

const timeoutPerStart = async (DataText, secret) => {
  const TIMEOUT = 10;

  if (!DataText) {
    Messages.error("No data to start");
    return;
  }

  await getUser(secret);

  Messages.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
  Messages.log(`Start writing after the timeout (${TIMEOUT}s) is over.`);

  setTimeout(() => {
    startProgram(DataText);
  }, TIMEOUT * 1000);

  Messages.log("\n\n\n");
};

export { timeoutPerStart };
