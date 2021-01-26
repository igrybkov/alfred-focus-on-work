import { BaseEvent } from './base-event';

export class RemoveConfigurationValueFromSet extends BaseEvent {
  public settingPath?: string;
  public key: any;

  constructor(settingPath: string, key: string) {
    super();
    this.settingPath = settingPath;
    this.key = key;
  }
}
