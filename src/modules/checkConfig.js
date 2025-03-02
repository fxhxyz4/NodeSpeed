import text from "../data/data.json" assert { type: "json" };
import { checkSource } from "./checkSource.js";
import { Messages } from "./utils/messages.js";
import { config } from "../config/config.js";

const checkConfig = async () => {
    const { c, l, m, t, s } = config;

    if (s === "random") {
        const textData = text.text[l];

        if (!textData) {
            Messages.error(`Language: ${l} not found`);
            return;
        }

        const levelData = textData[c];

        if (!levelData) {
            Messages.error(`Level: ${c} not found for language ${l}`);
            return;
        }

        const randomIndex = Math.floor(Math.random() * levelData.length);
        const randomText = levelData[randomIndex];

        return [
            randomText,
            m,
            t
        ];
    }

    const resultText = await checkSource(s);
    return resultText;
}

export { checkConfig };
