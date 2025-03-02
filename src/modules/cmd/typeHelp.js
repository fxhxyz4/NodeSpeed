import { Messages } from "../utils/messages.js";
import { helper } from "./helper.js";

let help = helper();

const typeHelp = (Key, Command) => {
    if (!help || typeof help !== "object") {
        Messages.log("\n");
        Messages.error(`Help object is incorrect`);

        return;
    }

    Messages.log("=========================== Help ===========================");

    if (Key === "helpCmd") {
        let foundCmd = findCommand(Command);

        if (foundCmd) {
            render(Command, foundCmd);

            Messages.log("\n");

            Messages.log("=========================== Help ===========================");
            Messages.log("\n");

            process.exit(0);
        } else {
            Messages.log("\n");
            Messages.error(`Command '${Command}' not found.`);
        }
    } else {
        renderAllCommands();
    }

    Messages.log("\n");
    Messages.log("=========================== Help ===========================");

    Messages.log("\n");
    process.exit(0);
};

const findCommand = (Cmd) => {
    for (let key in help) {
        if (help[key].call.includes(Cmd)) {
            return help[key];
        }
    }

    return false;
};

const renderAllCommands = () => {
    for (let key in help) {
        render(key, help[key]);
    }
};

const render = (Key, Cmd) => {
    let callString = Cmd.call.filter(Boolean).join(", ") || "None";

    Messages.log("\n");

    Messages.log(`---- Command: ${Key}`);
    Messages.log(`------- Call: ${callString}`);

    Messages.log(`--- Argument: ${Cmd.arg || "None"}`);
    Messages.log(`---- Default: ${Cmd.default || "None"}`);

    Messages.log(`Description: ${Cmd.desc}`);
    Messages.log(`---- Example: ${Cmd.example}`);
};

export { typeHelp };
