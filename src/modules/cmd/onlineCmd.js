import { searchIncorrectWords } from "../utils/searchIncorrectWords.js";
import { readUserFile } from "../utils/checkUser.js";
import { Messages } from "../../../lib/messages.mjs";
import { config } from "../../config/config.js";
import { io as ioClient } from "socket.io-client";
import readline from "node:readline";
import inquirer from "inquirer";
import dotenv from "dotenv";

dotenv.config({ path: "./env/.env" });

const captureTyping = (SourceText) =>
  new Promise((resolve) => {
    let typedText = "";
    let cursorPos = 0;
    let answered = false;

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const updateConsole = () => {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`\x1b[96m> ${typedText}`);
      process.stdout.cursorTo(cursorPos + 2);
    };

    Messages.clr();
    Messages.log(`\n\n\n\n\x1b[95m${SourceText}\n`);

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdout.write("\x1B[?25h\x1b[96m> ");

    const timeStart = Date.now();

    const onKeypress = (ch, key) => {
      if (answered) return;

      if (key?.name === "return") {
        answered = true;
        const pastTime = ((Date.now() - timeStart) / 1000).toFixed(2);

        process.stdin.setRawMode(false);
        process.stdin.off("keypress", onKeypress);
        process.stdout.write("\n\x1B[?25h");
        process.stdin.pause();
        rl.close();

        resolve({ answerText: typedText.trim(), pastTime: Number(pastTime) });
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
    };

    process.stdin.on("keypress", onKeypress);
  });

const countdown = (ms) =>
  new Promise((resolve) => {
    let left = Math.ceil(ms / 1000);
    Messages.log("\n");
    Messages.info(`Opponent found! Starting in ${left}...`);

    const interval = setInterval(() => {
      left--;
      if (left > 0) {
        Messages.info(`${left}...`);
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

const promptRoomChoice = async () => {
  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "\n\n\nHow do you want to play online?",
      choices: [
        { name: "Quick match (find a random opponent)", value: "quick" },
        { name: "Create a private room", value: "create" },
        { name: "Join a room with a code", value: "join" },
      ],
    },
  ]);
  return choice;
};

const promptRoomCode = async () => {
  const { code } = await inquirer.prompt([
    { type: "input", name: "code", message: "\n\n\nEnter the room code your opponent gave you:" },
  ]);

  return code.trim().toUpperCase();
};

const onlineCmd = async () => {
  const username = readUserFile()?.UserName || config.u;

  if (!process.env.URL) {
    Messages.error("Server URL is not configured (see env/.env)");
    process.exit(1);
    return;
  }

  const choice = await promptRoomChoice();
  let code = null;

  if (choice === "join") {
    code = await promptRoomCode();
  }

  Messages.clr();
  Messages.info("Connecting to the online server...");

  const socket = ioClient(`${process.env.URL}:3001`);

  socket.on("connect_error", (e) => {
    Messages.clr();
    Messages.error(`Could not reach the online server: ${e.message}`);
    process.exit(1);
  });

  socket.on("connect", () => {
    Messages.info("Connected successfully!");

    if (choice === "quick") {
      socket.emit("queue:find", { username });

      socket.on("queue:waiting", () => {
        Messages.log("\n");
        Messages.info("Searching for an opponent... (Ctrl+C to cancel)");
      });
    } else if (choice === "create") {
      socket.emit("room:create", { username }, ({ code: createdCode }) => {
        Messages.log("\n");
        Messages.log(`Room created! Share this code with your opponent: \x1b[93m${createdCode}`);
        Messages.info("Waiting for someone to join...");
      });
    } else if (choice === "join" && code) {
      socket.emit("room:join", { code, username }, (response) => {
        if (response?.error) {
          Messages.error(response.error);
          socket.disconnect();
          process.exit(1);
        }
      });
    }
  });

  socket.on("match:found", async ({ text, players, startsInMs }) => {
    const opponent = players.find((p) => p !== username) || "opponent";

    Messages.log("\n");
    Messages.log(`Matched against \x1b[92m${opponent}`);

    await countdown(startsInMs ?? 3000);

    const { answerText, pastTime } = await captureTyping(text);
    const incorrectWords = searchIncorrectWords(answerText, text);
    const sourceWords = text.split(/\s+/).filter(Boolean).length;

    Messages.log("\n");
    Messages.info("Waiting for your opponent to finish...");

    socket.emit("race:finish", { pastTime, incorrectWords, sourceWords });
  });

  socket.on("race:opponentFinished", () => {
    Messages.log("\n");
    Messages.warn("Your opponent just finished — hurry up!");
  });

  socket.on("race:result", ({ winner, players }) => {
    Messages.log("\n");
    Messages.log("================= Race results =================");
    Messages.log("\n");

    players.forEach((p) => {
      const marker = p.username === winner ? "🏆" : "  ";
      Messages.log(`${marker} ${p.place}. ${p.username} — ${p.result.pastTime}s, ${p.result.incorrectWords} incorrect`);
    });

    Messages.log("\n");
    Messages.log(winner === username ? "You won! 🎉" : `${winner} won this round.`);
    Messages.log("================= Race results =================");
    Messages.log("\n\n");

    socket.disconnect();
    process.exit(0);
  });

  socket.on("opponent:left", () => {
    Messages.log("\n");
    Messages.warn("Your opponent disconnected. Race cancelled.");
    socket.disconnect();
    process.exit(0);
  });
};

export { onlineCmd };
