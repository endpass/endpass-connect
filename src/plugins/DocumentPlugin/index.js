import PluginFactory from '@/class/PluginFactory';
import ExportPlugin from './DocumentPlugin';

export const DocumentPlugin = ExportPlugin;

export default PluginFactory.create(ExportPlugin);
