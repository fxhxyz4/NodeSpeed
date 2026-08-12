import packageJson from "../../../package.json";

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
