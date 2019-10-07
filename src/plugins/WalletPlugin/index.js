import PluginFactory from '@/class/PluginFactory';
import ExportPlugin from './WalletPlugin';

export const WalletPlugin = ExportPlugin;

export default PluginFactory.create(ExportPlugin);
