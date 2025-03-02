import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const resultPath = () => {
  const HOME = os.homedir();
  const configPath = path.join(HOME, ".config");

  let fileName = "results";
  const txtExt = ".txt";

  const csvExt = ".csv";

  const jsonExt = ".json";
  const nodeSpeedPath = path.join(configPath, "NodeSpeed");

  if (!fs.existsSync(nodeSpeedPath)) {
    fs.mkdirSync(nodeSpeedPath, { recursive: true });
  }

  let txtFile = path.join(nodeSpeedPath, fileName + txtExt);
  let csvFile = path.join(nodeSpeedPath, fileName + csvExt);

  let jsonFile = path.join(nodeSpeedPath, fileName + jsonExt);
  let csvColumns = "\n\n\n\n\nUser,Date,All words,Incorrect words,Past time,Source text,Answer text\n";

  if (!fs.existsSync(csvFile)) {
    csvColumns = "User,Date,All words,Incorrect words,Past time,Source text,Answer text\n";
  }

  fs.appendFileSync(csvFile, csvColumns, { encoding: "utf-8" });

  return { txtFile, csvFile, jsonFile };
}

export { resultPath };
