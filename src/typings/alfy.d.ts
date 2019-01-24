declare module 'alfy' {
    import CacheConf from 'cache-conf';
import * as Conf from 'conf';

  export const meta: {
    name: string;
    version: string;
    uid: string;
    bundleId: string;
  };
  export const alfred: {
    version: string;
    theme: string;
    themeBackground: string;
    themeSelectionBackground: string;
    themeSubtext: number;
    data: string;
    cache: string;
    preferences: string;
    preferencesLocalHash: string;
  };

  export const input: string | undefined;
  export function output(arr: string): void;

  export function matches<T>(input: string, list: T[], item: any): T[];

  export function inputMatches<T>(list: T[], item: any): T[];

  export function log(str: string): void;
  export function error(str: string): void;
  export const config: Conf;
  export const cache: CacheConf;
  export function log(str: string): void;
  export function fetch(url: string, opts: {}): void;
  export const debug: boolean;

  export namespace icon {
    export function icon(name: string): string;
    export const info: string;
    export const warning: string;
    export const error: string;
    export const alert: string;
    export const like: string;
    // export const delete: string;
  }
}
