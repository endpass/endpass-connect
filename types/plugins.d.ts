/// <reference path="constants.d.ts" />

declare type ContextPlugins = {
  [key in PluginNames[keyof PluginNames]]: () => {}
}