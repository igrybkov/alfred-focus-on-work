import { BaseEvent } from './base-event';

export class AddConfigurationValueToSet extends BaseEvent {
  public settingPath?: string;
  public value: any;

  constructor(settingPath: string, value: any) {
    super();
    this.settingPath = settingPath;
    this.value = value;
  }
}
