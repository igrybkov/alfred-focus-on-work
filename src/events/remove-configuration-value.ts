import { BaseEvent } from './base-event';

export class RemoveConfigurationValue extends BaseEvent {
  public settingPath?: string;

  constructor(settingPath: string) {
    super();
    this.settingPath = settingPath;
  }
}
