import './login-button.css';
import PluginFactory from '@/class/PluginFactory';
import ExportPlugin from './LoginButtonPlugin';

export const LoginPlugin = ExportPlugin;

export default PluginFactory.create(ExportPlugin);
