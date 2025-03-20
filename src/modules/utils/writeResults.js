import { Messages } from "../../../lib/messages.js";
import { createLogDate } from "./createLogDate.js";
import { postResults } from "./postResults.js";
import { resultPath } from "./resultPath.js";
import fs from "fs";

const writeResults = (Results) => {
  let { user, sourceLength, numOfIncorrect, pastTime, sourceText, answerText } = Results;

  let answerTextReplaced = answerText.replace("\n", "");
  let sourceTextReplaced = sourceText.replace("\n", "");

  let sourceMessage = `Source words: ${sourceLength}`;
  let incorrectMessage = `Incorrect words: ${numOfIncorrect}`;
  let pastTimeMessage = `Past time: ${pastTime}`;

  let sourceTextMessage = `Source text: ${sourceTextReplaced}`;
  let answerTextMessage = `Answer text: ${answerTextReplaced}`;

  let data = [];

  const { txtFile, csvFile, jsonFile } = resultPath();
  const DATE = createLogDate();

  if (fs.existsSync(jsonFile) && fs.statSync(jsonFile).size > 0) {
    try {
      const fileContent = fs.readFileSync(jsonFile, "utf-8");
      data = JSON.parse(fileContent);
    } catch (e) {
      Messages.error(`Error parsing JSON: ${e}`);
      data = [];
    }
  } else {
    data = [];
  }

  let txtMessage = `User: @${user}\nDate: [${DATE}]\n${sourceMessage}\n${incorrectMessage}\n${pastTimeMessage}\n${sourceTextMessage}\n${answerTextMessage}\n\n\n`;

  let csvMessage = `@${user},${DATE},${sourceLength},${numOfIncorrect},${pastTime},${sourceTextReplaced},${answerTextReplaced}\n`;

  let jsonMessage = {
    user: `@${user}`,
    date: `${DATE}`,
    sourceWords: `${sourceLength}`,
    incorrectWords: `${numOfIncorrect}`,
    pastTime: `${pastTime}`,
    sourceText: `${sourceTextReplaced}`,
    answerText: `${answerTextReplaced}`,
  };

  data.push(jsonMessage);
  postResults(jsonMessage);

  fs.appendFileSync(txtFile, txtMessage, { encoding: "utf-8" });
  fs.appendFileSync(csvFile, csvMessage, { encoding: "utf-8" });

  fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2), { encoding: "utf-8" });
};

export { writeResults };
