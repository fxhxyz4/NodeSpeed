# Contribution rules

# _NodeSpeed cli:_

### how to build:

```sh
for linux users:

cd scripts && sudo chmod +x ./wine.sh && ./wine.sh
```

```sh
git clone https://github.com/fxhxyz4/NodeSpeed.git && cd NodeSpeed && npm i &&
cd scripts && sudo chmod +x ./build_cli.sh && ./build_cli.sh
```

```sh
rename .env.example to .env & type your info
```

#

### code structure:
```
/NodeSpeed
 ├──/build                # nodespeed cli build
 ├──/src                  # source folder
     ├──/config           # nodespeed cli config
     ├──/data             # data.json with random text
     ├──/modules          # main program modules
         ├──/cmd          # commands
         ├── /utils       # utils functions
     ├── main.js          # main file
     └── package.json     # package.json
```

#

### how to test:
```
use this commands from package.json file from test:

npm run test-h
npm run test-a
npm run test-v
npm run test-contact
npm run test-helpCmd
npm run test-c
npm run test-l
npm run test-m
npm run test-t
npm run test-s
npm run test-s2
npm run test-stats
npm run test-o
npm run test-all-normal
npm run test-all-normal-s
npm run test-all-timed
npm run test-all-timed-s
```

#

### code style:
```
using prettier & editorconfig
```

#

### variables rules:

+ __var & global__
    + _not used!_

+ __const__
    + _camelCase or UPPER_CASE notation_
    + _Example:_
    ```js
        const CONFIG_PATH = "~/some/path.json";
    ```

+ __let__
    + _camelCase notation_
    + _all let variables are initialized!_
    + _Example_:
    ```js
        let configPath = "";
    ```

#

### function rules:
+ __NodeSpeed cli uses only arrow => functions__
    + _Example_:
    ```js
        const someFunc = (ConfigPath) => {};
    ```
+ __functions announced through const only with camelsCase notation__
    + _function main exception!_
    + _Example_:
    ```js
        const camelCase = (ConfigPath) => {};
    ```
+ __function arguments with PascalCase notation__
    + _Example_:
    ```js
        someFunc(configPath);
        const someFunc = (ConfigPath) => {};
    ```

#

### Other:
+  __ES6 import/export version__
    + _Example_:
    ```js
        import os from "os";
    ```
+ __Comments are written before each function__
    + _Example_:
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

+ __Quotes__: _only double "" quotes_

+ __Classes__: _only PascalCase format_

+ __File naming__: _only pascalCase format (this also applies to classes)_

+ __Errors__
    + _try catch(e)_
    + _Messages.error(``)_

+ __not use //TODO and something in code__
    +  __use https://github.com/fxhxyz4/nodespeed/issues/new with TODO label!__
 
# _Proxy server:_
+ __installation__
    ```sh
        npm i
    ```

+ __env__
    ```sh
        rename .env.example to .env & type your info
    ```

+ __dev with nodemon__
    ```sh
        npm run dev
    ```

+ __deploy__
    ```sh
        npm run prod
    ```

# _DB server:_
+ __use mysqldump ~> ./db/schema.sql__
