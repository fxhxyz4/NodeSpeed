import { Messages } from "../../../lib/messages.mjs";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: "./env/.env" });

const postResults = async (JsonMessage) => {
  try {
    if (!process.env.URL && !process.env.PORT) {
      throw new Error("process.env.URL or process.env.PORT is undefined. Check your .env path!");
    }

    await axios.post(`${process.env.URL}:3001/post`, JsonMessage);
    process.exit(0);
  } catch (e) {
    Messages.error("\n[AXIOS CRASH DETAILS]:");
    if (e.response && e.response.data) {
      Messages.error(JSON.stringify(e.response.data, null, 2));
    } else {
      Messages.error(`Error Message: ${e.message}`);
      Messages.error(`Target URL: ${process.env.URL}:3001/post`);
    }
  }
};

export { postResults };
