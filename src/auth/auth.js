import { AuthorizationCode } from "simple-oauth2";
import { Messages } from "../../lib/messages.mjs";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import open from "open";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../env/.env") });

const client = new AuthorizationCode({
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://github.com",
    tokenPath: process.env.TOKEN_URL,
    authorizePath: process.env.AUTH_URL,
  },
});

const openUrl = async () => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: "http://127.0.0.1:3005/callback",
    scope: "user",
  });

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
          "https://github.com/login/oauth/access_token",
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

        const userRes = await axios.get("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        res.json({ status: 200, message: "Auth correct, close this tab" });

        server.close();

        Messages.info("Auth complete");
        Messages.info("Server closed");

        resolve(userRes.data.login);
        return userRes.data.login;
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
