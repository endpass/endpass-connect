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
import Web3 from 'web3';
import EndpassConnect from '@endpass/connect';

const web3 = new Web3('https://network.url');
const connect = new EndpassConnect({
  appUrl: 'http://connect.url',
});
const provider = connect.createProvider(web3);

web3.setProvider(provider);
```

Next, you can try to authentificate user.

```js
try {
  const res = await connect.auth();

  // Now, you have active account address and network id
} catch (err) {
  // Something goes wrong! User is not authorized
}
```

#### Provider creating

If you want to use this library and process `web3` requests through `endpass` services you should complete these conditions.

Install `web3` library if you want to use it manually in you application. Create instance of `web3` and create provider based on it:

```js
import Web3 from 'web3';
import Connect from '@endpass/connect';

const web3 = new Web3('https://network.url');
const connect = new Connect();
const provider = connect.createProvider(web3);

// If you are using old versions of web3 (0.30.0-beta and below) you should call
// setProvider
web3.setProvider(provider);

// If you are using new versions of web3 (1.0.0 and more) you can reassign
// global property ethereum in application window object
window.ethereum = provider;

// We highly recommend to use both methods for more stability and compatibility
window.ethereum = provider;
web3.setProvider(provider);
```

If `web3` can be found in application window object you can not install `web3`
manually, `createProvider` also should try to find it.

### API

#### Instance options

| Property  | Type     | Default                    | Description                         |
| --------- | -------- | -------------------------- | ----------------------------------- |
| `authUrl` | `string` | `https://auth.endpass.com` | Url of Endpass Connect application. |

#### Instance methods

| Method           | Params                                              | Returns                                                 | Description                                                                                                                                                               |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`           |                                                     | `Promise<{ status: boolean, message?: string }>`        | Open Endpass Connect application for user authorization, return promise, which returns object with auth status. See [Errors handling](#errors-handling) for more details. |
| `logout`         |                                                     | `Promise<{ status: boolean, message?: string }>`        | Open Endpass Connect application for user logout, return promise, which returns object with auth status. See [Errors handling](#errors-handling) for more details.        |
| `getAccountData` |                                                     | `Promise<{ activeAccount: string, activeNet: number }>` | Returns authorized user active account.                                                                                                                                   |
| `createProvider` | `web3: Web3`                                        | `Web3Provider`                                          | Creates Web3 provider for injection in Web3 instance. If web3 is not given in arguments – it will be looked in the window object                                          |
| `sendSettings`   | `selectedAddress: string`, `networkVersion: string` |                                                         | Set user settings to the injected `web3` provider.                                                                                                                        |

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
