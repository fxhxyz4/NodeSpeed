import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: `./env/.env` });
dotenv.config({ path: `./env/.env.dev` });

const postResults = async (JsonMessage) => {
  try {
    await axios.post(`${process.env.URL}:${process.env.PORT}/post`, JsonMessage);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

export { postResults };
