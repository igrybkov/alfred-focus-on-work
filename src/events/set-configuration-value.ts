import { BaseEvent } from './base-event';

export class SetConfigurationValue extends BaseEvent {
  public settingPath: string;
  public settingValue: any;

  constructor(settingPath: string, value: any) {
    super();
    this.settingPath = settingPath;
    this.settingValue = value;
  }
}
