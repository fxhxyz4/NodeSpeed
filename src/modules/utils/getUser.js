import { Messages } from "../../../lib/messages.js";
import { generateSha256Hash } from "./genHash.js";
import { config } from "../../config/config.js";
import { readUserFile, FILE_PATH } from "./checkUser.js";
import { getToken } from "../../auth/auth.js";
import inquirer from "inquirer";
import fs from "fs";

const writeData = (Json) => {
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
    let UserName = config.u;

    const Sha256 = generateSha256Hash(config.u, Secret);
    writeData({ UserName, Sha256 });
  }

  return true;
};

export { getUser };
