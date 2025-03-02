import packageJson from "../../package.json" assert { type: "json" };

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