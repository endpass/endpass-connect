// @ts-check

/** @type {import("@/types/Middleware").Middleware} */
export default async function(context, action) {
  const { settings } = action;

  if (!settings.activeAccount) {
    // eslint-disable-next-line no-param-reassign
    action.settings = context.getInpageProviderSettings();
  }
}
