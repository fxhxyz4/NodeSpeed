import { Messages } from "../../lib/messages.mjs";
import express from "express";
import axios from "axios";
import open from "open";

const CLIENT_ID = "Ov23lizMN0q7nfcB3BZS";
const AUTH_URL = "https://github.com/login/oauth/authorize";
const PROXY_URL = process.env.PROXY_URL || "https://node-speed-proxy.onrender.com";
const AUTH_PORT = 3005;
const TIMEOUT_MS = 120000;

const openUrl = async () => {
  const redirectUri = encodeURIComponent(`http://127.0.0.1:${AUTH_PORT}/callback`);
  const authorizationUri = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=user`;

  await open(authorizationUri);
};

const startServer = async () => {
  return new Promise((resolve, reject) => {
    const app = express();

    const authTimeout = setTimeout(() => {
      server.close();
      Messages.error("Authentication timed out.");
      reject(new Error("Authentication timed out. Please try again."));
    }, TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(authTimeout);
      server.close();
    };

    const server = app.listen(AUTH_PORT, "127.0.0.1", async () => {
      Messages.log("\n");
      Messages.info(`OAuth Listener started on http://127.0.0.1:${AUTH_PORT}`);
      Messages.log("\n");

      await openUrl();
    });

    server.on("error", (err) => {
      clearTimeout(authTimeout);
      if (err.code === "EADDRINUSE") {
        Messages.error(`Port ${AUTH_PORT} is already in use.`);
      } else {
        Messages.error("Server startup error:", err.message);
      }
      reject(err);
    });

    app.get("/callback", async (req, res) => {
      const { code, error, error_description } = req.query;

      if (error) {
        const errorMsg = error_description || error;
        res.status(400).send(`<h1>Authentication failed</h1><p>${errorMsg}</p>`);
        cleanup();
        reject(new Error(`OAuth Error: ${errorMsg}`));
        return;
      }

      if (!code) {
        res.status(400).send("<h1>Bad Request</h1><p>Authorization code missing.</p>");
        cleanup();
        reject(new Error("No code received"));
        return;
      }

      try {
        const response = await axios.post(`${PROXY_URL}/oauth/github`, { code });
        const { user } = response.data;

        res.send("<h1>Auth correct! You can close this tab now.</h1>");
        cleanup();

        Messages.info("Auth complete!");
        Messages.info("Server closed.");

        resolve(user.login);
      } catch (e) {
        const proxyError = e.response?.data ? JSON.stringify(e.response.data, null, 2) : e.message;

        Messages.error("Error details from Proxy:", proxyError);

        res.status(500).send(`
    <h1>Authentication failed</h1>
    <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${proxyError}</pre>
  `);

        cleanup();
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
