import { searchIncorrectWords } from "./utils/searchIncorrectWords.js";
import { writeResults } from "./utils/writeResults.js";
import { Messages } from "../../lib/messages.mjs";
import { config } from "../config/config.js";
import readline from "node:readline";

let sourceText = "";

const processAnswer = async (Answer, timeStart, timeEnd) => {
  const numOfIncorrect = searchIncorrectWords(Answer, sourceText);
  const sourceLength = sourceText.split(" ").length;

  let user = config.u;
  let answerText = Answer;

  Messages.log("\n");
  Messages.log("================= Results =================");
  Messages.log("\n");

  Messages.log(`Source words: ${sourceLength}`);
  Messages.log(`Incorrect words: ${numOfIncorrect}`);

  const pastTime = ((timeEnd - timeStart) / 1000).toFixed(2);
  Messages.log(`Past time: ${pastTime}s`);

  Messages.log("\n");
  Messages.log("================= Results =================");
  Messages.log("\n");

  if (user !== "anon") {
    try {
      await writeResults({ user, sourceLength, numOfIncorrect, pastTime, sourceText, answerText });
    } catch (e) {
      Messages.error(`Failed to save results: ${e.message}`);
    }
  }
};

const startProgram = (Data) => {
  let mode = Data[1];
  let timeout = Number(Data[2]);

  let typedText = "";
  let cursorPos = 0;
  let timeStart = 0;
  let timeEnd = 0;

  const PROMPT = "> ";

  const terminalCols = () => process.stdout.columns || 80;

  const placeCursor = () => {
    const cols = terminalCols();

    const caretAbsolute = PROMPT.length + cursorPos;
    const caretRow = Math.floor(caretAbsolute / cols);
    const caretCol = caretAbsolute % cols;

    const endAbsolute = PROMPT.length + typedText.length;
    const endRow = Math.floor(Math.max(endAbsolute - 1, 0) / cols);

    const rowsUp = endRow - caretRow;
    if (rowsUp > 0) process.stdout.moveCursor(0, -rowsUp);

    process.stdout.cursorTo(caretCol);
  };

  const updateConsole = () => {
    Messages.clr();
    Messages.log(`\n\n\n\n\x1b[95m${sourceText}\n`);

    process.stdout.write(`\x1b[96m${PROMPT}${typedText}`);
    placeCursor();
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  if (mode === "normal") {
    timeout = 0;
  } else if (mode !== "timed" && timeout <= 0) {
    Messages.error("Timeout <= 0");
    Messages.log("\n");

    rl.close();
    return;
  }

  if (config.s === "random") {
    sourceText = Data[0][0];
  } else {
    sourceText = Data[0];
  }

  Messages.clr();
  Messages.log(`\n\n\n\n\x1b[95m${sourceText}\n`);

  let isAnswered = false;

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdout.write("\x1B[?25h");

  timeStart = Date.now();
  updateConsole();

  process.stdin.on("keypress", async (ch, key) => {
    if (!isAnswered) {
      if (key?.name === "return") {
        isAnswered = true;
        timeEnd = Date.now();

        process.stdin.setRawMode(false);
        process.stdout.write("\n\x1B[?25h");

        process.stdin.pause();
        rl.close();

        try {
          await processAnswer(typedText.trim(), timeStart, timeEnd);
        } catch (err) {
          Messages.error("\n[ERROR] Crash inside keypress processAnswer:");
        }
      } else if (key?.name === "backspace") {
        if (cursorPos > 0) {
          typedText = typedText.slice(0, cursorPos - 1) + typedText.slice(cursorPos);
          cursorPos--;
          updateConsole();
        }
      } else if (key?.name === "left") {
        if (cursorPos > 0) {
          cursorPos--;
          placeCursor();
        }
      } else if (key?.name === "right") {
        if (cursorPos < typedText.length) {
          cursorPos++;
          placeCursor();
        }
      } else if (ch) {
        typedText = typedText.slice(0, cursorPos) + ch + typedText.slice(cursorPos);
        cursorPos++;
        updateConsole();
      }
    }
  });

  if (mode === "timed" && timeout > 0) {
    setTimeout(async () => {
      if (!isAnswered) {
        isAnswered = true;
        timeEnd = Date.now();

        process.stdin.setRawMode(false);
        process.stdin.pause();
        rl.close();

        try {
          await processAnswer(typedText.trim(), timeStart, timeEnd);
        } catch (err) {
          console.error("\n[ERROR] Crash inside timeout processAnswer:");
          console.error(err);
        }
      }
    }, timeout);
  }
};

export { startProgram };
