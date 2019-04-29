# Endpass Connect

> Compatible with web3.js@0.37.0beta and below

## Table of contents

- [Library](#library)
- [Usage](#usage)
- [API](#api)
- [Interactions with current account](#interactions)
- [Widget](#widget)
- [Development](#development)

## Library

Install library via `npm` of `yarn`.

```bash
npm i --save @endpass/connect
yarn add @endpass/connect
```

You don't need any dependencies like `web3`, Endpass Connect includes it out of
the box.

See example in [Demo repository](https://github.com/endpass/connect-demo)

### Usage

Create instance of class and use it in your application. You can know about
options and methods in the [API section](#api).

```js
import Web3 from 'web3';
import EndpassConnect from '@endpass/connect';

const web3 = new Web3('https://network.url');
const connect = new EndpassConnect();
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
import { HttpProvider } from 'web3-providers';
import Connect from '@endpass/connect';

const web3 = new Web3('https://network.url');
const connect = new Connect();
const provider = connect.getProvider();

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

### API

#### Instance methods

| Method                | Params                                         | Returns                                                                             | Description                                                                                                                                                               |
| --------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`                |                                                | `Promise<{ status: boolean, message?: string }>`                                    | Open Endpass Connect application for user authorization, return promise, which returns object with auth status. See [Errors handling](#errors-handling) for more details. |
| `logout`              |                                                | `Promise<Boolean>`                                                                  | Makes logout request and returns status or throw error                                                                                                                    |
| `getAccountData`      |                                                | `Promise<{ activeAccount: string, activeNet: number }>`                             | Returns authorized user active account.                                                                                                                                   |
| `getProvider`         | `provider: Web3.Provider`                      | `Web3Provider`                                                                      | Creates Web3 provider for injection in Web3 instance.                                                                                                                     |
| `setProviderSettings` | `{ activeAccount: string, activeNet: number }` |                                                                                     | Set user settings to the injected `web3` provider.                                                                                                                        |
| `openAccount`         |                                                | `Promise<{ type: string, payload?: { activeAccount: string, activeNet: number } }>` | Open Endpass Connect application for change user active address, network or logout                                                                                        |
| `mountWidget`         | `{ position: string }`                         |                                                                                     | Mounts Endpass widget on given position                                                                                                                                   |
| `unmountWidget`       |                                                |                                                                                     | Removes mounted Endpass widget                                                                                                                                            |

### Interactions with current account

If you use `openAccount` method connect application will open screen with user base settings: current account and network.
You also can makes logout here. This method will return object with type field. This field determines response type. There is
two types of response:

- `logout` – means user makes logout from his account.
- `update` – means user update account settings. Response also contains `payload` field with updated settings object.

At the same time `update` will set new account settings to injected provider. After this, you can refresh browser page
or something else.

Examples:

```js
import Connect from '@endpass/connect';

const connect = new Connect();

connect.openAccount().then(res => {
  if (res.type === 'logout') {
    // User have logout here
  } else if (res.type === 'update') {
    // Account settings was updated by user
    console.log(res.settings); // { activeAccount: "0x0", activeNet: 1 }
  }
});
```

### Widget

From `0.18.0-beta` version, `@endpass/connect` provides ability to use widget for management accounts, you can also see current account's balance in ether and makes logout.

So, you want to use widget in your dApp. There are two ways to mount it:

1. Widget will automatically mounts on user authorization if you provide `widget` object to connect instance constructor ([see widget configuration](#widget-configuration)).

2. You can mount widget programically with `mountWidget` method and passing parameter.

Example:

```js
import Connect from '@endpass/connect';

const connect = new Connect({
  widget: {
    position: {
      top: '15px',
      left: '15px',
    },
  },
});
```

Code above will mount widget when user will be authorized.

---

```js
import Connect from '@endpass/connect';

const connect = new Connect();

connect.mountWidget({
  position: {
    top: '15px',
    left: '15px',
  },
});
```

Code above will mount widget only on `mountWidget` method call.

#### Widget configuration

As you can see, widget accepts only one parameter – `position`. It takes only
position properties: `top`, `left`, `bottom`, `right`.

To prevent widget auto-mounting pass `false` to widget params option.

```js
import Connect from '@endpass/connect';

const connect = new Connect({
  widget: false,
});

// Widget will not mount
```

#### Widget events

You can also make subscribtion on widget events, like `load`, `open`, `close` etc.

Widget uses HTML Custom Events API and has static `id` and `data-endpass` attributes.

For example, you want to print something in console when widget will be opened:

```js
import Connect from '@endpass/connect';

const connect = new Connect();

const widget = document.getElementById('endpass-widget'); // or document.querySelector('[data-endpass=widget-frame]')

widget.addEventListener('open', () => {
  console.log('Widget opened!');
});
```

**Don't forget – widget DOM-node available only when widget mounted!**

There are available widget events type which you can use in subscribtions:

- `mount` – fires after widget full loading
- `destroy` – fires before widget unmounting
- `open` – fires after widget open
- `close` – fires after widget close
- `logout` – fires after logout through widget interaction

## Development

| Command     | Description                                            |
| ----------- | ------------------------------------------------------ |
| `dev`       | Starts library development environment.                |
| `build:dev` | Builds library for development.                        |
| `build`     | Builds library for production.                         |
| `build:lib` | Builds library.                                        |
| `test`      | Runs unit tests.                                       |
| `format`    | Formats code of packages with `eslint` and `prettier`. |
| `commit`    | Use commitizen for commit messages.                    |
