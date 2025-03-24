import { Messages } from "../../../lib/messages.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: "./env/.env" });

const postResults = async (JsonMessage) => {
  try {
    await axios.post(`${process.env.URL}/post`, JsonMessage);
    process.exit(0);
  } catch (e) {
    if (e.response && e.response.data) {
      Messages.error(`${JSON.stringify(e.response.data, null, 2)}`);
    } else {
      Messages.error("Something went wrong:", e.message);
    }

    process.exit(1);
  }
};

export { postResults };
