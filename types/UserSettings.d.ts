import Network from '@endpass/class/Network';
import { $Values } from 'utility-types';

export declare type UserSettings = {
  activeNet: $Values<Network.NET_ID>;
  activeAccount: string | null;
};
