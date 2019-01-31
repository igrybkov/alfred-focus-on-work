import Application from './application';
import { Registrator } from './registrator';

export { Application };
export { Registrator };

// tslint:disable-next-line:no-var-requires
const alfredNotifier = require('alfred-notifier');

// Checks for available update and updates the `info.plist`
alfredNotifier();

/**
 * Looking for a non-empty value in array of passed values and returns first.
 * Throws an error if cannot find a value.
 *
 * Mostly used to find a value among environment variables and command arguments
 *
 * @param {string} errMsg
 * @param  {...any} values
 * @throws {Error} when cannot find valid value
 * @returns {any}
 */
export function requireArgument(errMsg: string, ...values: any): any {
  for (const value of values) {
    if (value) {
      return value;
    }
  }
  throw new Error(errMsg);
}

const app = new Application();

export { app as App };
