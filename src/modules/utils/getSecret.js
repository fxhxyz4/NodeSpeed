import readline from "readline";

const getSecret = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Type secret pass: ", (pass) => {
      rl.close();
      resolve(pass);
    });
  });
};

const processPass = async () => {
  const secret = await getSecret();
  return secret;
};

export { processPass, getSecret };
