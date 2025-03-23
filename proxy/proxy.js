/* jshint ignore:start */
import { startPool } from "./modules/db_connect.js";
import { Messages } from "../lib/messages.js";
import rateLimit from "express-rate-limit";
import session from "express-session";
import express from "express";
import helmet from "helmet";
import cors from "cors";

let pool = null;

const proxy = express();
const { PORT, URL, SESSION_SECRET, SESSION_NAME } = process.env;

proxy.use(cors());

proxy.disable("trust proxy");
proxy.disable("x-powered-by");

proxy.use(
  session({
    secret: SESSION_SECRET,
    name: SESSION_NAME,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 10 * 676e9,
    },
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests, please try again later.",
  trustProxy: false,
});

proxy.use(limiter);
proxy.use(helmet());
proxy.use(express.json());

const init = async () => {
  pool = await startPool();
  Messages.debug("✅ Database pool initialized");
};

const formatDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") {
    return null;
  }

  const parts = dateStr.split(":").map(Number);

  if (parts.length !== 6) {
    return null;
  }

  const [day, month, year, hour, minute, second] = parts;

  if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
    return null;
  }

  const dateObj = new Date(year, month - 1, day, hour, minute, second);

  if (isNaN(dateObj.getTime())) {
    return null;
  }

  return dateObj.toISOString().slice(0, 19).replace("T", " ");
};

proxy.get("/", (req, res) => {
  res.json({ status: 200 });
});

proxy.post("/register", async (req, res) => {
  const { user, sha256 } = req.body;
  console.log(user, sha256);

  if (!user || !sha256) {
    return res.status(400).json({ error: "Missing username or sha256" });
  }

  try {
    await postSha({ user, sha256 });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

proxy.post("/post", async (req, res, next) => {
  let { user, date, sourceWords, incorrectWords, pastTime, sourceText, answerText } = req.body;

  const username = user.startsWith("@") ? user.slice(1) : user;

  try {
    const userSha256 = await getSha(username);
    if (!userSha256 || !(await checkSha(username, userSha256))) {
      return res.status(400).json({ error: "Invalid user or sha256 mismatch" });
    }

    const sql = `
      INSERT INTO users (username, total_attempts, total_words, total_incorrect, total_time, last_attempt, last_source_text, last_answer_text, sha256)
      VALUES (?, 1, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      total_attempts = total_attempts + 1,
      total_words = total_words + VALUES(total_words),
      total_incorrect = total_incorrect + VALUES(total_incorrect),
      total_time = total_time + VALUES(total_time),
      last_attempt = VALUES(last_attempt),
      last_source_text = VALUES(last_source_text),
      last_answer_text = VALUES(last_answer_text);
    `;

    const values = [
      username,
      parseInt(sourceWords, 10) || 0,
      parseInt(incorrectWords, 10) || 0,
      parseFloat(pastTime) || 0.0,
      formatDate(date),
      sourceText,
      answerText,
    ];

    const conn = await pool.getConnection();

    try {
      await conn.execute(sql, values);
      next();
    } finally {
      conn.release();
    }
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const getSha = async (Username) => {
  const sql = "SELECT sha256 FROM users WHERE username = ?";
  const conn = await pool.getConnection();

  try {
    const [rows] = await conn.execute(sql, [Username]);
    return rows.length > 0 ? rows[0].sha256 : null;
  } catch (e) {
    return null;
  } finally {
    conn.release();
  }
};

const checkSha = async (Username, Sha256) => {
  try {
    const storedSha = await getSha(Username);
    if (!storedSha) {
      return false;
    }
    return storedSha === Sha256;
  } catch (e) {
    return false;
  }
};

const postSha = async ({ user, sha256 }) => {
  const sql = "INSERT INTO users (username, sha256) VALUES (?, ?) ON DUPLICATE KEY UPDATE sha256 = VALUES(sha256);";
  const conn = await pool.getConnection();

  const values = [user, sha256 || ""];

  try {
    await conn.execute(sql, values);
  } catch (e) {
  } finally {
    conn.release();
  }
};

proxy.get("*", (req, res) => {
  res.json({ status: 404 });
});

proxy.listen(PORT, async () => {
  await init();
  Messages.debug(`Proxy started on ${URL}:${PORT}`);
});
/* jshint ignore:end */
