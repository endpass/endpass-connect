// @flow
import { NET_ID } from '@/constants';

const middleware: Middleware = (context, item) => {
  const { activeNet } = item.settings;
  const isNetIdAllowed = Object.values(NET_ID).includes(activeNet);

  if (isNetIdAllowed) return;

  const message = activeNet ? `id ${activeNet}` : 'Nullable id';

  console.warn(
    `Network with ${message} isn't allowed. Please select another from the settings`,
  );

  item.end();
};

export default middleware;
