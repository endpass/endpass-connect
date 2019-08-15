# E2E testing

During E2E tests developing for `endpass-connect` package, you can met with some
underwater stones and spent a lot of time for solving "normal effects".

Read some information below to prevent potential problems.

## Running tests on local machine

There are some semantic npm-scripts for convenience purposes.

- `yarn test:setup` – initializes all required infrastructure for E2E tests development and
  running.
- `yarn test:e2e` – starts E2E tests in headless mode.
- `yarn test:e2e:open` – starts E2E tests with Cypress gui-app. It is very usefull for tests development.
- `yarn test:e2e:dev` – starts E2E tests with Cypress gui-app and also starts applications from submodules
  in dev mode. It is required if you want change something in applications sources for testing purposes.

## Core concepts

### Git submodules

- `connect-demo` - uses as potentially application with `endpass-connect` under the hood. It makes
  requests to local `endpass-auth` application instance and awaits some results. In E2E testing flow
  it is "payload-sender" to `endpass-connect` library.
- `endpass-auth` - uses as authorizarion application and API-requests bridge. It redefines `xhr/fetch`
  requests from parent window and returns stubbed responses.

They both modules works in `e2e-connect` mode which provide some "workarounds" for better developer
experience.

### Communication with `e2e-utils`

### E2E setup and run flow

Below this paragraph – described E2E tests infrastructure setup process. All steps executes one by one.

**`e2eBridge.awaitClientPaused()`**:

E2E test waits until `auth` application will be paused.

**`auth.awaitClientResume()`**:

Suspends `auth` application. In this point when `auth` application is ready for mocking
remote API request. Before this step completion – neither one `xhr/fetch` requests would
not be sended away. There is you can mock requests and other things which coming from
`auth` application to the client side.

**`e2eBridge.resumeClient()`**:

Resumes `auth` application and continues E2E tests execution.
