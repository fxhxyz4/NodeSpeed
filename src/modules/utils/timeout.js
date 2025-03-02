import { startProgram } from "../startProgram.js";
import { config } from "../../config/config.js";
import { Messages } from "./messages.js";
import { getUser } from "../getUser.js";

const timeoutPerStart = async (DataText) => {
    const TIMEOUT = 2;

    if (!DataText) {
        Messages.error("No data to start");
        return;
    }

    if (config.u === "anon") {
      await getUser();
    }

    Messages.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
    Messages.log(`Start writing after the timeout (${TIMEOUT}s) is over.`);

    setTimeout(() => {
        startProgram(DataText);
    }, TIMEOUT * 1000);

    Messages.log("\n\n\n");
}

export { timeoutPerStart };
