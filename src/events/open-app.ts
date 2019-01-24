import { BaseEvent } from './base-event';

export class OpenApp extends BaseEvent {
  public appName: string;
  public action: string;

  constructor(appName: string, action: string) {
    super();
    this.appName = appName;
    this.action = action;
  }
}
