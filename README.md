# Endpass Connect

## Table of contents

- [Library](#library)
- [Development](#development)

## Library

Install library via `npm` of `yarn`.

```bash
npm i --save @endpass/connect
yarn add @endpass/connect
```

You don't need any dependencies like `web3`, Endpass Connect includes it out of
the box.

### Usage

Create instance of class and use it in your application. You can know about
options and methods in the [API section](#api).

```js
import EndpassConnect from '@endpass/connect';

const connect = new EndpassConnect({
  appUrl: 'http://connect.url',
});
```

Next, you can try to authentificate user.

```js
const res = await connect.auth();

if (res.status) {
  const account = await connect.getAccountData();

  // Now, you have active account address and network id
} else {
  // Throw error or do something else to investigate user about auth failure
}
```

### API

#### Instance options

| Property    | Type      | Default     | Description                                                                                                                                                                                                                                                             |
| ----------- | --------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appUrl`    | `string`  | `undefined` | Url of Endpass Connect application. Required params.                                                                                                                                                                                                                    |
| `subscribe` | `boolean` | `false`     | If true, automatically subscribes to JSONRPC requests and send then to the Endpass Connect application. Enable it, if your application uses `web3` and works with Etherium network. Potentially, you don't need this option if you using Endpass Connect for auth only. |

#### Instance methods

| Method           | Params                                              | Returns                                                 | Description                                                                                                                                                                                       |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`           |                                                     | `Promise<{ status: boolean, message?: string }>`        | Open Endpass Connect application for user authorization, return promise, which returns object with auth status. See [Errors handling](#errors-handling) for more details.                         |
| `logout`         |                                                     | `Promise<{ status: boolean, message?: string }>`        | Open Endpass Connect application for user logout, return promise, which returns object with auth status. See [Errors handling](#errors-handling) for more details.                                |
| `getAccountData` |                                                     | `Promise<{ activeAccount: string, activeNet: number }>` | Returns authorized user active account.                                                                                                                                                           |
| `injectWeb3`     | `target: Window`                                    |                                                         | Injects `web3` with provider to the target for intercepting requests. Use it if your application works with `web3` and Etherium network. Also, highly recommended use it with `subscribe` option. |
| `sendSettings`   | `selectedAddress: string`, `networkVersion: string` |                                                         | Set user settings to the injected `web3` provider.                                                                                                                                                |

#### Errors handling

The most of Endpass Connect methods throws errors by default, but there are some
exceptions. For example `auth` method, which returns result of authentification
with `status` property and `message`. If `status` if falsy, you can use `message`
proprty to determine reason and handle error with some interface solutions.

## Development

| Command     | Description                                            |
| ----------- | ------------------------------------------------------ |
| `build`     | Builds application and library.                        |
| `dev:app`   | Starts application dev server.                         |
| `build:app` | Builds application.                                    |
| `dev:lib`   | Starts library development environment.                |
| `build:lib` | Builds library.                                        |
| `test:unit` | Runs unit tests.                                       |
| `format`    | Formats code of packages with `eslint` and `prettier`. |
