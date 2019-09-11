import Network from '@endpass/class/Network';

/** @type {import("@/types/Middleware").Middleware} */
const requestProviderCheck = async ({ action }) => {
  const { activeNet } = action.settings;
  const isNetIdAllowed = Object.values(Network.NET_ID)
    .map(id => String(id))
    .includes(String(activeNet));

  if (isNetIdAllowed) return;

  const message = activeNet ? `id ${activeNet}` : 'Nullable id';

  console.warn(
    `Network with ${message} isn't allowed. Please select another from the settings`,
  );

  action.end();
};

export default requestProviderCheck;
