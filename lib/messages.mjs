/* jshint ignore:start */
class Messages {
  static #logType(Type, Msg) {
    if (Type && Msg) {
      switch (Type) {
        case "log":
          console[Type](`\x1b[37m${Msg}`);
          break;
        case "error":
          console[Type](`\x1b[37m[\x1b[31mERROR\x1b[37m] ${Msg}`);
          break;
        case "warn":
          console[Type](`\x1b[37m[\x1b[33mWARN\x1b[37m] ${Msg}`);
          break;
        case "info":
          console[Type](`\x1b[37m[\x1b[34mINFO\x1b[37m] ${Msg}`);
          break;
        case "debug":
          console[Type](`\x1b[37m[\x1b[32mDEBUG\x1b[37m] ${Msg}`);
          break;
        case "clr":
          console.clear();
          break;
      }
    } else {
      console.error(`Error while displaying`);
    }
  }

  static log = (Msg) => this.#logType("log", Msg);
  static error = (Msg) => this.#logType("error", Msg);

  static warn = (Msg) => this.#logType("warn", Msg);
  static info = (Msg) => this.#logType("info", Msg);

  static debug = (Msg) => this.#logType("debug", Msg);
  static clr = () => this.#logType("clr", "clear");
}

export { Messages };
/* jshint ignore:end */
