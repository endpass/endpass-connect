import PluginFactory from '@/class/PluginFactory';
import ExportPlugin from './MessengerGroupPlugin';

export const MessengerGroupPlugin = ExportPlugin;

export default PluginFactory.create(ExportPlugin);
