import { NET_ID } from '@/constants';
import { $Values } from '@/types/Values';

export type UserSettings = {
  activeNet: $Values<typeof NET_ID>;
  activeAccount: string | null;
};
