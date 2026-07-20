import { Messages } from "../../lib/messages.mjs";
import express from "express";
import axios from "axios";
import open from "open";

const CLIENT_ID = "Ov23lizMN0q7nfcB3BZS";
const AUTH_URL = "https://github.com/login/oauth/authorize";
const PROXY_URL = "https://nodespeed-proxy.onrender.com";

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
      Messages.log("\n");
      Messages.info(`OAuth Listener started on http://127.0.0.1:${AUTH_PORT}`);
      Messages.log("\n");

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
        res.status(400).send("Authorization code missing.");
        server.close();
        return reject(new Error("No code received"));
      }

      try {
        const response = await axios.post(`${PROXY_URL}/oauth/github`, { code });
        const { user } = response.data;

        res.send("<h1>Auth correct! You can close this tab now.</h1>");
        server.close();

        Messages.info("Auth complete!");
        Messages.info("Server closed.");

        resolve(user.login);
      } catch (e) {
        Messages.error("Error during authentication via proxy:", e.response?.data || e.message);
        res.status(500).send("Authentication failed. Check CLI logs.");
        server.close();
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
    Messages.error("Error auth:", e.message);
  }
};

export { getToken };
