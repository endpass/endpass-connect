# Development

## Local process

If you want to make awesome feature to `endpass-connect` you should fork and
clone one of application which uses connect. For example [connect-demo](https://github.com/endpass/connect-demo).

Then, you should link `endpass-connect` repository to cloned application. See example with `yarn` below:

```bash
cd /path/to/endpass-connect
yarn link

cd /path/to/connect-demo
yarn link @endpass/connect
yarn
```

So, now you should runs `dev` script in the connect and `dev` in the application.

All done, you can do all what you want! 🙌

## Commiting

In this project we using semantic commits messages. Messages which not matching
to pattern will be rejected.

## Commands reference

### Development

| Command      | Description                             |
| ------------ | --------------------------------------- |
| `dev`        | Starts library development environment. |
| `test`       | Runs unit tests.                        |
| `unit:watch` | Runs unit tests in watch mode.          |

### Building

| Command         | Description                                     |
| --------------- | ----------------------------------------------- |
| `build`         | Builds library for production.                  |
| `build:lib`     | Builds library in production mode with Rollup.  |
| `build:browser` | Builds library in production mode with Webpack. |
| `build:dev`     | Builds library for development.                 |

### Misc

| Command       | Description                                            |
| ------------- | ------------------------------------------------------ |
| `format`      | Formats code of packages with `eslint` and `prettier`. |
| `commit`      | Use commitizen for commit messages.                    |
| `check-types` |                                                        |

## Publishing

Just run `npm publish` when you are ready to publish new version of package.
Do not use `semantic-release`, it's not correctly working now!
