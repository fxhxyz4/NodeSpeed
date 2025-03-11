import entry from "./entry.js";
import path from "path";

const { cliPathInput, cliPathOutput } = entry;

const cli = {
  target: "node",
  entry: cliPathInput,
  output: {
    filename: cliPathOutput,
    path: path.resolve("./"),
  },
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};

export default [cli];
