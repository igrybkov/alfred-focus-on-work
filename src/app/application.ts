import { config } from 'alfy';
import { execSync } from 'child_process';
import * as Conf from 'conf';
// tslint:disable-next-line:no-var-requires
const Fuse = require('fuse.js');
import {FuseOptions} from 'fuse.js';
import { AlfredItem, AlfredItemsSet } from '../alfred';
import { RenderOutput } from '../events';
import { BaseEvent } from '../events/base-event';

type EventListener = (event: any, app: Application) => Promise<void>;

export default class Application {
  public eventListeners: any;

  constructor() {
    this.eventListeners = {};
  }

  public on(
    event: string,
    fn: EventListener,
    priority: number = 100,
  ): Application {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = {};
    }
    if (!this.eventListeners[event][priority]) {
      this.eventListeners[event][priority] = [];
    }
    this.eventListeners[event][priority].push(fn);
    return this;
  }

  public filter(filter: string, items: AlfredItemsSet): AlfredItemsSet {
    const options: FuseOptions<AlfredItem> = {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['match', 'title'],
    };
    const fuse = new Fuse(items, options);
    const result = fuse.search(filter);
    return result;
  }

  public async dispatch(event: BaseEvent): Promise<BaseEvent> {
    const name = event.name;

    // Dispatching the event
    // console.log("Event name: %s", name);

    if (this.eventListeners[name]) {
      for (const priority of Object.keys(this.eventListeners[name]).sort(
        (a, b) => parseInt(a, 10) - parseInt(b, 10),
      )) {
        for (const fn of this.eventListeners[name][priority]) {
          await fn(event, this);
        }
      }
    }

    return event;
  }

  /**
   * Helper function to dispatch RenderOutput event
   */
  public async done(event: BaseEvent | Promise<BaseEvent>): Promise<BaseEvent> {
    event = await event;
    const renderOutputEvent = new RenderOutput(event.output);
    return this.dispatch(renderOutputEvent);
  }

  /**
   * Configuration store
   * @see https://www.npmjs.com/package/conf
   */
  get config(): Conf {
    return config;
  }

  /**
   * Log debug info
   * @returns void
   */
  public log(str: string): void {
    // Todo: doesn't work properly now since Alfy redirects all stderr to stdout
    console.error(str);
  }

  public async hasApp(name: string): Promise<boolean> {
    try {
      execSync(`open -Ra ${name}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}
