/* jshint ignore:start */
import { initMatchmaking, onlineCount } from "./modules/matchmaking.js";
import { startPool } from "./modules/db_connect.js";
import { Messages } from "../lib/messages.mjs";
import rateLimit from "express-rate-limit";
import { createServer } from "node:http";
import session from "express-session";
import { Server } from "socket.io";
import express from "express";
import helmet from "helmet";
import axios from "axios";
import cors from "cors";

dotenv.config({ path: "./.env" });

let pool = null;
const { PORT, URL, SESSION_SECRET, SESSION_NAME } = process.env;

const proxy = express();
proxy.use(cors());

const httpServer = createServer(proxy);
const io = new Server(httpServer, { cors: { origin: "*" } });

initMatchmaking(io);

proxy.disable("trust proxy", 1);
proxy.disable("x-powered-by");

proxy.use(helmet());
proxy.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests, please try again later.",
  trustProxy: false,
});

proxy.use(
  session({
    secret: SESSION_SECRET,
    name: SESSION_NAME,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 676e9 },
  }),
);

const init = async () => {
  pool = await startPool();
  Messages.debug("✅ Database pool initialized");
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
        Messages.warn(`DB limit reached, retrying in ${attempt + 1} sec...`);
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

proxy.get("/online", (req, res) => res.json({ online: onlineCount(io) }));

proxy.get("/stats/:username", apiLimiter, async (req, res) => {
  let { username } = req.params;

  username = username.trim();
  if (!username.startsWith("@")) {
    username = `@${username}`;
  }

  try {
    const rows = await retryQuery(
      `SELECT username, total_attempts, total_words, total_incorrect, total_time, last_attempt
       FROM users WHERE TRIM(username) = ?`,
      [username],
    );

    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    const stats = rows[0];
    const accuracy =
      stats.total_words > 0 ? (100 - (stats.total_incorrect / stats.total_words) * 100).toFixed(2) : "0.00";

    res.status(200).json({ ...stats, accuracy: `${accuracy}%` });
  } catch (e) {
    Messages.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

proxy.post("/oauth/github", apiLimiter, async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code parameter is required" });
  }

  try {
    const tokenRes = await axios.post(
      process.env.TOKEN_URL || "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      return res.status(401).json({ error: "Failed to obtain access token", details: tokenRes.data });
    }

    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.status(200).json({
      accessToken,
      user: userRes.data,
    });
  } catch (e) {
    Messages.error("OAuth Exchange Error:", e.response?.data || e.message);
    res.status(500).json({ error: "Authentication failed on proxy" });
  }
});

proxy.post("/post", apiLimiter, async (req, res) => {
  const { user, sha256, date, sourceWords, incorrectWords, pastTime, sourceText, answerText } = req.body;

  try {
    const dbSha = await getSha256ByUsername(user);

    if (dbSha && dbSha.toLowerCase() !== sha256.trim().toLowerCase()) {
      return res.status(403).json({ error: "Invalid SHA256 hash" });
    }

    const safeDate = formatDate(date);
    const safeSourceText = sourceText ?? null;
    const safeAnswerText = answerText ?? null;

    if (!dbSha) {
      Messages.log("User not found. Creating new user...");

      await retryQuery(
        `INSERT INTO users (username, sha256, total_attempts, total_words, total_incorrect, total_time, last_attempt, last_source_text, last_answer_text)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?);`,
        [
          user,
          sha256,
          parseInt(sourceWords, 10) || 0,
          parseInt(incorrectWords, 10) || 0,
          parseFloat(pastTime) || 0.0,
          safeDate,
          safeSourceText,
          safeAnswerText,
        ],
      );

      Messages.log("User successfully created.");
    } else {
      Messages.log("User found, updating data...");

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
          safeDate,
          safeSourceText,
          safeAnswerText,
          user,
        ],
      );

      Messages.log("User data updated.");
    }

    res.status(200).json({ success: "Data saved" });
  } catch (e) {
    Messages.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

proxy.get("*", (req, res) => res.json({ status: 404 }));

const port = process.env.PORT || 3001;
httpServer.listen(port, "0.0.0.0", async () => {
  await init();
  Messages.debug(`Proxy (+ socket.io) started on port ${port}`);
});

/* jshint ignore:end */
