// @ts-check

/** @type {import("@/types/Middleware").Middleware} */
export default async function({ action, providerPlugin }) {
  const { settings } = action;

  if (!settings.activeAccount) {
    // eslint-disable-next-line no-param-reassign
    action.settings = providerPlugin.getInpageProviderSettings();
  }
}
