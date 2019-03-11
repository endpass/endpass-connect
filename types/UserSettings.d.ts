import { NET_ID } from '@/constants';
import { $Values } from 'utility-types';

export declare type UserSettings = {
  activeNet: $Values<typeof NET_ID>;
  activeAccount: string | null;
};
