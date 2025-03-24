/* jshint ignore:start */
import { startPool } from "./modules/db_connect.js";
import rateLimit from "express-rate-limit";
import session from "express-session";
import express from "express";
import helmet from "helmet";
import cors from "cors";

let pool = null;
const { PORT, URL, SESSION_SECRET, SESSION_NAME } = process.env;

const proxy = express();
proxy.use(cors());

proxy.disable("trust proxy");
proxy.disable("x-powered-by");

proxy.use(helmet());
proxy.use(express.json());

proxy.use(
  session({
    secret: SESSION_SECRET,
    name: SESSION_NAME,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 676e9 },
  }),
);

proxy.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many requests, please try again later.",
    trustProxy: false,
  }),
);

const init = async () => {
  pool = await startPool();
  console.debug("✅ Database pool initialized");
};

const formatDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const parts = dateStr.split(":"),
    [day, month, year, hour, minute, second] = parts.map(Number);

  return parts.length === 6 && !parts.some(isNaN)
    ? new Date(year, month - 1, day, hour, minute, second).toISOString().slice(0, 19).replace("T", " ")
    : null;
};

const retryQuery = async (query, values, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      const [result] = await conn.execute(query, values);

      conn.release();
      return result;
    } catch (e) {
      if (e.code === "ER_USER_LIMIT_REACHED") {
        console.warn(`DB limit reached, retrying in ${attempt + 1} sec...`);
        await new Promise((res) => setTimeout(res, (attempt + 1) * 1000));
      } else {
        throw e;
      }
    }
  }
  throw new Error("Failed after retries");
};

const getSha256ByUsername = async (username) => {
  const rows = await retryQuery("SELECT sha256 FROM users WHERE TRIM(username) = ?", [username]);

  return rows.length > 0 ? rows[0].sha256.trim() : null;
};

proxy.get("/", (req, res) => res.json({ status: 200 }));

proxy.post("/post", async (req, res) => {
  const { user, sha256, date, sourceWords, incorrectWords, pastTime, sourceText, answerText } = req.body;

  try {
    const dbSha = await getSha256ByUsername(user);

    if (dbSha && dbSha.toLowerCase() !== sha256.trim().toLowerCase()) {
      return res.status(403).json({ error: "Invalid SHA256 hash" });
    }

    if (!dbSha) {
      console.log("User not found. Creating new user...");

      await retryQuery(
        `INSERT INTO users (username, sha256, total_attempts, total_words, total_incorrect, total_time, last_attempt, last_source_text, last_answer_text)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?);`,
        [
          user,
          sha256,
          parseInt(sourceWords, 10) || 0,
          parseInt(incorrectWords, 10) || 0,
          parseFloat(pastTime) || 0.0,
          formatDate(date),
          sourceText,
          answerText,
        ],
      );

      console.log("User successfully created.");
    } else {
      console.log("User found, updating data...");

      await retryQuery(
        `UPDATE users SET total_attempts = total_attempts + 1,
        total_words = total_words + ?,
        total_incorrect = total_incorrect + ?,
        total_time = total_time + ?,
        last_attempt = ?,
        last_source_text = ?,
        last_answer_text = ?
        WHERE username = ?;`,
        [
          parseInt(sourceWords, 10) || 0,
          parseInt(incorrectWords, 10) || 0,
          parseFloat(pastTime) || 0.0,
          formatDate(date),
          sourceText,
          answerText,
          user,
        ],
      );

      console.log("User data updated.");
    }

    res.status(200).json({ success: "Data saved" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

proxy.get("*", (req, res) => res.json({ status: 404 }));

proxy.listen(PORT, async () => {
  await init();
  console.debug(`Proxy started on ${URL}:${PORT}`);
});

/* jshint ignore:end */
