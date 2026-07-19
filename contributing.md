# Contributing to NodeSpeed

Thanks for wanting to help out. This repo is a monorepo with a few independent
projects living side by side — pick the one you're touching and follow its
section below.

## Table of contents

- [Repository layout](#repository-layout)
- [NodeSpeed CLI](#nodespeed-cli)
- [Proxy server](#proxy-server)
- [Database](#database)
- [Website (www)](#website-www)
- [Uptime status page](#uptime-status-page)
- [Code style](#code-style)
- [Commit messages](#commit-messages)
- [Reporting bugs / requesting features](#reporting-bugs--requesting-features)

## Repository layout

| Path       | What it is                                             |
| ---------- | ------------------------------------------------------- |
| `src/`     | The NodeSpeed CLI itself                                 |
| `proxy/`   | Express + Socket.IO server the CLI talks to              |
| `db/`      | MySQL schema (`schema.sql`)                               |
| `www/`     | Static landing page — deployed via GitHub Pages, not Docker |
| `uptime/`  | Vite + React status page                                  |
| `build/`   | Compiled CLI binaries (generated, not committed by hand)  |

Each project has its own `package.json` and is installed/run independently —
there is no root-level `npm install` that sets up everything at once.

## NodeSpeed CLI

### Prerequisites

- Node.js (see `.nvmrc`)
- Wine, if you're building the Windows target from Linux

### Building from source

```sh
git clone https://github.com/fxhxyz4/NodeSpeed.git
cd NodeSpeed
npm i

cd scripts
sudo chmod +x ./build_cli.sh
./build_cli.sh
```

On Linux, `pkg` needs Wine to cross-compile the Windows binary. Install it first:

```sh
cd scripts
sudo chmod +x ./wine.sh
./wine.sh
```

### Environment

```sh
cd src/env
cp .env.example .env
# then fill in your own values
```

### Project structure

```
/NodeSpeed
 ├──/build                # compiled CLI binaries
 ├──/src                  # CLI source
 │   ├──/auth             # GitHub auth server
 │   ├──/config           # runtime config
 │   ├──/data             # data.json — built-in random texts
 │   ├──/env              # dotenv
 │   ├──/modules
 │   │   ├──/cmd          # one file per CLI command
 │   │   └──/utils        # shared helpers
 │   ├── main.js           # entry point
 │   └── package.json
```

### Testing

There's no automated test suite yet — testing means running the relevant
command manually and checking the output. Use the scripts already defined in
`src/package.json`:

```sh
npm run test-h              # -h
npm run test-a              # -a
npm run test-v               # -v
npm run test-contact         # --contact
npm run test-helpCmd         # --helpCmd=<cmd>
npm run test-c               # -c=3
npm run test-l               # -l=ru
npm run test-m               # -m=timed -t=4000
npm run test-t               # -t=100
npm run test-s               # -s=<local file>
npm run test-s2               # -s=<url>
npm run test-stats            # --stats
npm run test-o                 # -o
npm run test-all-normal
npm run test-all-normal-s
npm run test-all-timed
npm run test-all-timed-s
```

If you add a new flag or command, add a matching `test-*` script alongside
the existing ones.

## Proxy server

```sh
cd proxy
npm i
cp .env.example .env   # fill in DB credentials, PORT, URL, session secret

npm run dev              # nodemon, for local development
npm run prod              # production start
```

The proxy also hosts the Socket.IO server used by `nodespeed -o` — if you
change matchmaking behaviour, test it with two CLI instances (or two
terminal tabs) pointed at the same `URL`.

## Database

The schema lives at `db/schema.sql`. Regenerate it after a schema change with:

```sh
mysqldump --no-data -u <user> -p <database> > db/schema.sql
```

## Website (www)

`www/` is a plain static site — no bundler, no build step, and it is **not**
part of the Docker setup. It's deployed straight to GitHub Pages.

Preview it locally by just opening `www/index.html`, or serving the folder
with anything static:

```sh
cd www
npx serve .
```

Deploy:

```sh
cd www
npm i
npm run deploy
```

This pushes the folder to the `gh-pages` branch, published at
`https://fxhxyz4.github.io/nodespeed/`. Make sure **Settings → Pages** on
GitHub is set to deploy from that branch.

If you touch the "racers online" counter or anything else that talks to the
proxy, update the `SERVER_URL` constant at the top of `www/app.js` to point
at your proxy instance (local or deployed) before deploying.

## Uptime status page

`uptime/` is a small Vite + React app.

```sh
cd uptime
npm i

npm run dev          # development server
npm run build        # production build
npm run lint          # eslint
```

## Running everything locally

- **`proxy` + `db` + `uptime`** — via Docker Compose, from the repo root:

```sh
  cp .env.example .env   # fill in DB creds, session secret, ports
  docker compose up -d --build
```

  This starts:
  - `proxy` on `http://localhost:${PROXY_PORT:-3000}` (REST + Socket.IO)
  - `db` (MySQL) on `localhost:${DB_PORT:-3306}`, seeded from `db/schema.sql`
  - `uptime` on `http://localhost:${UPTIME_PORT:-8081}`

- **`www`** is not in `docker-compose.yml` — it's static and lives on
  GitHub Pages. Preview it locally with `npx serve www`, deploy it with
  `npm run deploy` inside `www/` (see [Website (www)](#website-www) above).

- **CLI (`src/`)** talks to whatever `URL` is set in `src/env/.env` — point
  it at your local `proxy` (`http://localhost:3000`) or the deployed one.

## Code style

### Linters

- **jshint** — Node.js code (`src/`, root config in `.jshintrc`)
- **eslint** — shared config across web/Node projects

Run `npm run format` (Prettier) and the relevant linter before opening a PR.
A Husky `pre-commit` hook runs formatting/linting automatically.

### Variables

| Keyword  | Rule                                                          |
| -------- | -------------------------------------------------------------- |
| `var` / globals | Not used.                                                |
| `const`  | `camelCase` or `UPPER_CASE`. Example: `const CONFIG_PATH = "~/some/path.json";` |
| `let`    | `camelCase`, and **always initialized**. Example: `let configPath = "";` |

### Functions

- Only arrow functions (`=>`) — `main()` is the sole exception.
- Declared with `const`, `camelCase` name:
```js
  const someFunc = (ConfigPath) => {};
```
- Function **arguments** use `PascalCase`:
```js
  someFunc(configPath);
  const someFunc = (ConfigPath) => {};
```

### Everything else

- **Modules**: ES6 `import` / `export` only.
```js
  import os from "os";
```
- **Comments**: a JSDoc-style block above every function.
```js
  /*
   * get random color
   *
   * @param {Number} RandomIndex
   * @param {Object} SomeObject
   *
   * @return {String} someString
   */
  const randomColor = (RandomIndex, SomeObject) => {
    return someString;
  };
```
- **Quotes**: double `"` only.
- **Classes**: `PascalCase`.
- **File names**: `camelCase`.
- **Errors**: `try {} catch (e) {}`, reported through `Messages.error(...)`.
- **No `//TODO` comments.** Open a
  [GitHub issue](https://github.com/fxhxyz4/nodespeed/issues/new) with the
  `TODO` label instead.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
(enforced by commitlint + a Husky `commit-msg` hook). Allowed types:

`build` · `chore` · `ci` · `docs` · `feat` · `fix` · `perf` · `refactor` · `revert` · `style` · `test`

Example: `fix(cli): correct multi-row cursor placement in startProgram`

## Reporting bugs / requesting features

Please use [GitHub Issues](https://github.com/fxhxyz4/nodespeed/issues/new)
rather than `//TODO` comments or drive-by fixes for unrelated problems. See
also [`security.md`](./security.md) for reporting vulnerabilities privately,
and [`code_of_conduct.md`](./code_of_conduct.md) for how we expect people to
treat each other here.