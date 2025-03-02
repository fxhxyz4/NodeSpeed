# Contribution rules

# _NodeSpeed cli:_

### how to build:

```sh
git clone https://github.com/fxhxyz4/NodeSpeed.git && cd NodeSpeed/scripts &&
sudo chmod +x ./build_cli.sh && ./build_cli.sh
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

+ __Errors__
    + _try catch(e)_
    + _Messages.error(``)_

+ __not use //TODO and something in code__
    +  __use https://github.com/fxhxyz4/nodespeed/issues/new with TODO label!__
