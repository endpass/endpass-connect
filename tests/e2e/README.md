# E2E testing
When develop e2e test for connect, you can misreading some of the flows and other `magic` happens, when you are trying to make tests working.

### Sub modules
- `connect-demo` - only like a proxy for call methods from `endpass-connect` e2e test and pass payload to `endpass-auth` and wait result, if needed
- `endpass-auth` - is working with serviceWorker for mock xhr/fetch requests 

they both are working in `e2e-connect` mode

### Communication with `e2e-utils`

#### e2e setup and run flow:

1. e2eBridge.awaitClientPaused() - e2e test wait, until `auth` will be paused.

2. auth.awaitClientResume() - `auth` paused own run. In this point `auth` is ready for mocks. Any xhr/fetch request is not send and app is not render.

3. e2e tests mocking requests and other stuff.

4. e2eBridge.resumeClient() - continue run `auth` and start tests.


### Mock Routes flow

```
e2e connect test
||
host (demo)
||
client (auth)
||
serviceWorker
||
client (auth)
||
host (demo)
||
e2e connect test
```
