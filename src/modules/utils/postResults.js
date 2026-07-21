import { Messages } from "../../../lib/messages.mjs";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../env/.env") });

const postResults = async (JsonMessage) => {
  try {
    const targetUrl = process.env.PROXY_URL || "https://node-speed-proxy.onrender.com";
    const cleanUrl = targetUrl.replace(/\/$/, "");

    console.log(`Sending request to: ${cleanUrl}/post`);
    await axios.post(`${cleanUrl}/post`, JsonMessage);
    Messages.log("✅ Результаты успешно отправлены на сервер!");
    process.exit(0);
  } catch (e) {
    Messages.error("\n[AXIOS CRASH DETAILS]:");
    if (e.response && e.response.data) {
      Messages.error(JSON.stringify(e.response.data, null, 2));
    } else {
      Messages.error(`Error Message: ${e.message}`);
      Messages.error(`Target URL: ${e.config?.url || "undefined"}`);
    }
  }
};

export { postResults };
