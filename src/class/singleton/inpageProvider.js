import { EventEmitter } from '@endpass/class';
import { InpageProvider } from '@/class';

const emmiter = new EventEmitter();

export default new InpageProvider(emmiter);
