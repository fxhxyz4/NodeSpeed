import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const resultPath = () => {
  const HOME = os.homedir();
  const configPath = path.join(HOME, ".config");
  const nodeSpeedPath = path.join(configPath, "NodeSpeed");

  let fileName = "results";
  const txtExt = ".txt";

  const csvExt = ".csv";
  const jsonExt = ".json";

  if (!fs.existsSync(nodeSpeedPath)) {
    fs.mkdirSync(nodeSpeedPath, { recursive: true });
  }

  let txtFile = path.join(nodeSpeedPath, fileName + txtExt);
  let csvFile = path.join(nodeSpeedPath, fileName + csvExt);
  let jsonFile = path.join(nodeSpeedPath, fileName + jsonExt);

  return { txtFile, csvFile, jsonFile };
};

export { resultPath };
