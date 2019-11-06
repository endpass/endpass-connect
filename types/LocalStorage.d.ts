declare module '@endpass/class/LocalStorage' {
  function remove(key: string): void;
  function save(key: string, data: any): void;
  function load(key: string): any;
}
