import { readUserFile, FILE_PATH } from "./checkUser.js";
import { Messages } from "../../../lib/messages.mjs";
import { generateSha256Hash } from "./genHash.js";
import { config } from "../../config/config.js";
import { getToken } from "../../auth/auth.js";
import inquirer from "inquirer";
import path from "path";
import fs from "fs";

const writeData = (Json) => {
  const dirPath = path.dirname(FILE_PATH);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(FILE_PATH, JSON.stringify(Json, null, 2), { encoding: "utf-8" });
};

const getUser = async (Secret) => {
  Messages.log("\n\n");
  Messages.info("Select 'anon' user for not saving stats mode");
  Messages.log("\n\n");

  const userFile = await readUserFile();
  const githubUser = userFile?.UserName || config.u;

  const { user } = await inquirer.prompt([
    {
      type: "list",
      name: "user",
      message: "Select your username:",
      choices: [githubUser, "anon", "Not you? Login", new inquirer.Separator()],
    },
  ]);

  if (user === "Not you? Login") {
    config.u = await getToken();
  } else {
    config.u = user;
  }

  if (user !== "anon") {
    const UserName = config.u;
    const Sha256 = generateSha256Hash(UserName, Secret);

    if (userFile && userFile.UserName === UserName) {
      if (userFile.Sha256 !== Sha256) {
        Messages.error("Password incorrect");
        process.exit(1);
      }
    } else {
      await upsertUserInDb(UserName, Sha256);
      writeData({ UserName, Sha256 });
    }
  }

  return true;
};

export { getUser };
