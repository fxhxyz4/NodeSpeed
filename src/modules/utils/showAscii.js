import { Messages } from "./messages.js";

const showAscii = () => {
  let art = [
    "    _   __          __    _____                     __  ",
    "   / | / /___  ____/ /__ / ___/____  ___  ___  ____/ /  ",
    "  /  |/ / __ \\/ __  / _ \\\\__ \\/ __ \\/ _ \\/ _ \\/ __  /   ",
    " / /|  / /_/ / /_/ /  __/__/ / /_/ /  __/  __/ /_/ /    ",
    "/_/ |_/\\____/\\__,_/\\___/____/ .___/\\___/\\___/\\__,_/     ",
    "                           /_/                           ",
  ];

  Messages.log("\n");
  Messages.log(`\x1b[96m${art.join("\n")}`);

  Messages.log("\n");
};

export { showAscii };
