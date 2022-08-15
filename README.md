# eslint-plugin-named-functions

Enforces the presence of function names based on complexity

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-named-functions`:

```sh
npm install eslint-plugin-named-functions --save-dev
```

## Usage

Add `named-functions` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "named-functions"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "named-functions/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here


