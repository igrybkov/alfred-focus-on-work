declare module 'cache-conf' {
  export default class CacheConf<T = any> implements Iterable<[string, T]> {
    public store: { [key: string]: T };
    public readonly path: string;
    public readonly size: number;

    constructor(options?: CacheConf.Options<T>);
    public get(key: string, defaultValue?: T): T;
    public set(key: string, val: T): void;
    public set(object: { [key: string]: T }): void;
    public has(key: string): boolean;
    public delete(key: string): void;
    public clear(): void;
    public onDidChange(
      key: string,
      callback: (oldVal: T | undefined, newVal: T | undefined) => void,
    ): void;
    public [Symbol.iterator](): Iterator<[string, T]>;
    public isExpired(key: string): boolean;
  }

  export namespace CacheConf {
    interface Options<T> {
      defaults?: { [key: string]: T };
      configName?: string;
      projectName?: string;
      cwd?: string;
      encryptionKey?: string | Buffer | NodeJS.TypedArray | DataView;
      fileExtension?: string;
    }
  }
}
