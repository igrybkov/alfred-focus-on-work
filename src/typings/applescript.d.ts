declare module 'applescript' {
  // Execute a String as AppleScript.
  /* tslint:disable:ban-types */
  export function execString(str: string, callback: Function): void;
  // Execute a *.applescript file.
  export function execFile(file: string, callback: Function): void;
  // Execute a *.applescript file.
  export function execFile(file: string, args: [], callback: Function): void;
  // Path to 'osascript'. By default search PATH.
  export let osascript: string;
  // export namespace applescript;
}
