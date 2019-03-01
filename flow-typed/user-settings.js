// @flow

import { NET_ID } from '@/constants';

declare type UserSettings = {|
  activeNet: $Values<typeof NET_ID>,
  activeAccount: string | null,
|};
