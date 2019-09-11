import PluginFactory from '@/class/PluginFactory';
import ExportPlugin from './OauthPlugin';

export const OauthPlugin = ExportPlugin;

export default PluginFactory.create(ExportPlugin);
