import PluginFactory from '@/class/PluginFactory';
import ExportPlugin from './BridgePlugin';

export const BridgePlugin = ExportPlugin;

export default PluginFactory.create(ExportPlugin);
