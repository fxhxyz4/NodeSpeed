import { Messages } from "../lib/messages.js";
import { fileURLToPath } from "url";
import rcedit from "rcedit";
import path from "path";

const __filename = fileURLToPath(import.meta.url); // jshint ignore:line
const __dirname = path.dirname(__filename); // jshint ignore:line

const exePath = path.resolve(__dirname, "../build/NodeSpeed-win.exe");
const iconPath = path.resolve(__dirname, "../assets/icon/icon.ico");

rcedit(exePath, {
  icon: iconPath,
})
  .then(() => {
    Messages.log("Icon changed successfully!");
  })
  .catch((e) => {
    Messages.error("Failed to change icon:", e);
  });
