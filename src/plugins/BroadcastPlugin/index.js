import PluginFactory from '@/class/PluginFactory';
import ExportPlugin from './BroadcastPlugin';

export const BroadcastPlugin = ExportPlugin;

export default PluginFactory.create(ExportPlugin);
