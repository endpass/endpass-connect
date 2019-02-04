import { EventEmitter, InpageProvider } from '@endpass/class';

const emmiter = new EventEmitter();

export default new InpageProvider(emmiter);
