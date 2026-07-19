import { Messages } from "../../../lib/messages.mjs";
import { versionCmd } from "../cmd/versionCmd.js";
import { contactCmd } from "../cmd/contactCmd.js";
import { config } from "../../config/config.js";
import { checkConfig } from "../checkConfig.js";
import { onlineCmd } from "../cmd/onlineCmd.js";
import { statsCmd } from "../cmd/statsCmd.js";
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
          return;
        case "helpCmd":
          helpCmd(key, elem);
          return;
        case "a":
        case "about":
          aboutCmd();
          return;
        case "v":
        case "version":
          versionCmd();
          return;
        case "contact":
          contactCmd();
          return;
        case "stats":
          statsCmd();
          return;

        case "o":
        case "online":
          let loginResult = await checkConfig();
          if (!loginResult) return;

          await onlineCmd();
          return;
      }
    }
  }

  let result = await checkConfig();
  timeoutPerStart([result, config.m, config.t], secret);
};

export { cli };
