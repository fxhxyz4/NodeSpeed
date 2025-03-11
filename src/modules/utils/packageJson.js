import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.resolve(__dirname, "../../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const { name, description, version, keywords, main, author, homepage, bugs, license } = packageJson;

class PackageJSON {
  static NAME = name;
  static DESC = description;

  static VERSION = version;
  static KEYWORDS = keywords;

  static MAIN = main;
  static AUTHOR_NAME = author.name;

  static AUTHOR_EMAIL = author.email;
  static AUTHOR_URL = author.url;

  static HOME_PAGE = homepage;
  static BUGS_URL = bugs;

  static LICENSE = license;
}

export { PackageJSON };
