import { BaseEvent } from './base-event';

export class GetTasks extends BaseEvent {
  public app?: string;

  constructor(appName?: string) {
    super();
    this.app = appName;
  }
}
