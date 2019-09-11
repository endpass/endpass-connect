import PluginFactory from '@/class/PluginFactory';
import ExportPlugin from './WidgetPlugin';

export const WidgetPlugin = ExportPlugin;

export default PluginFactory.create(ExportPlugin);
