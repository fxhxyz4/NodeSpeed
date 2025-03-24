import { Messages } from "../../../lib/messages.js";
import { versionCmd } from "../cmd/versionCmd.js";
import { contactCmd } from "../cmd/contactCmd.js";
import { config } from "../../config/config.js";
import { checkConfig } from "../checkConfig.js";
import { timeoutPerStart } from "./timeout.js";
import { typeHelp } from "../cmd/typeHelp.js";
import { aboutCmd } from "../cmd/aboutCmd.js";
import { helpCmd } from "../cmd/helpCmd.js";

const cli = async (Params, secret) => {
  if (!Params || typeof Params !== "object") {
    Messages.error("Params object incorrect");
    return;
  }

  for (const key in Params) {
    if (Object.prototype.hasOwnProperty.call(Params, key)) {
      const elem = Params[key];
      config[key] = elem;

      switch (key) {
        case "h":
        case "help":
          typeHelp();
          break;
        case "helpCmd":
          helpCmd(key, elem);
          break;
        case "a":
        case "about":
          aboutCmd();
          break;
        case "v":
        case "version":
          versionCmd();
          break;
        case "contact":
          contactCmd();
          break;
        case "stats":
          // statsCmd();
          break;
        case "o":
        case "online":
          // onlineCmd();
          break;
      }
    }
  }

  let result = await checkConfig();
  timeoutPerStart([result, config.m, config.t], secret);
};

export { cli };
