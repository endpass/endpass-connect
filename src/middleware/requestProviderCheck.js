import { NET_ID } from '@/constants';

/** @type {import("@/types/Middleware").Middleware} */
const middleware = (context, action) => {
  const { activeNet } = action.settings;
  const isNetIdAllowed = Object.values(NET_ID)
    .map(id => String(id))
    .includes(String(activeNet));

  if (isNetIdAllowed) return;

  const message = activeNet ? `id ${activeNet}` : 'Nullable id';

  console.warn(
    `Network with ${message} isn't allowed. Please select another from the settings`,
  );

  action.end();
};

export default middleware;
