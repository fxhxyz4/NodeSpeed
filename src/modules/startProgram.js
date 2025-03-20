import { searchIncorrectWords } from "./utils/searchIncorrectWords.js";
import { writeResults } from "./utils/writeResults.js";
import { Messages } from "../../lib/messages.js";
import { config } from "../config/config.js";
import readline from "node:readline";

let sourceText = "",
  timeStart = 0,
  timeEnd = 0,
  pastTime = 0,
  typedText = "",
  cursorPos = 0;

const processAnswer = (Answer) => {
  const numOfIncorrect = searchIncorrectWords(Answer, sourceText);
  const sourceLength = sourceText.split(" ").length;

  let user = config.u;
  let answerText = Answer;

  Messages.log("\n");

  Messages.log("================= Results =================");
  Messages.log("\n");

  Messages.log(`Source words: ${sourceLength}`);

  Messages.log(`Incorrect words: ${numOfIncorrect}`);
  pastTime = ((timeEnd - timeStart) / 1000).toFixed(2);

  Messages.log(`Past time: ${pastTime}s`);

  Messages.log("\n");
  Messages.log("================= Results =================");

  Messages.log("\n");

  if (user !== "anon") {
    writeResults({ user, sourceLength, numOfIncorrect, pastTime, sourceText, answerText });
  }
};

const updateConsole = () => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  process.stdout.write(`\x1b[96m> ${typedText}`);
  process.stdout.cursorTo(cursorPos + 2);
};

const startProgram = (Data) => {
  let mode = Data[1];
  let timeout = Number(Data[2]);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  if (mode === "normal") {
    timeout = 0;
  } else if (mode !== "timed" && timeout <= 0) {
    Messages.error(`Timeout <= 0`);
    Messages.log("\n");

    rl.close();
    return;
  }

  if (config.s === "random") {
    sourceText = Data[0][0];
  } else {
    sourceText = Data[0];
  }

  console.clear();
  Messages.log(`\n\n\n\n\x1b[95m${sourceText}\n`);

  let isAnswered = false;

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  process.stdout.write("\x1B[?25h");

  process.stdin.on("keypress", (ch, key) => {
    if (!isAnswered) {
      if (key?.name === "return") {
        isAnswered = true;
        timeEnd = Date.now();

        process.stdin.setRawMode(false);
        process.stdout.write("\n\x1B[?25h");

        process.stdin.pause();
        processAnswer(typedText.trim());
      } else if (key?.name === "backspace") {
        if (cursorPos > 0) {
          typedText = typedText.slice(0, cursorPos - 1) + typedText.slice(cursorPos);
          cursorPos--;

          updateConsole();
        }
      } else if (key?.name === "left") {
        if (cursorPos > 0) {
          cursorPos--;
          process.stdout.cursorTo(cursorPos + 2);
        }
      } else if (key?.name === "right") {
        if (cursorPos < typedText.length) {
          cursorPos++;
          process.stdout.cursorTo(cursorPos + 2);
        }
      } else if (ch) {
        typedText = typedText.slice(0, cursorPos) + ch + typedText.slice(cursorPos);
        cursorPos++;

        updateConsole();
      }
    }
  });

  if (mode === "timed" && timeout > 0) {
    setTimeout(() => {
      if (!isAnswered) {
        isAnswered = true;

        timeEnd = Date.now();
        process.stdin.setRawMode(false);

        process.stdin.pause();
        processAnswer(typedText.trim());
      }
    }, timeout);
  }

  timeStart = Date.now();
  process.stdout.write("\x1b[96m> ");
};

export { startProgram };
