import path from "path";
import fs from "fs";
import os from "os";

const FILE_PATH = path.join(os.homedir(), ".config", "NodeSpeed", ".USER.json");

const checkUserFile = () => {
  if (!fs.existsSync(FILE_PATH) || fs.readFileSync(FILE_PATH, { encoding: "utf-8" }).trim() === "") {
    return true;
  }
};

const readUserFile = () => {
  try {
    const jsonData = JSON.parse(fs.readFileSync(FILE_PATH, { encoding: "utf-8" }).trim());
    return jsonData;
  } catch (e) {
    return null;
  }
};

export { FILE_PATH, checkUserFile, readUserFile };
