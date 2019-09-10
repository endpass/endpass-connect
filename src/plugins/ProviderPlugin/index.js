import PluginFactory from '@/class/PluginFactory';
import ExportPlugin from './ProviderPlugin';

export const ProviderPlugin = ExportPlugin;

export default PluginFactory.create(ExportPlugin);
