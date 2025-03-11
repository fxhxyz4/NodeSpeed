const parseArgs = (Arguments) => {
  let parse = Object.fromEntries(
    Arguments.map((arg) => {
      let [key, value] = arg.split("=");
      return [key.replace(/^--?/, ""), value];
    }),
  );

  return parse;
};

export { parseArgs };
