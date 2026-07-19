// Point this at your deployed proxy (the same server the CLI's env/.env URL points to).
document.getElementById("year").textContent = new Date().getFullYear();

const SCRIPT = [
  { type: "line", text: "$ nodespeed -c=2 -l=en", cls: "" },
  { type: "pause", ms: 400 },
  { type: "line", text: "\nMusic is an important part of human life. It can bring", cls: "accent-magenta" },
  { type: "line", text: "people together, express emotions, and even help with", cls: "accent-magenta" },
  { type: "line", text: "relaxation.\n", cls: "accent-magenta" },
  { type: "type", text: "> Music is an importnt part of human life. It can bring", cls: "accent-cyan" },
  { type: "pause", ms: 300 },
  { type: "line", text: "\n\n================= Results =================", cls: "" },
  { type: "line", text: "Source words: 15", cls: "" },
  { type: "line", text: "Incorrect words: 1", cls: "accent-yellow" },
  { type: "line", text: "Past time: 6.42s\n", cls: "" },
  { type: "pause", ms: 900 },
  { type: "line", text: "$ nodespeed -o", cls: "" },
  { type: "pause", ms: 300 },
  { type: "line", text: "? How do you want to play online? Create a private room", cls: "accent-green" },
  { type: "line", text: "Room created! Share this code: 7F3K9Q", cls: "accent-yellow" },
  { type: "line", text: "Waiting for someone to join…", cls: "" },
  { type: "pause", ms: 700 },
  { type: "line", text: "Matched against @rival", cls: "accent-green" },
  { type: "line", text: "Starting in 3… 2… 1…\n", cls: "" },
  { type: "line", text: "🏆 1. you — 5.90s, 0 incorrect", cls: "accent-cyan" },
  { type: "line", text: "   2. @rival — 6.35s, 1 incorrect", cls: "" },
  { type: "line", text: "\nYou won! 🎉", cls: "accent-green" },
  { type: "pause", ms: 1600 },
];

const termBody = document.getElementById("term-body");

const appendSpan = (text, cls) => {
  const span = document.createElement("span");
  if (cls) span.className = cls;
  span.textContent = text;
  termBody.appendChild(span);
};

const runScript = async () => {
  termBody.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "term-cursor";
  cursor.textContent = "\u00A0";

  for (const step of SCRIPT) {
    if (step.type === "pause") {
      await sleep(step.ms);
      continue;
    }

    if (step.type === "line") {
      appendSpan(step.text + "\n", step.cls);
      termBody.appendChild(cursor);
      await sleep(140);
      continue;
    }

    if (step.type === "type") {
      const span = document.createElement("span");
      if (step.cls) span.className = step.cls;
      termBody.appendChild(span);
      termBody.appendChild(cursor);

      for (const ch of step.text) {
        span.textContent += ch;
        await sleep(22 + Math.random() * 28);
      }

      appendSpan("\n", "");
      await sleep(120);
    }
  }

  await sleep(1200);
  runScript();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  runScript();
} else {
  termBody.textContent = SCRIPT.filter((s) => s.text)
    .map((s) => s.text)
    .join("\n");
}

const liveDot = document.getElementById("live-dot");
const liveText = document.getElementById("live-text");
const statOnline = document.getElementById("stat-online");

const refreshOnlineCount = async () => {
  try {
    const res = await fetch(`${SERVER_URL}/online`);
    if (!res.ok) throw new Error("bad response");

    const { online } = await res.json();

    liveDot.classList.add("is-live");
    liveText.textContent = `${online} racer${online === 1 ? "" : "s"} online right now`;
    statOnline.textContent = online;
  } catch (e) {
    liveDot.classList.remove("is-live");
    liveText.textContent = "server status unavailable";
    statOnline.textContent = "–";
  }
};

refreshOnlineCount();
setInterval(refreshOnlineCount, 15000);
