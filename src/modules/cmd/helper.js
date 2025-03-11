const helper = () => {
  return {
    help: {
      call: ["h", "help"],
      arg: undefined,
      desc: "Basic help command",
      example: "-h",
    },
    helpCmd: {
      call: [undefined, "helpCmd"],
      arg: "<command name>",
      desc: "Display command info",
      example: "--helpCmd=lang",
    },
    about: {
      call: ["a", "about"],
      arg: undefined,
      desc: "Display about the NodeSpeed description",
      example: "-a",
    },
    version: {
      call: ["v", "version"],
      arg: undefined,
      desc: "Display current version of NodeSpeed",
      example: "-v",
    },
    contact: {
      call: [undefined, "contact"],
      arg: undefined,
      desc: "Show contact credentials",
      example: "--contact",
    },
    complexity: {
      call: ["c", "complexity"],
      arg: "<level>",
      default: "level 2",
      desc: "Type level of type speed complexity: 1, 2 or 3",
      example: "-c=2",
    },
    lang: {
      call: ["l", "lang"],
      arg: "<language>",
      default: "en",
      desc: "Select language: en, ua, ru",
      example: "-l=en",
    },
    mode: {
      call: ["m", "mode"],
      arg: "<mode>",
      default: "normal",
      desc: "Select typing mode: normal, timed",
      example: "-m=normal",
    },
    time: {
      call: ["t", "time"],
      arg: "<seconds>",
      default: 300,
      desc: "Set time limit for timed mode",
      example: "-t=100",
    },
    source: {
      call: ["s", "source"],
      arg: "<file|url|random>",
      default: "random",
      desc: "Select text source",
      example: "-s=./file.txt",
    },
    stats: {
      call: [undefined, "stats"],
      arg: undefined,
      desc: "Show detailed typing stats",
      example: "--stats",
    },
    online: {
      call: ["o", "online"],
      arg: undefined,
      desc: "Find an online opponent",
      example: "-o",
    },
  };
};

export { helper };
