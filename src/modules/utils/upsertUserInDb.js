import { Messages } from "../../../lib/messages.mjs";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../env/.env") });

const upsertUserInDb = async (UserName, Sha256) => {
  const targetUrl = process.env.PROXY_URL || "https://node-speed-proxy.onrender.com";
  const cleanUrl = targetUrl.replace(/\/$/, "");

  try {
    await axios.post(`${cleanUrl}/auth/upsert`, { UserName, Sha256 });
  } catch (e) {
    Messages.error("\n[AUTH UPSERT CRASH]:");
    if (e.response && e.response.data) {
      Messages.error(JSON.stringify(e.response.data, null, 2));
    } else {
      Messages.error(`Error Message: ${e.message}`);
    }
    throw e;
  }
};

export { upsertUserInDb };
