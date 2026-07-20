import { AuthorizationCode } from "simple-oauth2";
import { Messages } from "../../lib/messages.mjs";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import open from "open";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.resolve(__dirname, "../env/.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(process.cwd(), "src/env/.env"),
  path.resolve(process.cwd(), ".env"),
];

const foundPath = envPaths.find((p) => fs.existsSync(p));
if (foundPath) {
  dotenv.config({ path: foundPath });
}

const CLIENT_ID = process.env.CLIENT_ID || "Ov23lizMN0q7nfcB3BZS";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "3e07d7df4fac4b4c63069afeb53aa2a63271ef5a";
const AUTH_URL = process.env.AUTH_URL || "https://github.com/login/oauth/authorize";
const TOKEN_URL = process.env.TOKEN_URL || "https://github.com/login/oauth/access_token";

const client = new AuthorizationCode({
  client: {
    id: CLIENT_ID,
    secret: CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://github.com",
    tokenPath: TOKEN_URL,
    authorizePath: AUTH_URL,
  },
});

const openUrl = async () => {
  const redirectUri = encodeURIComponent("http://127.0.0.1:3005/callback");
  const authorizationUri = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user`;

  await open(authorizationUri);
};

const startServer = async () => {
  return new Promise((resolve, reject) => {
    const app = express();
    const AUTH_PORT = 3005;

    const server = app.listen(AUTH_PORT, "127.0.0.1", async () => {
      Messages.log("\n\n");
      Messages.info(`OAuth Server started on http://127.0.0.1:${AUTH_PORT}`);
      Messages.log("\n\n");

      await openUrl();
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        Messages.error(`Port ${AUTH_PORT} is already in use.`);
      } else {
        Messages.error("Server startup error:", err.message);
      }
      reject(err);
    });

    app.get("/callback", async (req, res) => {
      const code = req.query.code;

      if (!code) {
        return res.json({ status: 500 });
      }

      try {
        const tokenRes = await axios.post(
          TOKEN_URL,
          {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
          },
          {
            headers: { Accept: "application/json" },
          },
        );

        const accessToken = tokenRes.data.access_token;

        const userRes = await axios.get("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        res.json({ status: 200, message: "Auth correct, close this tab" });

        server.close();

        Messages.info("Auth complete");
        Messages.info("Server closed");

        resolve(userRes.data.login);
      } catch (e) {
        Messages.error("Error auth:", e.message);

        res.json({ status: e.message });
        reject(e);
      }
    });
  });
};

const getToken = async () => {
  try {
    const user = await startServer();
    return user;
  } catch (e) {
    Messages.error("Error auth:", e);
  }
};

export { getToken };
