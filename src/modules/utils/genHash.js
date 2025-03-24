import crypto from "crypto";

const generateSha256Hash = (Data, Secret) => {
  return crypto
    .createHash("sha256")
    .update(Data + Secret)
    .digest("hex");
};

export { generateSha256Hash };
