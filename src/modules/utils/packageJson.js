import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url); // jshint ignore:line
const __dirname = path.dirname(__filename); // jshint ignore:line

const packageJsonPath = path.resolve(__dirname, "../../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

const { name, description, version, keywords, main, author, homepage, bugs, license } = packageJson;

class PackageJSON {
  static get NAME() {
    return name;
  }

  static get DESC() {
    return description;
  }

  static get VERSION() {
    return version;
  }

  static get KEYWORDS() {
    return keywords;
  }

  static get MAIN() {
    return main;
  }

  static get AUTHOR_NAME() {
    return author.name;
  }

  static get AUTHOR_EMAIL() {
    return author.email;
  }

  static get AUTHOR_URL() {
    return author.url;
  }

  static get HOME_PAGE() {
    return homepage;
  }

  static get BUGS_URL() {
    return bugs;
  }

  static get LICENSE() {
    return license;
  }
}

export { PackageJSON };
