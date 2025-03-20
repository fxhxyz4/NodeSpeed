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

/* jshint ignore:start */
const init = async () => {
  pool = await startPool();
  Messages.debug("✅ Database pool initialized");
};

const formatDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") {
    Messages.error("❌ Error with date format:", dateStr);
    return null;
  }

  const parts = dateStr.split(":").map(Number);

  if (parts.length !== 6) {
    Messages.error("❌ Error with date format:", dateStr);
    return null;
  }

  const [day, month, year, hour, minute, second] = parts;

  if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
    Messages.error("❌ Date isNaN:", dateStr);
    return null;
  }

  const dateObj = new Date(year, month - 1, day, hour, minute, second);

  if (isNaN(dateObj.getTime())) {
    Messages.error("❌ Error creating dateObj:", dateStr);
    return null;
  }

  return dateObj.toISOString().slice(0, 19).replace("T", " ");
};

proxy.get("/", (req, res) => {
  res.send({ status: 200 });
});

proxy.post("/post", async (req, res, next) => {
  let userData = req.body;
  let { user, date, sourceWords, incorrectWords, pastTime, sourceText, answerText } = userData;

  const username = user.startsWith("@") ? user.slice(1) : user;

  const sql = `
  INSERT INTO users (username, total_attempts, total_words, total_incorrect, total_time, last_attempt, last_source_text, last_answer_text)
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
    console.log(`✅ data for user was updated: ${username}`);

    next();
  } catch (e) {
    console.error("❌ error:", e.message);
  } finally {
    conn.release();
  }
});

proxy.get("*", (req, res) => {
  res.send({ status: 404 });
});

proxy.listen(PORT, async () => {
  init();
  Messages.debug(`Proxy started on ${URL}:${PORT}`);
});
/* jshint ignore:end */
