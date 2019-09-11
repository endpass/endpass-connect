import PluginFactory from '@/class/PluginFactory';
import ExportPlugin from './AuthorizePlugin';

export const AuthorizePlugin = ExportPlugin;

export default PluginFactory.create(ExportPlugin);
