import { Messages } from "./messages.js";
import axios from "axios";

const promiseFetcher = async (Url) => {
  if (!Url) {
    Messages.error(`Url: ${Url} invalid`);
  }

  const response = await axios.get(Url);
  const result = response.data;

  return result;
};

export { promiseFetcher };
